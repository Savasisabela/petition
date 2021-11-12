const express = require("express");
const router = express.Router();
const db = require("../db.js");
const {
    requireLoggedIn,
    requireNotSigned,
} = require("../middleware/authorization.js");

router.use(requireLoggedIn, requireNotSigned);

// *************************** SIGN THE PETITION *****************************

router.get("/", (req, res) => {
    const { userId } = req.session;
    db.getUserById(userId)
        .then((data) => {
            let rows = data.rows[0];
            return res.render("petition", { rows });
        })
        .catch((err) => {
            console.log("error on profile edit:", err);
            return res.render("petition", {
                error: "Something went wrong, please try again",
            });
        });
});

router.post("/", (req, res) => {
    const userID = req.session.userId;
    console.log("userID", userID);

    db.addSignature(req.body.signature, userID)
        .then((data) => {
            req.session.sigId = data.rows[0].id;

            return res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err on addUser in post petition:", err);
            return res.render("petition", {
                error: `Something went wrong, please try again.`,
            });
        });
});

module.exports.petitionRouter = router;
