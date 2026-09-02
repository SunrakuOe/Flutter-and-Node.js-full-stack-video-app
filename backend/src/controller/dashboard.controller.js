import { asyncHandler } from "../util/asyncHandler.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../util/ApiResponse.js";
import { Video } from "../model/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "parent",
                            as: "likes",
                            pipeline: [
                                {
                                    $match: {
                                        parentModel: "Video",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            likes: {
                                $size: "$likes",
                            },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subs",
            },
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos",
                },
                totalViews: {
                    $sum: "$videos.views",
                },
                totalLikes: {
                    $sum: "$videos.likes",
                },
                totalSubscribers: {
                    $size: "$subs",
                },
            },
        },
        {
            $project: {
                _id: 1,
                avatar: 1,
                userName: 1,
                email: 1,
                fullName: 1,
                coverImage: 1,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                totalSubscribers: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, stats[0], "stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "parent",
                as: "likes",
                pipeline: [
                    {
                        $match: {
                            parentModel: "Video",
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
                as: "comments",
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
                likesCount: {
                    $size: "$likes",
                },
                commentCount: {
                    $size: "$comments",
                },
            },
        },
        {
            // TODO: to write about inclusion and exclusion in $project
            $project: {
                owner: 0,
                likes: 0,
                comments: 0,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: req.user, videos },
                "videos fetched successfully"
            )
        );
});

export { getChannelStats, getChannelVideos };
