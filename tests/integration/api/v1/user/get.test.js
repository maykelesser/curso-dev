import session from "models/session";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("GET User Endpoint", () => {
    describe("Default user", () => {
        test("With valid session", async () => {
            const createdUser = await orchestrator.createUser({
                username: "UserWithValidSession",
            });

            const sessionObject = await orchestrator.createSession(
                createdUser.id,
            );

            const response = await fetch("http://localhost:3000/api/v1/user", {
                headers: {
                    Cookie: `session_id=${sessionObject.token}`,
                },
            });

            const responseBody = await response.json();
            const cacheControl = response.headers.get("Cache-Control");

            expect(response.status).toBe(200);
            expect(cacheControl).toBe("no-store, no-cache, max-age=0, must-revalidate");
            expect(responseBody).toEqual({
                id: createdUser.id,
                username: "UserWithValidSession",
                email: createdUser.email,
                password: createdUser.password,
                created_at: createdUser.created_at.toISOString(),
                updated_at: createdUser.updated_at.toISOString(),
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

            // Session Renewal Assertions
            const renewedSessionObject = await session.findOneValidByToken(
                sessionObject.token,
            );

            expect(
                renewedSessionObject.expires_at > sessionObject.expires_at,
            ).toBe(true);
            expect(
                renewedSessionObject.updated_at > sessionObject.updated_at,
            ).toBe(true);

            // Set-Cookie Assertions
            const parsedSetCookie = setCookieParser(response, {
                map: true,
            });

            expect(parsedSetCookie.session_id).toEqual({
                name: "session_id",
                value: renewedSessionObject.token,
                maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
                path: "/",
                httpOnly: true,
            });
        });

        test("With nonexistent session", async () => {
            const nonExistentToken =
                "9f65f54ac8cd23c21bcd7f1a8cc29badaf91d33027793dfb220c523440af5bcfd379605f7d26df72e574a354ae7e4131";

            const response = await fetch("http://localhost:3000/api/v1/user", {
                headers: {
                    Cookie: `session_id=${nonExistentToken}`,
                },
            });

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

            const response = await fetch("http://localhost:3000/api/v1/user", {
                headers: {
                    Cookie: `session_id=${sessionObject.token}`,
                },
            });

            const responseBody = await response.json();

            expect(response.status).toBe(401);
            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Unauthorized session token",
                action: "Check the session token or login again",
                status_code: 401,
            });
        });

        test("With 5 minutes left in session", async () => {
            jest.useFakeTimers({
                now: new Date(
                    Date.now() -
                        session.EXPIRATION_IN_MILLISECONDS +
                        5 * 60 * 1000,
                ), // 5 minutes left in session
            });

            const createdUser = await orchestrator.createUser({
                username: "UserWith5MinutesLeftInSession",
            });

            const sessionObject = await orchestrator.createSession(
                createdUser.id,
            );

            jest.useRealTimers(); // Restore time

            const response = await fetch("http://localhost:3000/api/v1/user", {
                headers: {
                    Cookie: `session_id=${sessionObject.token}`,
                },
            });

            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody).toEqual({
                id: createdUser.id,
                username: "UserWith5MinutesLeftInSession",
                email: createdUser.email,
                password: createdUser.password,
                created_at: createdUser.created_at.toISOString(),
                updated_at: createdUser.updated_at.toISOString(),
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

            // Session Renewal Assertions
            const renewedSessionObject = await session.findOneValidByToken(
                sessionObject.token,
            );

            expect(
                renewedSessionObject.expires_at > sessionObject.expires_at,
            ).toBe(true);
            expect(
                renewedSessionObject.updated_at > sessionObject.updated_at,
            ).toBe(true);

            // Set-Cookie Assertions
            const parsedSetCookie = setCookieParser(response, {
                map: true,
            });

            expect(parsedSetCookie.session_id).toEqual({
                name: "session_id",
                value: renewedSessionObject.token,
                maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
                path: "/",
                httpOnly: true,
            });
        });
    });
});
