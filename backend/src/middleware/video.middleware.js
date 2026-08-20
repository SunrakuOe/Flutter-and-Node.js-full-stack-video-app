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

export {authorizeVideoOwnership}
