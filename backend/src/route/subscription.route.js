import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getSubscribedChannels, toggleSubscription } from "../controller/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId").post(toggleSubscription);

router.route("/sub-to/:channelId").get(getSubscribedChannels);

export default router;
