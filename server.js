const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");
const secret = process.env.secret || require("./secrets.json").secret;
const { hash, compare } = require("./bc.js");

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

// ************************** MIDDLEWARE *************************************

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

// app.use((req, res, next) => {
//     console.log(`${req.method} / ${req.url}`);
//     next();
// });

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: secret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

// ************************** REGISTER *************************************

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const { password, first, last, email } = req.body;
    hash(password)
        .then((hashedPw) => {
            db.addUser(first, last, email, hashedPw)
                .then((data) => {
                    req.session.userId = data.rows[0].id; // creating cookie from users table id row
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("err on addUser in register:", err);
                    res.render("register", {
                        error: `Something went wrong, please try again.`,
                    });
                });
        })
        .catch((err) => {
            console.log("err in POST register hash", err);
            res.sendStatus(500);
        });
});

// **************************** LOGIN ************************************

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.getUserByEmail(email)
        .then((data) => {
            const dataPw = data.rows[0].password;
            const inputPw = password;

            compare(inputPw, dataPw).then((match) => {
                if (match) {
                    req.session.userId = data.rows[0].id;
                    req.session.sigId = data.rows[0].sig_id;

                    if (req.session.sigId) {
                        res.redirect("/thanks");
                    } else {
                        res.redirect("/petition");
                    }
                } else {
                    res.render("login", {
                        error: "Email and password don't match, please try again",
                    });
                }
            });
        })
        .catch((err) => {
            console.log("error on post in login:", err);
            res.render("login", {
                error: "Email and password don't match, please try again",
            });
        });
});

// ********************************* PROFILE ***************************************

app.get("/profile", (req, res) => {
    const { userId } = req.session;
    if (userId) {
        res.render("profile");
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    let { age, city, website } = req.body;
    const { userId } = req.session;

    if (website && !website.startsWith("http://")) {
        website = "http://" + website;
    }

    age = age || null;

    if (city) {
        city = city.toUpperCase();
    }
    console.log("website", website);
    db.addProfile(age, city, website, userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("ERROR on addProfile", err);
            res.render("profile", {
                error: `Something went wrong, please try again.`,
            });
        });
});

// ********************************* EDIT PROFILE ******************************

app.get("/profile/edit", (req, res) => {
    const { userId } = req.session;

    if (userId) {
        db.getUserById(userId)
            .then((data) => {
                let rows = data.rows[0];
                res.render("edit", { rows });
            })
            .catch((err) => {
                console.log("error on profile edit:", err);
                res.render("edit", {
                    error: "Something went wrong, please try again",
                });
            });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile/edit", (req, res) => {
    let { password, first, last, email, age, city, website } = req.body;
    const { userId } = req.session;

    if (website && !website.startsWith("http://")) {
        website = "http://" + website;
    }

    age = age || null;

    if (city) {
        city = city.toUpperCase();
    }

    if (password) {
        hash(password)
            .then((hashedPw) => {
                return db.updateUserWithPassword({
                    userId,
                    first,
                    last,
                    email,
                    hashedPw,
                });
            })
            .then(() => {
                return db.upsertProfile({ age, city, website, userId });
            })
            .then(() => {
                return res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in password update:", err);
                res.render("edit", {
                    error: "Something went wrong, please try again",
                });
            });
    } else {
        db.updateUser({ userId, first, last, email })
            .then(() => {
                return db.upsertProfile({ age, city, website, userId });
            })
            .then(() => {
                return res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error on update User:", err);
                res.render("edit", {
                    error: "Something went wrong, please try again",
                });
            });
    }
});

// ********************************** PETITION (sign) ***********************************

app.get("/petition", (req, res) => {
    const { sigId, userId } = req.session;

    if (userId) {
        if (sigId) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    const userID = req.session.userId;
    console.log("userID", userID);

    db.addSignature(req.body.signature, userID)
        .then((data) => {
            console.log("data in addSignature:", data);
            req.session.sigId = data.rows[0].id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err on addUser in post petition:", err);
            res.render("petition", {
                error: `Something went wrong, please try again.`,
            });
        });
});

// **************************** THANKS ************************************

app.get("/thanks", (req, res) => {
    const { sigId, userId } = req.session;

    if (userId && sigId) {
        Promise.all([db.getNumberOfSign(), db.getSignature(sigId)])
            .then((data) => {
                // console.log("data in promise all", data);
                const count = data[0].rows[0].count;
                const signature = data[1].rows[0].signature;

                res.render("thanks", {
                    count,
                    signature,
                });
            })
            .catch((err) => {
                console.log("ERROR ON sigId in THANKS:", err);
                res.sendStatus(500);
            });
    } else {
        res.redirect("/register");
    }
});

// ******************************* SIGNERS *************************************

app.get("/signers", (req, res) => {
    const { sigId, userId } = req.session;

    if (userId) {
        if (sigId) {
            db.getSigners()
                .then((data) => {
                    const { rows } = data;
                    res.render("signers", {
                        rows,
                    });
                })
                .catch((err) => {
                    console.log("ERROR ON sigId in SIGNERS:", err);
                    res.sendStatus(500);
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.get("/signers/:city", (req, res) => {
    const { sigId, userId } = req.session;
    let { city } = req.params;
    if (city) {
        city = city.toLowerCase();
    }

    if (userId) {
        if (sigId) {
            db.getSignersCity(city)
                .then((data) => {
                    const { rows } = data;
                    res.render("city", {
                        rows,
                        city,
                    });
                })
                .catch((err) => {
                    console.log("ERROR ON sigId in signers CITY:", err);
                    res.sendStatus(500);
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
});

// ********************************** LOGOUT ****************************************

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server listening 😗✌")
);
