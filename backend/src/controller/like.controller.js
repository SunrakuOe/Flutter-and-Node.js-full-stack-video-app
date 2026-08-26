import { asyncHandler } from "../util/asyncHandler.js";
import { Like } from "../model/like.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const deletedLike = await Like.findOneAndDelete({
        likedBy: req.user?._id,
        parent: videoId,
        parentModel: "Video",
    });

    if (deletedLike) {
        return res.status(200).json(new ApiResponse(200, {}, ""));
    }

    const like = await Like.create({
        likedBy: req.user?._id,
        parent: videoId,
        parentModel: "Video",
    });

    if (!like) {
        throw new ApiError(500, "failed to like");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "video liked successfully"));
});


export {toggleVideoLike}
