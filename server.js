const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");
const { secret } = process.env || require("./secrets.json");
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

app.use((req, res, next) => {
    console.log(`${req.method} / ${req.url}`);
    next();
});

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
    db.getUser(email)
        .then((data) => {
            const dataPw = data.rows[0].password;
            const inputPw = password;

            compare(inputPw, dataPw).then((match) => {
                if (match) {
                    req.session.userId = data.rows[0].id;
                    req.session.signatureId = data.rows[0].sig_id;

                    if (req.session.signatureId) {
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
    res.render("profile");
});

app.post("/profile", (req, res) => {
    let { age, city, website } = req.body;
    const userID = req.session.userId;

    if (website && !website.startsWith("http://")) {
        website = "http://" + website;
    }

    age = age || null;

    if (city) {
        city = city.toLowerCase();
    }
    console.log("website", website);
    db.addProfile(age, city, website, userID)
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
    // insert logic here
});

app.post("/profile/edit", (req, res) => {
    const { password } = req.body;

    if (password) {
        hash(password)
            .then((hashedPw) => {
                return db.updateUserWithPassword(hashedPw);
            })
            .then(() => {
                db.upsertProfile();
            })
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in password update:", err);
                res.render("edit", {
                    error: "try again",
                });
            });
    } else {
        db.updateUser()
            .then(() => {
                return db.upsertProfile();
            })
            .then(() => {
                res.redirect("/thanks");
            });
    }
});

// ********************************** PETITION (sign) ***********************************

app.get("/petition", (req, res) => {
    const sigID = req.session.signatureId;
    const userID = req.session.userId;

    if (userID) {
        if (sigID) {
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
            req.session.signatureId = data.rows[0].id;

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
    const sigID = req.session.signatureId;
    // console.log("sigID", sigID);

    Promise.all([db.getNumberOfSign(), db.getSignature(sigID)])
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
            console.log("ERROR ON sigID in THANKS:", err);
            res.sendStatus(500);
        });
});

// ******************************* SIGNERS *************************************

app.get("/signers", (req, res) => {
    const sigID = req.session.signatureId;

    if (sigID) {
        db.getSigners()
            .then((data) => {
                const { rows } = data;
                res.render("signers", {
                    rows,
                });
            })
            .catch((err) => {
                console.log("ERROR ON sigID in SIGNERS:", err);
                res.sendStatus(500);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers/:city", (req, res) => {
    const sigID = req.session.signatureId;
    const { city } = req.params;
    const cityLower = city.toLowerCase();
    if (sigID) {
        db.getSignersCity(cityLower)
            .then((data) => {
                const { rows } = data;
                res.render("city", {
                    rows,
                    cityLower,
                });
            })
            .catch((err) => {
                console.log("ERROR ON sigID in signers CITY:", err);
                res.sendStatus(500);
            });
    } else {
        res.redirect("/petition");
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
