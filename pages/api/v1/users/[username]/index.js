import users from "models/user";
import controller from "infra/controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
    const { username } = req.query;
    const user = await users.findOneByUsername(username);
    return res.status(200).json(user);
}

async function patchHandler(req, res) {
    const { username } = req.query;
    const userInputValues = req.body;

    const updatedUser = await users.update(username, userInputValues);

    return res.status(200).json(updatedUser);
}
