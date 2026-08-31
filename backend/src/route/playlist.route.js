import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controller/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .delete(deletePlaylist)
    .patch(updatePlaylist);

router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);

router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);

export default router;
