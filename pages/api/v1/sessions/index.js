import * as cookie from "cookie";
import sessions from "models/session";
import controller from "infra/controller";
import authentication from "models/authentication";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function postHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the creation of a new session.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 *
 * @returns {Object} - Returns an object with the session that was created.
 */
async function postHandler(req, res) {
    const userInputValues = req.body;
    const authenticatedUser = await authentication.getAuthenticatedUser(
        userInputValues.email,
        userInputValues.password,
    );

    const newSession = await sessions.create(authenticatedUser.id);
    const setCookie = cookie.serialize("session_id", newSession.token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessions.EXPIRATION_IN_MILLISECONDS / 1000,
    });

    res.setHeader("Set-Cookie", setCookie);

    return res.status(201).json(newSession);
}
