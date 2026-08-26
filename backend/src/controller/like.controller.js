import { asyncHandler } from "../util/asyncHandler.js";
import { Like } from "../model/like.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../model/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoId")
    }

    const isVideoExists = await Video.exists({_id: videoId})

    if(!isVideoExists){
        throw new ApiError(404, "video not found")
    }

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
