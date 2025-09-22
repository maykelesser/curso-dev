/**
 * @flow Orchestrator
 * @author Maykel Esser
 * @description This file contains the orchestrator logic for the tests.
 * It will wait for all services to be up and running before running the tests.
 * This is useful when you have multiple services that need to be up and running
 * before you can run the tests, for instance, we need nextJS to be up and running and then
 * we can run the tests for the API.
 *
 * @see beforeAll in tests. We are calling the orchestrator to wait for all services to be up and running.
 */

import retry from "async-retry";
import user from "models/user";
import session from "models/session";
import database from "infra/database";
import migrator from "models/migrator";
import { faker } from "@faker-js/faker";

const EMAIL_HTTP_URL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

/**
 * @function waitForAllServices
 * @author Maykel Esser
 * @description Wait for all services to be up and running.
 * @returns {Promise<void>}
 * @see Tests - We are calling this function before running the tests through the beforeAll function.
 */
async function waitForAllServices() {
    await waitForEmailServer();
    await waitForWebServer();
}

/**
 * @function waitForWebServer
 * @author Maykel Esser
 * @description Wait for the web server (NextJS) to be up and running.
 * @returns {Promise<void>}
 * @see waitForAllServices
 */
async function waitForWebServer() {
    return retry(fetchStatusPage, {
        retries: 100,
        minTimeout: 100,
        maxTimeout: 1000,
    });
}

/**
 * @function waitForEmailServer
 * @author Maykel Esser
 * @description Wait for the email server to be up and running.
 * @returns {Promise<void>}
 */
async function waitForEmailServer() {
    return retry(fetchEmailServerStatus, {
        retries: 100,
        minTimeout: 100,
        maxTimeout: 1000,
    });
}

/**
 * @function fetchEmailServerStatus
 * @author Maykel Esser
 * @description Fetch the email server status.
 * @returns {Promise<void>}
 */
async function fetchEmailServerStatus() {
    const response = await fetch(`${EMAIL_HTTP_URL}`);
    if (response.status !== 200) {
        throw new Error();
    }
}

/**
 * @function fetchStatusPage
 * @author Maykel Esser
 * @description Fetch the status page.
 * @returns {Promise<void>}
 * @see waitForWebServer
 */
async function fetchStatusPage() {
    const response = await fetch("http://localhost:3000/api/v1/status");

    if (response.status !== 200) {
        throw new Error();
    }
}

/**
 * @function clearDatabase
 * @author Maykel Esser
 * @description Clear the database.
 * @returns {Promise<void>}
 * @see Tests - We are calling this function before running the tests through the beforeAll function.
 */
async function clearDatabase() {
    await database.query("DROP SCHEMA public cascade;");
    await database.query("CREATE SCHEMA public;");
}

/**
 * @function runPendingMigrations
 * @author Maykel Esser
 * @description Run the pending migrations.
 * @returns {Promise<void>}
 */
async function runPendingMigrations() {
    await migrator.runPendingMigrations();
}

/**
 * @function createUser
 * @author Maykel Esser
 * @description Create a user.
 * @returns {Promise<void>}
 */
async function createUser(userObject) {
    return await user.create({
        username:
            userObject?.username ||
            faker.internet.username().replace(/[_.-]/g, ""),
        email: userObject?.email || faker.internet.email(),
        password: userObject?.password || "validPassword",
    });
}

/**
 * @function createSession
 * @author Maykel Esser
 * @description Create a session.
 * @returns {Promise<void>}
 */
async function createSession(userId) {
    return await session.create(userId);
}

/**
 * @function deleteAllEmails
 * @author Maykel Esser
 * @description Delete all emails from the email server.
 * @returns {Promise<void>}
 */
async function deleteAllEmails() {
    await fetch(`${EMAIL_HTTP_URL}/messages`, {
        method: "DELETE",
    });
}

/**
 * @function getLastEmail
 * @author Maykel Esser
 * @description Get the last email from the email server.
 * @returns {Promise<void>}
 */
async function getLastEmail() {
    const response = await fetch(`${EMAIL_HTTP_URL}/messages`);
    const body = await response.json();
    const lastEmailItem = body.pop();

    const emailTextResponse = await fetch(
        `${EMAIL_HTTP_URL}/messages/${lastEmailItem.id}.plain`,
    );
    lastEmailItem.text = await emailTextResponse.text();

    return lastEmailItem;
}

const orchestrator = {
    waitForAllServices,
    clearDatabase,
    runPendingMigrations,
    createUser,
    createSession,
    deleteAllEmails,
    getLastEmail,
};

export default orchestrator;
