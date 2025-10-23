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

async function findOneByUserId(userId) {
    const newToken = await runSelectQuery(userId);
    return newToken;

    async function runSelectQuery(userId) {
        const result = await database.query({
            text: `
                SELECT 
                    * 
                FROM 
                    user_activation_tokens 
                WHERE 
                    user_id = $1 
                AND 
                    expires_at > NOW() 
                LIMIT 
                    1
                ;`,
            values: [userId],
        });

        return result.rows[0];
    }
}

const activation = {
    sendEmailToUser,
    create,
    findOneByUserId,
};

export default activation;
