import {Router} from "express" 
import { toggleVideoLike } from "../controller/like.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/toggle/video/:videoId").post(toggleVideoLike)

export default router