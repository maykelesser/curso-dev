import sessions from "models/session";
import controller from "infra/controller";
import authentication from "models/authentication";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);
router.delete(deleteHandler);

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

    controller.setSessionCookie(newSession.token, res);

    return res.status(201).json(newSession);
}

/**
 * @function deleteHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the deletion of a session.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 */
async function deleteHandler(req, res) {
    const sessionToken = req.cookies.session_id;
    const session = await sessions.findOneValidByToken(sessionToken);
    const expiredSession = await sessions.expireById(session.id);
    controller.clearSessionCookie(res);

    return res.status(200).json(expiredSession);
}
