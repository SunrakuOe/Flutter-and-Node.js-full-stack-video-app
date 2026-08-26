import { Tweet } from "../model/tweet.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const verifyTweetOwner = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "tweet not exists");
    }

    if (!tweet.owner.equals(req.user?._id)) {
        throw new ApiError(401, "unauthorized to perform this action on the tweet");
    }

    next();
});

export {verifyTweetOwner}
