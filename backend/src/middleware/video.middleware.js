import { Video } from "../model/video.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";

const authorizeVideoOwnership = asyncHandler(async (req, _, next) => {
    const { videoId } = req.params;

    if (!videoId.trim()) {
        throw new ApiError(400, "video id is not provided");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "invalid video id");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(401, "unauthorized access on video");
    }

    req.video = video;

    next();
});

const checkAuthorizeToView = asyncHandler(async (req, _, next) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video id is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video file not found");
    }

    if (!video.isPublished && !req.user._id.equals(video.owner)) {
        throw new ApiError(403, "unauauthorize access to video resource");
    }

    req.video = video;
    next();
});

const checkIsOwner = asyncHandler(async (req, _, next) => {
    const user = req.user;
    const profileUserId = req.query.userId;

    if (user._id.toString() === profileUserId?.toString()) {
        req.isOwner = true;
    } else {
        req.isOwner = false;
    }

    next();
});

export { authorizeVideoOwnership, checkAuthorizeToView, checkIsOwner };
