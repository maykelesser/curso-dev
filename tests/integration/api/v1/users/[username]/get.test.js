import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("GET Users (By Username) Endpoint", () => {
    describe("Anonymous user", () => {
        test("With exact keys match", async () => {
            await orchestrator.createUser({
                username: "SameCase",
                email: "same.case@test.com",
                password: "testKey01@!",
            });

            const response2 = await fetch(
                "http://localhost:3000/api/v1/users/SameCase",
            );

            const response2Body = await response2.json();

            expect(response2.status).toBe(200);
            expect(response2Body).toEqual({
                id: response2Body.id,
                username: "SameCase",
                email: "same.case@test.com",
                password: response2Body.password,
                created_at: response2Body.created_at,
                updated_at: response2Body.updated_at,
            });
            expect(uuidVersion(response2Body.id)).toBe(4);
            expect(Date.parse(response2Body.created_at)).not.toBeNaN();
            expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
        });

        test("With case mismatch", async () => {
            await orchestrator.createUser({
                username: "SameCase1",
                email: "same.case1@test.com",
                password: "testKey01@!",
            });

            const response2 = await fetch(
                "http://localhost:3000/api/v1/users/samecase1",
            );

            const response2Body = await response2.json();

            expect(response2.status).toBe(200);
            expect(response2Body).toEqual({
                id: response2Body.id,
                username: "SameCase1",
                email: "same.case1@test.com",
                password: response2Body.password,
                created_at: response2Body.created_at,
                updated_at: response2Body.updated_at,
            });
            expect(uuidVersion(response2Body.id)).toBe(4);
            expect(Date.parse(response2Body.created_at)).not.toBeNaN();
            expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
        });

        test("With non-existent username", async () => {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/nonExistentUsername",
            );

            const responseBody = await response.json();

            expect(response.status).toBe(404);
            expect(responseBody).toEqual({
                name: "NotFoundError",
                message: "Username not found",
                action: "Check the username or search for another user",
                status_code: 404,
            });
        });
    });
});
