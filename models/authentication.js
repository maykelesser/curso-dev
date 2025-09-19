import users from "models/user";
import password from "models/password";
import { UnauthorizedError, NotFoundError } from "infra/errors";

async function getAuthenticatedUser(emailSent, passwordSent) {
    try {
        const storedUser = await findUserByEmail(emailSent);
        await validatePassword(passwordSent, storedUser.password);

        return storedUser;
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw new UnauthorizedError({
                message: "Authentication data is invalid.",
                action: "Verify the authentication data and try again.",
            });
        }

        throw error;
    }

    async function findUserByEmail(emailSent) {
        let storedUser;

        try {
            storedUser = await users.findOneByEmail(emailSent);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new UnauthorizedError({
                    message: "E-mail not found",
                    action: "Check the e-mail or search for another user",
                });
            }

            throw error;
        }

        return storedUser;
    }

    async function validatePassword(passwordSent, storedUserPassword) {
        const isPasswordValid = await password.compare(
            passwordSent,
            storedUserPassword,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError({
                message: "Password is invalid",
                action: "Verify the password and try again.",
            });
        }
    }
}

const authentication = {
    getAuthenticatedUser,
};

export default authentication;
