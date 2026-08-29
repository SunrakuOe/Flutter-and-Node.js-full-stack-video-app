import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getVideoComments,
    getTweetComments,
    getCommentReplies,
    updateComment,
    deleteComment,
    addVideoComment,
    addTweetComment,
    addCommentReply,
} from "../controller/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").get(getVideoComments);

router.route("/tweet/:tweetId").get(getTweetComments);

router.route("/comment/:commentId").get(getCommentReplies);

router.route("/video").post(addVideoComment);

router.route("/tweet").post(addTweetComment);

router.route("/reply").post(addCommentReply);

router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
