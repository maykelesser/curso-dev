import users from "models/user";
import sessions from "models/session";
import controller from "infra/controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
    const sessionToken = req.cookies.session_id;
    const session = await sessions.findOneValidByToken(sessionToken);
    const renewedSession = await sessions.renew(session.id);
    controller.setSessionCookie(renewedSession.token, res);
    const user = await users.findOneById(session.user_id);

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, max-age=0, must-revalidate",
    );

    return res.status(200).json(user);
}
