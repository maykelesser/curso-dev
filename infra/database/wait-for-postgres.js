const { exec } = require("node:child_process");

/**
 * @function checkPostgres
 * @author Maykel Esser
 * @description Checks if the Postgres container is ready to accept connections.
 * We are using it before starts any application that depends on Postgres.
 * This way we can guarantee that the application will not crash because of a missing database.
 * @returns {void}
 * @see package.json for the script that calls this file.
 */
function checkPostgres() {
    exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

    function handleReturn(error, stdout) {
        if (stdout.search("accepting connections") === -1) {
            process.stdout.write(".");
            checkPostgres();
            return;
        }

        console.log("\n🟢 Postgres is ready!");
    }
}

process.stdout.write("🔴 Waiting for Postgres to start...");

checkPostgres();
