const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db.js");

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

app.use(require("cookie-parser")());

app.get("/petition", (req, res) => {
    const hasCookie = req.cookies.signed;
    if (hasCookie) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    db.addUser(req.body.first, req.body.last, "signature")
        .then(() => {
            res.cookie("signed", "true");
            res.redirect("thanks");
        })
        .catch((err) => {
            console.log("err on addUser:", err);
            res.render("petition");
        });
});

app.get("/thanks", (req, res) => {
    const hasCookie = req.cookies.signed;
    if (hasCookie) {
        db.getNumberOfSign().then((data) => {
            const count = data.rows[0].count;
            res.render("thanks", {
                count,
            });
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    const hasCookie = req.cookies.signed;

    if (hasCookie) {
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

app.listen(8080, () => console.log("petition server listening 😗✌"));
