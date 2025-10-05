import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function create(userInputValues) {
    await validateUniqueUsername(userInputValues.username);
    await validateUniqueEmail(userInputValues.email);
    await hashPasswordInObject(userInputValues);
    injectDefaultFeaturesInObject(userInputValues);

    const newUser = await runInsertQuery(userInputValues);
    return newUser;

    async function runInsertQuery(userInputValues) {
        const result = await database.query({
            text: `
                INSERT INTO
                    users (username, email, password, features)
                VALUES ($1, LOWER($2), $3, $4)
                RETURNING
                    *
                ;`,
            values: [
                userInputValues.username,
                userInputValues.email,
                userInputValues.password,
                userInputValues.features,
            ],
        });

        return result.rows[0];
    }

    function injectDefaultFeaturesInObject(userInputValues) {
        userInputValues.features = ["read:activation_token"];
    }
}

async function validateUniqueUsername(username) {
    const result = await database.query({
        text: `
            SELECT
                username
            FROM
                users
            WHERE
                LOWER(username) = LOWER($1)
        ;`,
        values: [username],
    });

    if (result.rowCount > 0) {
        throw new ValidationError({
            message: "Username already exists",
            action: "Use another username for this operation",
        });
    }

    return;
}

async function validateUniqueEmail(email) {
    const result = await database.query({
        text: `
            SELECT
                email
            FROM
                users
            WHERE
                LOWER(email) = LOWER($1)
        ;`,
        values: [email],
    });

    if (result.rowCount > 0) {
        throw new ValidationError({
            message: "E-mail already exists",
            action: "Use another e-mail for this operation",
        });
    }

    return;
}

async function findOneByUsername(username) {
    async function runSelectQuery(username) {
        const result = await database.query({
            text: `
                SELECT
                    *
                FROM
                    users
                WHERE
                    LOWER(username) = LOWER($1)
                LIMIT
                    1
            ;`,
            values: [username],
        });

        if (result.rowCount === 0) {
            throw new NotFoundError({
                message: "Username not found",
                action: "Check the username or search for another user",
            });
        }

        return result.rows?.[0];
    }

    const result = await runSelectQuery(username);
    return result;
}

async function findOneById(id) {
    async function runSelectQuery(id) {
        const result = await database.query({
            text: `
                SELECT
                    *
                FROM
                    users
                WHERE
                    id = $1
                LIMIT
                    1
            ;`,
            values: [id],
        });

        if (result.rowCount === 0) {
            throw new NotFoundError({
                message: "User ID not found",
                action: "Check the user ID or search for another user",
            });
        }

        return result.rows?.[0];
    }

    const result = await runSelectQuery(id);
    return result;
}

async function findOneByEmail(email) {
    async function runSelectQuery(email) {
        const result = await database.query({
            text: `
                SELECT
                    *
                FROM
                    users
                WHERE
                    LOWER(email) = LOWER($1)
                LIMIT
                    1
            ;`,
            values: [email],
        });

        if (result.rowCount === 0) {
            throw new NotFoundError({
                message: "E-mail not found",
                action: "Check the e-mail or search for another user",
            });
        }

        return result.rows?.[0];
    }

    const result = await runSelectQuery(email);
    return result;
}

async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
}

async function update(username, userInputValues) {
    const currentUser = await findOneByUsername(username);
    const isUpdatingUsername =
        "username" in userInputValues &&
        username.toLowerCase() !== userInputValues.username.toLowerCase();
    const isUpdatingEmail =
        "email" in userInputValues &&
        currentUser.email.toLowerCase() !== userInputValues.email.toLowerCase();

    if (isUpdatingUsername) {
        await validateUniqueUsername(userInputValues.username);
    }

    if (isUpdatingEmail) {
        await validateUniqueEmail(userInputValues.email);
    }

    if ("password" in userInputValues) {
        await hashPasswordInObject(userInputValues);
    }

    const updatedUser = {
        ...currentUser,
        ...userInputValues,
    };

    const result = await runUpdateQuery(updatedUser);

    return result;

    async function runUpdateQuery(updatedUser) {
        const result = await database.query({
            text: `
                UPDATE
                    users
                SET
                    username = $2,
                    email = $3,
                    password = $4,
                    updated_at = timezone('utc', now())
                WHERE
                    id = $1
                RETURNING
                    *
            ;`,
            values: [
                updatedUser.id,
                updatedUser.username,
                updatedUser.email,
                updatedUser.password,
            ],
        });

        return result.rows?.[0];
    }
}

const user = {
    create,
    findOneById,
    findOneByUsername,
    findOneByEmail,
    update,
};

export default user;
