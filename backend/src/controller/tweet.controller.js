import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";

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

    return res.status(200).json(new ApiResponse(200, tweet, "tweet created successfully"));
});

export {createTweet}
