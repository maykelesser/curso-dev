import sessions from "models/session";
import controller from "infra/controller";
import authentication from "models/authentication";
import authorization from "models/authorization";
import { createRouter } from "next-connect";
import { ForbiddenError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
    const userInputValues = req.body;
    const authenticatedUser = await authentication.getAuthenticatedUser(
        userInputValues.email,
        userInputValues.password,
    );

    if (!authorization.can(authenticatedUser, "create:session")) {
        throw new ForbiddenError({
            message: "You don't have permissions to login",
            action: "Contact the administrator to get access",
        });
    }

    const newSession = await sessions.create(authenticatedUser.id);

    controller.setSessionCookie(newSession.token, res);

    return res.status(201).json(newSession);
}

async function deleteHandler(req, res) {
    const sessionToken = req.cookies.session_id;
    const session = await sessions.findOneValidByToken(sessionToken);
    const expiredSession = await sessions.expireById(session.id);
    controller.clearSessionCookie(res);

    return res.status(200).json(expiredSession);
}
