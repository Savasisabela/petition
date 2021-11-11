module.exports.requireNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    next();
};
module.exports.requireLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    next();
};
module.exports.requireSigned = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/petition");
    }
    next();
};
module.exports.requireNotSigned = (req, res, next) => {
    if (req.session.sigId) {
        return res.redirect("/thanks");
    }
    next();
};
