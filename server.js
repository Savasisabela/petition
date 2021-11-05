const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");
const { secret } = require("./secrets.json");

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

app.get("/petition", (req, res) => {
    const sigID = req.session.signatureId;

    if (sigID) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    db.addUser(req.body.first, req.body.last, req.body.signature)
        .then((result) => {
            req.session.signatureId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err on addUser:", err);
            res.render("petition");
        });
});

app.get("/thanks", (req, res) => {
    const sigID = req.session.signatureId;

    if (sigID) {
        Promise.all([db.getNumberOfSign(), db.getSignature(sigID)]).then(
            (data) => {
                const count = data[0].rows[0].count;
                const signature = data[1].rows[0].signature;

                res.render("thanks", {
                    count,
                    signature,
                });
            }
        );
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    const sigID = req.session.signatureId;

    if (sigID) {
        db.getUser().then((data) => {
            const { rows } = data;
            res.render("signers", {
                rows,
            });
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/petition");
});

app.listen(8080, () => console.log("petition server listening 😗✌"));
