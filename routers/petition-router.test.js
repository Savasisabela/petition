const supertest = require("supertest");
const { app } = require("../server");
const cookieSess = require("cookie-session");

test("GET /petition redirects to /register when logged out", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/register")).toBe(true);
        });
});

test("GET /petition redirects to /thanks when already signed", () => {
    const fakeSess = { userId: 2, sigId: 4 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/thanks")).toBe(true);
        });
});

test("POST /petition redirects to /thanks when already signed", () => {
    const fakeSess = { userId: 2, sigId: 4 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .post("/petition")
        .send("alalaooooo")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/thanks")).toBe(true);
        });
});
