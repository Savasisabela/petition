const express = require("express");
const router = express.Router();
const db = require("../db.js");
const {
    requireLoggedIn,
    requireSigned,
} = require("../middleware/authorization.js");

router.use(requireLoggedIn, requireSigned);

// ******************************* SIGNERS *************************************

router.get("/", (req, res) => {
    db.getSigners()
        .then((data) => {
            const { rows } = data;
            return res.render("signers", {
                rows,
            });
        })
        .catch((err) => {
            console.log("ERROR ON sigId in SIGNERS:", err);
            return res.sendStatus(500);
        });
});

router.get("/:city", (req, res) => {
    let { city } = req.params;
    city = city.toUpperCase();
    city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    console.log(city);

    db.getSignersCity(city)
        .then((data) => {
            const { rows } = data;
            return res.render("city", {
                rows,
                city,
            });
        })
        .catch((err) => {
            console.log("ERROR ON sigId in signers CITY:", err);
            return res.sendStatus(500);
        });
});

module.exports.signersRouter = router;
