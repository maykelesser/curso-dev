import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function getHandler
 * @author Maykel Esser
 * @description This function is responsible for handling the migration of the database.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns {Array} - Returns an array with the migrations that were executed.
 */
async function getHandler(req, res) {
    const pendingMigrations = await migrator.listPendingMigrations();
    return res.status(200).json(pendingMigrations);
}

/**
 * @function postHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the migration of the database.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 *
 * @returns {Array} - Returns an array with the migrations that were executed.
 */
async function postHandler(req, res) {
    const migratedMigrations = await migrator.runPendingMigrations();

    if (migratedMigrations.length > 0) {
        return res.status(201).json(migratedMigrations);
    }

    return res.status(200).json(migratedMigrations);
}
