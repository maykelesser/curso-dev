import controller from "infra/controller";
import activation from "models/activation";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function patchHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the update of a user.
 */
async function patchHandler(req, res) {
    const { token_id } = req.query;
    const validActivationToken = await activation.findOneValidById(token_id);
    await activation.activateUserByUserId(validActivationToken.user_id);
    const usedActivationToken = await activation.markTokenAsUsed(token_id);

    return res.status(200).json(usedActivationToken);
}
