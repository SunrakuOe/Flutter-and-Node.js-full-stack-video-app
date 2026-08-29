import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { Comment } from "../model/comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../util/asyncHandler.js";
import { Tweet } from "../model/tweet.model.js";
import { Video } from "../model/video.model.js";

const getCommentsForParent = (
    parent,
    parentModel,
    { page = 1, limit = 10 } = {}
) => {
    return Comment.aggregate([
        {
            $match: {
                parent: new mongoose.Types.ObjectId(parent),
                parentModel: parentModel,
            },
        },
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
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parent",
                as: "replies",
                pipeline: [
                    {
                        $match: {
                            parentModel: "Comment",
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
                replyCount: {
                    $size: "$replies",
                },
            },
        },
        {
            $project: {
                content: 1,
                owner: 1,
                replyCount: 1,
            },
        },
    ]);
};

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId");
    }

    const comments = await getCommentsForParent(videoId, "Video", {
        page,
        limit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const comments = await getCommentsForParent(tweetId, "Tweet", {
        page,
        limit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comments = await getCommentsForParent(commentId, "Comment", {
        page,
        limit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const addVideoComment = asyncHandler(async (req, res) => {
    const { videoId, content } = req.body || {};

    if ([videoId, content].some((field) => !field || !field.trim())) {
        throw new ApiError(400, "all fields are required");
    }

    const video = await Video.exists({ _id: videoId });

    if (!video) {
        throw new ApiError(400, "video donsn't exist");
    }

    try {
        const comment = await Comment.create({
            owner: req.user?._id,
            parent: videoId,
            parentModel: "Video",
            content,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, comment, "comment added successfully"));
    } catch (err) {
        throw new ApiError(500, "failed to add comment");
    }
});

const addTweetComment = asyncHandler(async (req, res) => {
    const { tweetId, content } = req.body || {};

    if ([tweetId, content].some((field) => !field || !field.trim())) {
        throw new ApiError(400, "all fields are required");
    }

    const tweet = await Tweet.exists({ _id: tweetId });

    if (!tweet) {
        throw new ApiError(400, "tweet donsn't exist");
    }

    try {
        const comment = await Comment.create({
            owner: req.user?._id,
            parent: tweetId,
            parentModel: "Tweet",
            content,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, comment, "comment added successfully"));
    } catch (err) {
        throw new ApiError(500, "failed to add comment");
    }
});

const addCommentReply = asyncHandler(async (req, res) => {
    const { commentId, content } = req.body || {};

    if ([commentId, content].some((field) => !field || !field.trim())) {
        throw new ApiError(400, "all fields are required");
    }

    const comment = await Comment.exists({ _id: commentId });

    if (!comment) {
        throw new ApiError(400, "comment donsn't exist");
    }

    try {
        const comment = await Comment.create({
            owner: req.user?._id,
            parent: commentId,
            parentModel: "Comment",
            content,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, comment, "comment added successfully"));
    } catch (err) {
        throw new ApiError(500, "failed to add comment");
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "comment content is empty");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id,
        },
        { content },
        { returnDocument: "after" }
    );

    if (!updatedComment) {
        throw new ApiError(500, "unable to update comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    });

    if (!comment) {
        throw new ApiError(500, "unable to delete comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export {
    getVideoComments,
    getTweetComments,
    getCommentReplies,
    addVideoComment,
    addTweetComment,
    addCommentReply,
    updateComment,
    deleteComment,
};
