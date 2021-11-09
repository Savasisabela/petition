const { hash, compare, genSalt } = require("bcryptjs");

exports.hash = (password) => {
    return genSalt().then((salt) => {
        // this hash function is bcryptjs hash function
        return hash(password, salt);
    });
};

exports.compare = compare; //compare will compare what the user just typed in with our hashed password in the database

// with our hashed password in the database

// takes 2 arguments
// compare(arg1, arg2)
// arg1 - the password the user just sent from the client
// arg2 - hashed password stored in the database for that user (we can get this hashed password bc we have the user's email - run a query to find the hashed password related to that email)

// compare will hash the password provided
// if it matches, returns TRUE
// if it doesn't returns FALSE
