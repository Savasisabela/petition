const express = require("express");
const router = express.Router();
const db = require("../db.js");
const { hash } = require("../bc.js");
const { requireLoggedIn } = require("../middleware/authorization.js");

router.use(requireLoggedIn);

// ********************************* PROFILE ***************************************

router.get("/", (req, res) => {
    return res.render("profile");
});

router.post("/", (req, res) => {
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
            return res.redirect("/petition");
        })
        .catch((err) => {
            console.log("ERROR on addProfile", err);
            return res.render("profile", {
                error: `Something went wrong, please try again.`,
            });
        });
});

// ********************************* EDIT PROFILE ******************************

router.get("/edit", (req, res) => {
    const { userId } = req.session;
    db.getUserById(userId)
        .then((data) => {
            let rows = data.rows[0];
            return res.render("edit", { rows });
        })
        .catch((err) => {
            console.log("error on profile edit:", err);
            return res.render("edit", {
                error: "Something went wrong, please try again",
            });
        });
});

router.post("/edit", (req, res) => {
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
                return res.render("edit", {
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
                return res.render("edit", {
                    error: "Something went wrong, please try again",
                });
            });
    }
});

module.exports.profileRouter = router;
