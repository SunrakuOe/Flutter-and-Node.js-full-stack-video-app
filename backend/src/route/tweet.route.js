import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controller/tweet.controller.js";
import { verifyTweetOwner } from "../middleware/tweet.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTweet);

router.route("/user/:userId").get(getUserTweets);

router
    .route("/:tweetId")
    .patch(verifyTweetOwner, updateTweet)
    .delete(verifyTweetOwner, deleteTweet);

export default router;
