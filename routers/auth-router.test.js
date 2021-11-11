const supertest = require("supertest");
const { app } = require("../server");
const cookieSess = require("cookie-session");

test("GET /register is redirected to /petition when logged in", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
            console.log(fakeSess);
        });
});

test("GET /login is redirected to /petition when logged in", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
            console.log(fakeSess);
        });
});
