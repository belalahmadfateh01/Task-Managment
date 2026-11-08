import test from "node:test";
import assert from "node:assert/strict";
import { ReportsFilter, Pagination } from "../src/utils/apiFeature.js";
import { schemas, validate } from "../src/middlewares/validate.js";
import createCorsMiddleware from "../src/middlewares/cors.js";

test("pagination applies defaults and bounds page size", () => {
    assert.deepEqual(Pagination({}), { limit: 25, offset: 0 });
    assert.deepEqual(Pagination({ page: "3", limit: "10" }), { limit: 10, offset: 20 });
    assert.throws(() => Pagination({ limit: "101" }), { statusCode: 400 });
    assert.throws(() => Pagination({ page: "0" }), { statusCode: 400 });
});

test("report filters keep values parameterized and validate dates/status", () => {
    const result = ReportsFilter({ status: "pending", title: "weekly" });
    assert.deepEqual(result.values, ["pending", "%weekly%"]);
    assert.throws(() => ReportsFilter({ status: "unknown" }), { statusCode: 400 });
    assert.throws(() => ReportsFilter({ startDate: "2026-02-30" }), { statusCode: 400 });
});

test("registration only permits teacher role and enforces a password", () => {
    const req = { body: { f_name: "A", l_name: "B", user_name: "ab", email: "a@example.com", password: "short", role: "admin" } };
    const errors = schemas.register(req);
    assert.ok(errors.some(error => error.includes("password")));
    assert.ok(errors.some(error => error.includes("role")));
});

test("validation middleware reports malformed inputs as 400", () => {
    const req = { body: { email: "invalid", password: "x" } };
    let received;
    validate(schemas.login)(req, {}, error => { received = error; });
    assert.equal(received.statusCode, 400);
});

test("browser POST preflight returns CORS headers", () => {
    const headers = {};
    let responseStatus;
    let continued = false;
    const res = {
        setHeader: (name, value) => { headers[name.toLowerCase()] = value; },
        sendStatus: status => { responseStatus = status; },
        status: status => ({ json: body => { responseStatus = status; return body; } })
    };
    createCorsMiddleware(["http://localhost:3001"])(
        { method: "OPTIONS", headers: { origin: "http://localhost:3001" } },
        res,
        () => { continued = true; }
    );
    assert.equal(responseStatus, 204);
    assert.equal(headers["access-control-allow-origin"], "http://localhost:3001");
    assert.match(headers["access-control-allow-methods"], /POST/);
    assert.equal(continued, false);
});
