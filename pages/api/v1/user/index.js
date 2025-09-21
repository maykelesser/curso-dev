import users from "models/user";
import sessions from "models/session";
import controller from "infra/controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function getHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the creation of a new user.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 *
 * @returns {Object} - Returns an object with the user that was created.
 */
async function getHandler(req, res) {
    const sessionToken = req.cookies.session_id;
    const session = await sessions.findOneValidByToken(sessionToken);
    const renewedSession = await sessions.renew(session.id);
    controller.setSessionCookie(renewedSession.token, res);
    const user = await users.findOneById(session.user_id);

    res.setHeader("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");

    return res.status(200).json(user);
}
