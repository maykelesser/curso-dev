import user from "models/user";
import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
    await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
    let activationTokenId;
    let createUserResponseBody;
    let createSessionResponseBody;

    test("Create user account", async () => {
        const createUserResponse = await fetch(
            "http://localhost:3000/api/v1/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "username-test",
                    email: "test@test.com",
                    password: "test123@!",
                }),
            },
        );

        expect(createUserResponse.status).toBe(201);

        createUserResponseBody = await createUserResponse.json();
        expect(createUserResponseBody).toEqual({
            id: createUserResponseBody.id,
            username: "username-test",
            email: "test@test.com",
            password: createUserResponseBody.password,
            features: ["read:activation_token"],
            created_at: createUserResponseBody.created_at,
            updated_at: createUserResponseBody.updated_at,
        });
    });

    test("Receive activation email", async () => {
        const lastEmail = await orchestrator.getLastEmail();
        activationTokenId = orchestrator.extractUUID(lastEmail.text);
        const activationTokenObject =
            await activation.findOneValidById(activationTokenId);

        expect(lastEmail).not.toBeNull();
        expect(lastEmail.sender).toBe("<contact@test.com>");
        expect(lastEmail.recipients[0]).toBe("<test@test.com>");
        expect(lastEmail.subject).toBe("Activate your account");
        expect(lastEmail.text).toContain("username-test");
        expect(activationTokenObject.used_at).toBeNull();
        expect(activationTokenObject.user_id).toEqual(
            createUserResponseBody.id,
        );
        expect(lastEmail.text).toContain(
            `${webserver.origin}/signup/activate/${activationTokenId}`,
        );
    });

    test("Activate user account", async () => {
        const activateUserResponse = await fetch(
            `http://localhost:3000/api/v1/activations/${activationTokenId}`,
            {
                method: "PATCH",
            },
        );

        expect(activateUserResponse.status).toBe(200);

        const activationResponseBody = await activateUserResponse.json();

        expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

        const activatedUser = await user.findOneByUsername("username-test");
        expect(activatedUser.features).toEqual([
            "create:session",
            "read:session",
        ]);
    });

    test("Login to user account", async () => {
        const createSessionResponse = await fetch(
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

        expect(createSessionResponse.status).toBe(201);
        createSessionResponseBody = await createSessionResponse.json();
        expect(createSessionResponseBody.user_id).toBe(
            createUserResponseBody.id,
        );
    });

    test("Get user information", async () => {
        const userResponse = await fetch("http://localhost:3000/api/v1/user", {
            headers: {
                Cookie: `session_id=${createSessionResponseBody.token}`,
            },
        });
        const userResponseBody = await userResponse.json();

        expect(userResponse.status).toBe(200);
        expect(userResponseBody.id).toBe(createUserResponseBody.id);
    });
});
