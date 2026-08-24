import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { Subscription } from "../model/subscription.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../model/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    /* 
        - get the the user channel, which to subscribe, from the path params
        - check if any subscription exists or not
        - if exists then delte that
        - else create one
    */

    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel is is required");
    }

    // INFO: I didn't do this in a middleware because its a part of the business rule and not a gateway in front of it. whatever user you are, you cannot subscribe to you'r own chanel
    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "cannot subscribe to own channel");
    }

    // INFO: when you pass multiple fields in the query object, they are implicitly AND, no need to explicitly mention $and
    const deletedSubscription = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: req.user?._id,
    });

    if (deletedSubscription) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "unsubscribed successfully"));
    }

    const isChannelExists = await User.exists({_id: channelId})

    if(!isChannelExists){
        throw new ApiError(400, "channel does not exist")
    }

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id,
    });

    if (!newSubscription) {
        throw new ApiError(500, "unable to subscribe");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "subscribed successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    // TODO: in future make it paginatin based - 'coz that is more efficient
    /* 
        - get the userId(whose subscribed channels you want to find) from the params
        - get the data using aggregation
        - if you have the data then send else throw an error
    */

    const { channelId } = req.params;

    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channelId");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            fullName: 1,
                            avatarUrl: "$avatar.url"
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel",
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: "$channel"
            }
        }
    ]);

    // NOTE: don't throw an error if the !subscribedChannels because may be the user have not subscribed to anyone yet. so just return

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "subscribed channels fetched successfully"
            )
        );
});


const getSubscriberChannels = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400, "invalid channelId")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            fullName: 1,
                            // info: instead or directly project new field that contains avatar.url you can also add a another pipeline before $project where you add a new field called avatarUrl and then just do avatarUrl: 1 here
                            avatarUrl: "avtar.url"
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },
        {
            $replaceRoot: {
                newRoot: "$subscriber"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers fetched successfully"))
})

export { toggleSubscription, getSubscribedChannels, getSubscriberChannels };
