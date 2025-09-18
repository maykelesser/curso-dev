import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { ServiceError } from "infra/errors";

import { resolve } from "node:path";

const defaultMigrationOptions = {
    dir: resolve("infra", "database", "migrations"),
    direction: "up",
    log: () => {},
    migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
    return await executeMigration({ dryRun: true });
}

async function runPendingMigrations() {
    return await executeMigration({ dryRun: false });
}

async function executeMigration(options) {
    let dbClient;
    let { dryRun = false } = options;

    try {
        dbClient = await database.getNewClient();

        const migratedMigrations = await migrationRunner({
            ...defaultMigrationOptions,
            dbClient,
            dryRun,
        });

        return migratedMigrations;
    } catch (error) {
        throw new ServiceError({
            message: "Error running pending migrations",
            cause: error,
        });
    } finally {
        await dbClient?.end();
    }
}

const migrator = {
    listPendingMigrations,
    runPendingMigrations,
};

export default migrator;
