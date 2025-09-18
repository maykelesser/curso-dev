import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
});

describe("PATCH Users (By Username) Endpoint", () => {
    describe("Anonymous user", () => {
        test("With non-existent username", async () => {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/nonExistentUsername",
                {
                    method: "PATCH",
                },
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

        test("With duplicated username", async () => {
            await orchestrator.createUser({
                username: "user1",
            });

            await orchestrator.createUser({
                username: "user2",
            });

            const response = await fetch(
                "http://localhost:3000/api/v1/users/user2",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "user1",
                    }),
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody).toEqual({
                name: "ValidationError",
                message: "Username already exists",
                action: "Use another username for this operation",
                status_code: 400,
            });
        });

        test("With same username but different case", async () => {
            const user1Response = await fetch(
                "http://localhost:3000/api/v1/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "user3",
                        email: "user3@test.com",
                        password: "test123@!",
                    }),
                },
            );
            expect(user1Response.status).toBe(201);

            const response = await fetch(
                "http://localhost:3000/api/v1/users/user3",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "User3",
                    }),
                },
            );

            expect(response.status).toBe(200);
        });

        test("With duplicated e-mail", async () => {
            await orchestrator.createUser({
                email: "user4@test.com",
            });

            const createdUser2 = await orchestrator.createUser({
                email: "user5@test.com",
            });

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser2.username}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "user4@test.com",
                    }),
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(400);
            expect(responseBody).toEqual({
                name: "ValidationError",
                message: "E-mail already exists",
                action: "Use another e-mail for this operation",
                status_code: 400,
            });
        });

        test("With unique username", async () => {
            const createdUser = await orchestrator.createUser({
                username: "user6",
            });

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: "user7",
                    }),
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody).toEqual({
                id: responseBody.id,
                username: "user7",
                email: createdUser.email,
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
            expect(responseBody.updated_at > responseBody.created_at).toBe(
                true,
            );
        });

        test("With unique e-mail", async () => {
            const createdUser = await orchestrator.createUser({
                email: "user8@test.com",
            });

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: "user9@test.com",
                    }),
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody).toEqual({
                id: responseBody.id,
                username: createdUser.username,
                email: "user9@test.com",
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
            expect(responseBody.updated_at > responseBody.created_at).toBe(
                true,
            );
        });

        test("With new password", async () => {
            const createdUser = await orchestrator.createUser();

            const response = await fetch(
                `http://localhost:3000/api/v1/users/${createdUser.username}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password: "test123@!1",
                    }),
                },
            );

            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody).toEqual({
                id: responseBody.id,
                username: createdUser.username,
                email: createdUser.email,
                password: responseBody.password,
                created_at: responseBody.created_at,
                updated_at: responseBody.updated_at,
            });
            expect(uuidVersion(responseBody.id)).toBe(4);
            expect(Date.parse(responseBody.created_at)).not.toBeNaN();
            expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
            expect(responseBody.updated_at > responseBody.created_at).toBe(
                true,
            );

            const userInDatabase = await user.findOneByUsername(
                createdUser.username,
            );
            const correctPasswordMatch = await password.compare(
                "test123@!1",
                userInDatabase.password,
            );
            const incorrectPasswordMatch = await password.compare(
                "test123@!",
                userInDatabase.password,
            );

            expect(correctPasswordMatch).toBe(true);
            expect(incorrectPasswordMatch).toBe(false);
        });
    });
});
