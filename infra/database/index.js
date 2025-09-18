import { Client } from "pg";
import { ServiceError } from "infra/errors";

/**
 * @function query
 * @author Maykel Esser
 * @description Query the database.
 * @param {Object} queryObject - The query object.
 * @returns {Promise<Object>} The result of the query.
 */
async function query(queryObject) {
    let client;

    try {
        client = await getNewClient();
        const result = await client.query(queryObject);
        return result;
    } catch (error) {
        const serviceErrorObject = new ServiceError({
            message: "Database or query error.",
            cause: error,
        });
        throw serviceErrorObject;
    } finally {
        await client?.end();
    }
}

/**
 * @function getNewClient
 * @author Maykel Esser
 * @description Get a new client for the connection and connect to the database.
 * @returns {Client} The new client.
 * @see query
 */
async function getNewClient() {
    const client = new Client({
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        ssl: getSSLValues(),
    });

    await client.connect();
    return client;
}

/**
 * @function getSSLValues
 * @author Maykel Esser
 * @description Get the SSL values for the connection. We are checking if
 * the environment variable POSTGRES_CA is set, if it is we are returning
 * an object with the ca key and the value of the environment variable.
 * @returns {Object} The SSL values.
 * @see getNewClient
 */
function getSSLValues() {
    if (process.env.POSTGRES_CA) {
        return {
            ca: process.env.POSTGRES_CA,
        };
    }
    return process.env.NODE_ENV === "production" ? true : false;
}

const database = {
    query,
    getNewClient,
    getSSLValues,
};

export default database;
