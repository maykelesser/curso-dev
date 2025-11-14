import users from "models/user";
import controller from "infra/controller";
import activation from "models/activation";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
    const userInputValues = req.body;
    const user = await users.create(userInputValues);

    const activationToken = await activation.create(user.id);
    await activation.sendEmailToUser(user, activationToken);

    return res.status(201).json(user);
}
