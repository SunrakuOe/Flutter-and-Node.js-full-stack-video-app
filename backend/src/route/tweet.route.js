import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createTweet } from "../controller/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTweet);

export default router
