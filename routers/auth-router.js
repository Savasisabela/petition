const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { hash, compare } = require("../bc.js");
const { requireNotLoggedIn } = require("../middleware/authorization.js");

// ************************** REGISTER *************************************

router.get("/", requireNotLoggedIn, (req, res) => {
    return res.redirect("/register");
});

router.get("/register", requireNotLoggedIn, (req, res) => {
    return res.render("register", {
        layout: "main",
    });
});

router.post("/register", requireNotLoggedIn, (req, res) => {
    const { password, first, last, email } = req.body;
    hash(password)
        .then((hashedPw) => {
            db.addUser(first, last, email, hashedPw)
                .then((data) => {
                    req.session.userId = data.rows[0].id; // creating cookie from users table id row
                    return res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("err on addUser in register:", err);
                    return res.render("register", {
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

router.get("/login", requireNotLoggedIn, (req, res) => {
    return res.render("login", {
        layout: "main",
    });
});

router.post("/login", requireNotLoggedIn, (req, res) => {
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
                        return res.redirect("/thanks");
                    } else {
                        return res.redirect("/petition");
                    }
                } else {
                    return res.render("login", {
                        error: "Email and password don't match, please try again",
                    });
                }
            });
        })
        .catch((err) => {
            console.log("error on post in login:", err);
            return res.render("login", {
                error: "Email and password don't match, please try again",
            });
        });
});

// ********************************** LOGOUT ****************************************

router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

module.exports.authRouter = router;
