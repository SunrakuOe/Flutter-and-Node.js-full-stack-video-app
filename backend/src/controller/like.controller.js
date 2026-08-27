import { asyncHandler } from "../util/asyncHandler.js";
import { Like } from "../model/like.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../model/video.model.js";
import { Comment } from "../model/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const isVideoExists = await Video.exists({ _id: videoId });

    if (!isVideoExists) {
        throw new ApiError(404, "video not found");
    }

    const deletedLike = await Like.findOneAndDelete({
        likedBy: req.user?._id,
        parent: videoId,
        parentModel: "Video",
    });

    if (deletedLike) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "video like removed successfully"));
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

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const isCommentExist = await Comment.exists({ _id: commentId });

    if (!isCommentExist) {
        throw new ApiError(400, "comment not exists");
    }

    const deletedLike = await Like.findOneAndDelete({
        owner: req.user?._id,
        parent: commentId,
        parentModel: "Comment",
    });

    if (deletedLike) {
        return res
            .status(200)
            .json(200, {}, "comment like removed successfully");
    }

    const like = await Like.create({
        owner: req.user?._id,
        parent: commentId,
        parentModel: "Comment",
    });

    if (!like) {
        throw new ApiError(500, "unable to like comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const isTweetExist = await Tweet.exists({ _id: tweetId });

    if (!isTweetExist) {
        throw new ApiError(400, "tweet not exists");
    }

    const deletedLike = await Like.findOneAndDelete({
        owner: req.user?._id,
        parent: tweetId,
        parentModel: "Tweet",
    });

    if (deletedLike) {
        return res.status(200).json(200, {}, "tweet like removed successfully");
    }

    const like = await Like.create({
        owner: req.user?._id,
        parent: tweetId,
        parentModel: "Tweet",
    });

    if (!like) {
        throw new ApiError(500, "unable to like tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    /* 
    - get the userId and validate it
    - aggregate the liked videos with the owner info
    - return the res
*/

    const userId = req.user?._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                parentModel: "Video",
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "parent",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        userName: 1,
                                        fullName: 1,
                                        avatarUrl: "$avatar.url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            //drop the likes whose video no longer exists
            $match: {
                video: { $ne: [] },
            },
        },
        {
            $addFields: {
                video: {
                    $first: "$video",
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: "$video",
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "liked videos fetched successfully"
            )
        );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
