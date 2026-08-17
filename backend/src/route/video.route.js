import { Router } from "express";
import { getVideoById, publishAVideo } from "../controller/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById);

export default router;
