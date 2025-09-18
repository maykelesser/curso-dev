import database from "infra/database";
import controller from "infra/controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function getHandler
 * @author Maykel Esser
 * @description This function is responsible for returning the status of the application.
 * - The updated_at field must contain the current date in ISO format.
 * - The dependencies field must contain the database field.
 * - The database field must contain the version, max_connections and used_connections fields.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns {Object} - Returns an object with the status of the application.
 */
async function getHandler(req, res) {
    const updatedAt = new Date().toISOString();
    const serverVersion = await database.query("SHOW server_version;");
    const maxConnections = await database.query("SHOW max_connections;");
    const usedConnections = await database.query({
        text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
        values: [process.env.POSTGRES_DB],
    });

    return res.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: serverVersion.rows[0].server_version,
                max_connections: parseInt(
                    maxConnections.rows[0].max_connections,
                ),
                used_connections: parseInt(usedConnections.rows[0].count),
            },
        },
    });
}
