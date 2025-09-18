import users from "models/user";
import controller from "infra/controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

/**
 * @function postHandler
 * @author Maykel Esser
 *
 * @description This function is responsible for handling the creation of a new user.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 *
 * @returns {Object} - Returns an object with the user that was created.
 */
async function postHandler(req, res) {
    const userInputValues = req.body;
    const user = await users.create(userInputValues);
    return res.status(201).json(user);
}
