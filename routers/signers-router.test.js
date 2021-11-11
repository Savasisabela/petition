const supertest = require("supertest");
const { app } = require("../server");
const cookieSess = require("cookie-session");

test("GET /signers redirects to /petition when not signed yet", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
            console.log(fakeSess);
        });
});
