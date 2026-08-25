import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../model/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
    /* 
        - get the content
        - create a new tweet
        - return res
    */

    const { content } = req.body || {}; // TODO: test without sending the body from the frontend

    if (!content?.trim()) {
        throw new ApiError(400, "tweet content is required");
    }

    // INFO: when you use .create to create an document, if it created successfully then it return the document else it will throws an error. in our case our async handler will handle that. because it is unnecessery to check if domument is created or not as it throws error if not created, so we dont check if(!tweet)
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if(!userId && !isValidObjectId(userId)){
        throw new ApiError(400, "invalid userId")
    }

    const user = await User.findById(userId).select("_id userName avatar.url fullName");

    if(!user){
        throw new ApiError(400, "user not available")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
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
                        // NOTE: I think this match check is unnecessery because the ObjectId in mongoDB is unique across your entire database, not just your collection
                        $match: {
                            parentModel: "Tweet",
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
                commentsCount: {
                    $size: "$comments",
                },
            },
        },
        {
            $project: {
                _id: 1,
                content: 1,
                likesCount: 1,
                commentsCount: 1,
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, {user, tweets}, "tweets fetched successfully"));
});

export { createTweet, getUserTweets };
