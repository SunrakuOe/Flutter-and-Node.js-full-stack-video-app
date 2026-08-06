import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//NOTE: see the documents of express for better understanding - 'cause you know that reading documents are better than (you learn more) learning from chatGPT
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//⬇️ secured routes - to access these routes the user must be verifyed(logged in) ⬇️
// TODO: See which http method (get, post, put, delete) should you use for logging out a user
router.route("/logout").post(verifyJWT, logoutUser);
router.route("refresh-token").post(refreshAccessToken);

export default router;
