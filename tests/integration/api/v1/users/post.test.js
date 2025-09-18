import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("POST Users Endpoint", () => {
    describe("Anonymous user", () => {
        test("With unique and valid data", async () => {
            const response = await fetch("http://localhost:3000/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "test",
                    email: "test@test.com",
                    password: "test123@!",
                }),
            });
            const responseBody = await response.json();
            expect(response.status).toBe(201);
            expect(responseBody).toEqual({
                id: responseBody.id,
                username: "test",
                email: "test@test.com",
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

            const userInDatabase = await user.findOneByUsername("test");
            const correctPasswordMatch = await password.compare(
                "test123@!",
                userInDatabase.password,
            );
            const incorrectPasswordMatch = await password.compare(
                "test123@!1",
                userInDatabase.password,
            );

            expect(correctPasswordMatch).toBe(true);
            expect(incorrectPasswordMatch).toBe(false);
        });

        test("With duplicated e-mail", async () => {
            const response = await fetch("http://localhost:3000/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "test01",
                    email: "test01@test.com",
                    password: "test123@!",
                }),
            });
            expect(response.status).toBe(201);

            const response2 = await fetch(
                "http://localhost:3000/api/v1/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "test02",
                        email: "Test01@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const response2Body = await response2.json();
            expect(response2.status).toBe(400);
            expect(response2Body).toEqual({
                name: "ValidationError",
                message: "E-mail already exists",
                action: "Use another e-mail for this operation",
                status_code: 400,
            });
        });

        test("With duplicated username", async () => {
            const response = await fetch("http://localhost:3000/api/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "test03",
                    email: "test02@test.com",
                    password: "test123@!",
                }),
            });
            expect(response.status).toBe(201);

            const response2 = await fetch(
                "http://localhost:3000/api/v1/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "Test03",
                        email: "Test03@test.com",
                        password: "test123@!",
                    }),
                },
            );
            const response2Body = await response2.json();
            expect(response2.status).toBe(400);
            expect(response2Body).toEqual({
                name: "ValidationError",
                message: "Username already exists",
                action: "Use another username for this operation",
                status_code: 400,
            });
        });
    });
});
