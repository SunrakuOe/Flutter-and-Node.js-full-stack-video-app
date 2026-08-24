import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { toggleSubscription } from "../controller/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId").post(toggleSubscription);

export default router;
