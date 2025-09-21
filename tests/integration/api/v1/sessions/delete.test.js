import session from "models/session";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("DELETE Sessions Endpoint", () => {
    describe("Default user", () => {
        test("With valid session", async () => {
            const createdUser = await orchestrator.createUser({
                username: "UserWithValidSession",
            });

            const sessionObject = await orchestrator.createSession(
                createdUser.id,
            );

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    headers: {
                        Cookie: `session_id=${sessionObject.token}`,
                    },
                    method: "DELETE",
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody).toEqual({
                id: sessionObject.id,
                token: sessionObject.token,
                user_id: sessionObject.user_id,
                expires_at: responseBody.expires_at,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
            expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

            expect(
                responseBody.expires_at <
                    sessionObject.expires_at.toISOString(),
            ).toBe(true);
            expect(
                responseBody.updated_at >
                    sessionObject.updated_at.toISOString(),
            ).toBe(true);

            // Set-Cookie assertions
            const parsedSetCookie = setCookieParser(response, {
                map: true,
            });

            expect(parsedSetCookie.session_id).toEqual({
                name: "session_id",
                value: "invalid",
                maxAge: -1,
                path: "/",
                httpOnly: true,
            });

            // Double check assertions
            const doubleCheckResponse = await fetch(
                "http://localhost:3000/api/v1/user",
                {
                    headers: {
                        Cookie: `session_id=${sessionObject.token}`,
                    },
                },
            );

            expect(doubleCheckResponse.status).toBe(401);

            const doubleCheckResponseBody = await doubleCheckResponse.json();

            expect(doubleCheckResponseBody).toEqual({
                name: "UnauthorizedError",
                message: "Unauthorized session token",
                action: "Check the session token or login again",
                status_code: 401,
            });
        });

        test("With nonexistent session", async () => {
            const nonExistentToken =
                "9f65f54ac8cd23c21bcd7f1a8cc29badaf91d33027793dfb220c523440af5bcfd379605f7d26df72e574a354ae7e4131";

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    headers: {
                        Cookie: `session_id=${nonExistentToken}`,
                    },
                    method: "DELETE",
                },
            );

            const responseBody = await response.json();
            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Unauthorized session token",
                action: "Check the session token or login again",
                status_code: 401,
            });
        });

        test("With expired session", async () => {
            jest.useFakeTimers({
                now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS), // Time travel - 30 days ago
            });

            const createdUser = await orchestrator.createUser({
                username: "UserWithExpiredSession",
            });

            const sessionObject = await orchestrator.createSession(
                createdUser.id,
            );

            jest.useRealTimers(); // Restore time

            const response = await fetch(
                "http://localhost:3000/api/v1/sessions",
                {
                    headers: {
                        Cookie: `session_id=${sessionObject.token}`,
                    },
                    method: "DELETE",
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Unauthorized session token",
                action: "Check the session token or login again",
                status_code: 401,
            });
        });
    });
});
