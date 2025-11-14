import retry from "async-retry";
import user from "models/user";
import session from "models/session";
import database from "infra/database";
import migrator from "models/migrator";
import activation from "models/activation";
import { faker } from "@faker-js/faker";

const EMAIL_HTTP_URL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
    await waitForEmailServer();
    await waitForWebServer();
}

async function waitForWebServer() {
    return retry(fetchStatusPage, {
        retries: 100,
        minTimeout: 100,
        maxTimeout: 1000,
    });
}

async function waitForEmailServer() {
    return retry(fetchEmailServerStatus, {
        retries: 100,
        minTimeout: 100,
        maxTimeout: 1000,
    });
}

async function fetchEmailServerStatus() {
    const response = await fetch(`${EMAIL_HTTP_URL}`);
    if (response.status !== 200) {
        throw new Error();
    }
}

async function fetchStatusPage() {
    const response = await fetch("http://localhost:3000/api/v1/status");

    if (response.status !== 200) {
        throw new Error();
    }
}

async function clearDatabase() {
    await database.query("DROP SCHEMA public cascade;");
    await database.query("CREATE SCHEMA public;");
}

async function runPendingMigrations() {
    await migrator.runPendingMigrations();
}

async function createUser(userObject) {
    return await user.create({
        username:
            userObject?.username ||
            faker.internet.username().replace(/[_.-]/g, ""),
        email: userObject?.email || faker.internet.email(),
        password: userObject?.password || "validPassword",
    });
}

async function createSession(userId) {
    return await session.create(userId);
}

async function deleteAllEmails() {
    await fetch(`${EMAIL_HTTP_URL}/messages`, {
        method: "DELETE",
    });
}

async function getLastEmail() {
    const response = await fetch(`${EMAIL_HTTP_URL}/messages`);
    const body = await response.json();
    const lastEmailItem = body.pop();

    if (!lastEmailItem) {
        return null;
    }

    const emailTextResponse = await fetch(
        `${EMAIL_HTTP_URL}/messages/${lastEmailItem.id}.plain`,
    );
    lastEmailItem.text = await emailTextResponse.text();

    return lastEmailItem;
}

function extractUUID(text) {
    const match = text.match(/[0-9a-fA-F-]{36}/);
    return match ? match[0] : null;
}

async function activateUser(userObject) {
    return await activation.activateUserByUserId(userObject.id);
}

const orchestrator = {
    waitForAllServices,
    clearDatabase,
    runPendingMigrations,
    createUser,
    createSession,
    deleteAllEmails,
    getLastEmail,
    extractUUID,
    activateUser,
};

export default orchestrator;
