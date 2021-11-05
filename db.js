const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "petition";

const db = spicedPg(
    `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

module.exports.addUser = (userFirst, userLast, userSign) => {
    const q = `INSERT INTO signatures (first, last, signature)
               VALUES($1, $2, $3)
               RETURNING id;`;
    const params = [userFirst, userLast, userSign];
    return db.query(q, params);
};

module.exports.getUser = () => {
    const q = `SELECT first, last FROM signatures;`;
    return db.query(q);
};

module.exports.getNumberOfSign = () => {
    const q = `SELECT COUNT(*) FROM signatures;`;
    return db.query(q);
};

module.exports.getSignature = (sigID) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const params = [sigID];
    return db.query(q, params);
};
