import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function sendEmailToUser(user, activationToken) {
    await email.send({
        from: "Test Contact <contact@test.com>",
        to: user.email,
        subject: "Activate your account",
        text: `Hi ${user.username}, click the link below to activate your account: ${webserver.origin}/signup/activate/${activationToken.id}`,
    });
}

async function create(userId) {
    const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

    const newToken = await runInsertQuery(userId, expiresAt);
    return newToken;

    async function runInsertQuery(userId, expiresAt) {
        const result = await database.query({
            text: `
                INSERT INTO 
                    user_activation_tokens (user_id, expires_at) 
                VALUES 
                    ($1, $2) 
                RETURNING *
                ;`,
            values: [userId, expiresAt],
        });

        return result.rows[0];
    }
}

async function findOneValidById(token) {
    const result = await database.query({
        text: `
            SELECT 
                * 
            FROM 
                user_activation_tokens 
            WHERE 
                id = $1 
            AND 
                expires_at > NOW() 
            AND 
                used_at IS NULL 
            LIMIT 
                1
            ;`,
        values: [token],
    });

    if (result.rowCount === 0) {
        throw new NotFoundError({
            message: "Activation token not found or expired",
            action: "Sign up again",
        });
    }

    return result.rows[0];
}

const activation = {
    create,
    sendEmailToUser,
    findOneValidById,
};

export default activation;
