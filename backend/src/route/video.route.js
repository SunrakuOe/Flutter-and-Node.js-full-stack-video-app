import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controller/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    authorizeVideoOwnership,
    checkAuthorizeToView,
    checkIsOwner,
} from "../middleware/video.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(checkIsOwner, getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(checkAuthorizeToView, getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(authorizeVideoOwnership, deleteVideo);

router
    .route("/toggle/publish/:videoId")
    .patch(authorizeVideoOwnership, togglePublishStatus);

export default router;
