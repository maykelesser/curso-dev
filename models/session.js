import database from "infra/database";
import crypto from "node:crypto";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function findOneValidByToken(token) {
    const result = await database.query({
        text: `
            SELECT 
                * 
            FROM 
                sessions 
            WHERE
                 token = $1
                 AND expires_at > NOW()
            LIMIT
                1
        `,
        values: [token],
    });

    if (result.rowCount === 0) {
        throw new UnauthorizedError({
            message: "Unauthorized session token",
            action: "Check the session token or login again",
        });
    }

    return result.rows[0];
}

async function create(userId) {
    const token = crypto.randomBytes(48).toString("hex");
    const newSession = await runInsertQuery(token, userId, expiresAt());
    return newSession;

    async function runInsertQuery(token, userId, expiresAt) {
        const result = await database.query({
            text: `
                INSERT INTO 
                    sessions (token, user_id, expires_at) 
                VALUES 
                    ($1, $2, $3) 
                RETURNING 
                    *
                ;
            `,
            values: [token, userId, expiresAt],
        });

        return result.rows[0];
    }
}

async function renew(sessionId) {
    const renewedSession = await runUpdateQuery(sessionId, expiresAt());
    return renewedSession;

    async function runUpdateQuery(sessionId, expiresAt) {
        const result = await database.query({
            text: `
                UPDATE 
                    sessions 
                SET 
                    expires_at = $2,
                    updated_at = timezone('utc', now())
                WHERE 
                    id = $1
                RETURNING 
                    *;
            `,
            values: [sessionId, expiresAt],
        });

        return result.rows[0];
    }
}

function expiresAt() {
    return new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
}

const session = {
    create,
    renew,
    findOneValidByToken,
    EXPIRATION_IN_MILLISECONDS,
};

export default session;
