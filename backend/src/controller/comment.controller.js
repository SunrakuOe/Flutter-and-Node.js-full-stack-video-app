import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { Comment } from "../model/comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../util/asyncHandler.js";

const getCommentsForParent = async (
    parent,
    parentModel,
    { page = 1, limit = 10 } = {}
) => {
    return await Comment.aggregate([
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
                    $size: "replies",
                },
            },
        },
        {
            content: 1,
            owner: 1,
            replyCount: 1,
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

    return comments;
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

    return comments;
});

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId");
    }

    const comments = await getCommentsForParent(commentId, "commentId", {
        page,
        limit,
    });

    return comments;
});

const addComment = asyncHandler(async (req, res) => {
    const { parent, parentModel, content } = req.body || {};

    if (
        [parent, parentModel, content].some((val) => !parent || !parent.trim())
    ) {
        throw new ApiError(400, "all fields are required");
    }

    try {
        const comment = await Comment.create({
            owner: req.user?._id,
            parent,
            parentModel,
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
    addComment,
    updateComment,
    deleteComment,
};
