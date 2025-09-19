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
    pgm.createTable("sessions", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },

        token: {
            type: "varchar(96)", // 96 characters is the max length from Facebook as reference
            notNull: true,
            unique: true,
        },

        user_id: {
            // We deliberately do not use a foreign key here (references)
            type: "uuid",
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

        expires_at: {
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
