const express = require("express");
const router = express.Router();
const db = require("../db.js");
const {
    requireLoggedIn,
    requireSigned,
} = require("../middleware/authorization.js");

// **************************** THANKS ************************************

router.get("/thanks", requireLoggedIn, requireSigned, (req, res) => {
    const { sigId } = req.session;

    Promise.all([db.getNumberOfSign(), db.getSignature(sigId)])
        .then((data) => {
            // console.log("data in promise all", data);
            const count = data[0].rows[0].count;
            const signature = data[1].rows[0].signature;

            return res.render("thanks", {
                count,
                signature,
            });
        })
        .catch((err) => {
            console.log("error on thanks:", err);
            return res.sendStatus(500);
        });
});

router.post("/signature/delete", requireLoggedIn, requireSigned, (req, res) => {
    let { userId } = req.session;
    db.deleteSignature(userId)
        .then(() => {
            req.session.sigId = null;
            return res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error on deleteSignature:", err);
            return res.render("thanks", {
                error: "Something went wrong, please try again",
            });
        });
});

module.exports.thanksRouter = router;
