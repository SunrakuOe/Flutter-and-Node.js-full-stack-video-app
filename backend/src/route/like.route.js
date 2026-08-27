import {Router} from "express" 
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controller/like.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/toggle/video/:videoId").post(toggleVideoLike)

router.route("/toggle/comment/:commentId").post(toggleCommentLike)

router.route("/toggle/tweet/:tweetId").post(toggleTweetLike)

router.route("/video").get(getLikedVideos)

export default router