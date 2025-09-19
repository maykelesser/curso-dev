import session from "models/session";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("POST Sessions Endpoint", () => {
    describe("Anonymous user", () => {
        test("With incorrect `email` but correct `password`", async () => {
            await orchestrator.createUser({
                password: "test123@!",
            });

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "incorrecttest@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const responseBody = await response.json();

            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Authentication data is invalid.",
                action: "Verify the authentication data and try again.",
                status_code: 401,
            });
        });

        test("With correct `email` but incorrect `password`", async () => {
            await orchestrator.createUser({
                email: "test@test.com",
            });

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "test@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const responseBody = await response.json();

            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Authentication data is invalid.",
                action: "Verify the authentication data and try again.",
                status_code: 401,
            });
        });

        test("With incorrect `email` and incorrect `password`", async () => {
            await orchestrator.createUser();

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "test@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const responseBody = await response.json();

            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Authentication data is invalid.",
                action: "Verify the authentication data and try again.",
                status_code: 401,
            });
        });

        test("With correct `email` and correct `password`", async () => {
            const createdUser = await orchestrator.createUser({
                email: "test1@test.com",
                password: "test123@!",
            });

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "test1@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const responseBody = await response.json();

            expect(response.status).toBe(201);
            expect(responseBody).toEqual({
                id: responseBody.id,
                token: responseBody.token,
                user_id: createdUser.id,
                expires_at: responseBody.expires_at,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
            expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

            const expiresAt = new Date(responseBody.expires_at);
            const createdAt = new Date(responseBody.created_at);

            // We need to set milliseconds to zero because there's no way to match the exact expiration time
            // Due to the processing time.
            expiresAt.setMilliseconds(0);
            createdAt.setMilliseconds(0);
            expect(expiresAt - createdAt).toBe(
                session.EXPIRATION_IN_MILLISECONDS,
            );

            // Check the cookie that was set
            const parsedSetCookie = setCookieParser(
                response.headers.get("Set-Cookie"),
            );
            expect(parsedSetCookie).toEqual([
                {
                    name: "session_id",
                    value: responseBody.token,
                    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
                    path: "/",
                    httpOnly: true,
                },
            ]);
        });
    });
});
