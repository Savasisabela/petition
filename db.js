const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "petition";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

// *********************** ADD to tables *******************************

module.exports.addUser = (userFirst, userLast, userEmail, userPassword) => {
    const q = `INSERT INTO users (first, last, email, password)
               VALUES($1, $2, $3, $4)
               RETURNING id;`;
    const params = [userFirst, userLast, userEmail, userPassword];
    return db.query(q, params);
};

module.exports.addSignature = (userSign, userID) => {
    const q = `INSERT INTO signatures (signature, user_id)
               VALUES($1, $2)
               RETURNING id;`;
    const params = [userSign, userID];
    return db.query(q, params);
};

module.exports.addProfile = (userAge, userCity, userWebsite, userID) => {
    const q = `INSERT INTO profiles (age, city, website, user_id)
                VALUES($1, $2, $3, $4);`;
    const params = [userAge, userCity, userWebsite, userID];
    return db.query(q, params);
};

// ********************* GET information from table **********************

module.exports.getSigners = () => {
    const q = `SELECT * FROM signatures
                LEFT JOIN users
                ON signatures.user_id = users.id
                LEFT JOIN profiles
                ON signatures.user_id = profiles.user_id;`;
    return db.query(q);
};

module.exports.getUserById = (userId) => {
    const q = `SELECT * FROM users
                LEFT JOIN profiles
                ON users.id = profiles.user_id
                WHERE users.id = $1;`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.getSignersCity = (city) => {
    const q = `SELECT * FROM signatures
                LEFT JOIN users
                ON signatures.user_id = users.id
                LEFT JOIN profiles
                ON signatures.user_id = profiles.user_id
                WHERE city = $1;`;
    const params = [city];
    return db.query(q, params);
};

module.exports.getNumberOfSign = () => {
    const q = `SELECT COUNT(*) FROM signatures;`;
    return db.query(q);
};

module.exports.getSignature = (sigID) => {
    const q = `SELECT signature FROM signatures WHERE id = $1;`;
    const params = [sigID];
    return db.query(q, params);
};

module.exports.getUserByEmail = (userEmail) => {
    const q = `SELECT users.password, users.id, signatures.id AS sig_id FROM users 
                LEFT JOIN signatures 
                ON users.id = signatures.user_id
                WHERE email = $1;`;
    const params = [userEmail];
    return db.query(q, params);
};

// ************************ UPDATE information from table ******************************

module.exports.updateUser = ({ first, last, email, userId }) => {
    const q = `UPDATE users
                SET first =$1,
                last = $2,
                email = $3
                WHERE id = $4;`;
    const params = [first, last, email, userId];
    return db.query(q, params);
};

module.exports.updateUserWithPassword = ({
    userId,
    first,
    last,
    email,
    hashedPw,
}) => {
    const q = `UPDATE users 
                SET first = $1, 
                last = $2, 
                email = $3, 
                password = $4
                WHERE id = $5;`;
    const params = [first, last, email, hashedPw, userId];
    return db.query(q, params);
};

module.exports.upsertProfile = ({ userId, age, city, website }) => {
    const q = `INSERT INTO profiles (age, city, website, user_id)
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (user_id) DO UPDATE 
                SET age = $1, city = $2, website = $3;`;
    const params = [age, city, website, userId];
    return db.query(q, params);
};

module.exports.deleteSignature = (userId) => {
    const q = `DELETE FROM signatures
                WHERE user_id = $1;`;
    const params = [userId];
    return db.query(q, params);
};

// ================================ query syntax ====================================

// ********* updating values **************
// UPDATE nameOfTable SET clmnName=value, clmnName=value
// WHERE clmnName=value;

// ************ UPSERT (insert value if unexistent, updating if exists) ******************
// INSERT INTO nameOfTable (clm, clmn, clmn) VALUES (value, value,value)
// ON CONFLICT (conflictcolumn) DO UPDATE SET clmn=value, clmnName=value,clmnName=value;

// ************ deleting from table DONT FORGET CONDITION ************************
// DELETE FROM nameOfTable WHERE clmnName=value;
