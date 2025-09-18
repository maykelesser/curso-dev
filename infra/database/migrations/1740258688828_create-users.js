/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },

        // For reference, github usernames are limited to 39 characters.
        username: {
            type: "varchar(30)",
            notNull: true,
            unique: true,
        },

        // The maximum length of an email is 254 characters.
        // Ref: https://stackoverflow.com/a/1199238
        email: {
            type: "varchar(254)",
            notNull: true,
            unique: true,
        },

        // Bcrypt have a maximum password length of 60 characters.
        // Ref: https://www.npmjs.com/package/bcrypt#hash-info
        password: {
            type: "varchar(60)",
            notNull: true,
        },

        created_at: {
            type: "timestamptz",
            default: pgm.func("timezone('utc', now())"),
            notNull: true,
        },

        updated_at: {
            type: "timestamptz",
            default: pgm.func("timezone('utc', now())"),
            notNull: true,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = false;
