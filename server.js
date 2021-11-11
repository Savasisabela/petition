const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const secret = process.env.secret || require("./secrets.json").secret;

exports.app = app;

// const {
//     requireNotLoggedIn,
//     requireLoggedIn,
//     requireNotSigned,
//     requireSigned,
// } = require("./middleware/authorization.js");

const { authRouter } = require("./routers/auth-router.js");
const { profileRouter } = require("./routers/profile-router.js");
const { petitionRouter } = require("./routers/petition-router.js");
const { thanksRouter } = require("./routers/thanks-router.js");
const { signersRouter } = require("./routers/signers-router.js");

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

// ********************** ROUTER MIDDLEWARE ************************

app.use(authRouter);
app.use("/petition", petitionRouter);
app.use("/profile", profileRouter);
app.use(thanksRouter);
app.use("/signers", signersRouter);

// *****************************************************************

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("petition server listening 😗✌")
    );
}
