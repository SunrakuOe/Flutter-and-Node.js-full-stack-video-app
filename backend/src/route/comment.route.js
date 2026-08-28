import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getVideoComments,
    getTweetComments,
    getCommentReplies,
    addComment,
    updateComment,
    deleteComment,
} from "../controller/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").get(getVideoComments);

router.route("/tweet/:tweetId").get(getTweetComments);

router.route("/comment/:commentId").get(getCommentReplies);

router.route("/").post(addComment);

router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
