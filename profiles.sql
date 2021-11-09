DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users (id),
    age       INT,
    city      TEXT,
    website  TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);