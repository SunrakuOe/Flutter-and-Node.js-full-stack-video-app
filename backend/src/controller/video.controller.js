import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import {
    deleteImageFromCloudinary,
    uploadOnCloudinary,
} from "../util/service/cloudinary.js";
import { Video } from "../model/video.model.js";
import mongoose from "mongoose";
import { unlinkFileSync } from "../util/service/fileSystem.js";

/* 
TODO:
1) what could be the best approach to upload a video file - first get it in the bakend locally and then upload from there or somehow from the frontend if possible
DOUBT: when uploading a video in youtube it shows how much the upload is completed - how does it get that update of how much is uploaded 
*/

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { query } = req.query;
//     console.log(query);
//     return res
//         .status(200)
//         .json(new ApiResponse(200, req.query, "the query data"));
// });

// TODO: after writing the code for the publis video look the user controller and do all the todos in there
// TODO: is there any kind of difference between how we get the non-file(image, video etc. files) data from the frontend example - in the body, in the params or in the query params. Is there any standard what to use when
const publishAVideo = asyncHandler(async (req, res) => {
    /* 
    - get title and description ✅
    - validate those ✅
    - get the video file ✅
    - validate it (check wheter the file is present and whether it is a video file or not, and may be validate its size or duration etc if you want) ✅
    - get the thumbnail ✅
    - validate it(same as the video, check its file type also, upload it by croping it if you want) ✅
    - upload them to cloudnary ✅
    - save in db
    - send a success response
    */

    const { title, description } = req.body;

    // INFO: an empty string is a falsy value
    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "title or description is required");
    }

    //NOTE: you can add different errro messages for dirfferent errors
    if (!(
        req.files &&
        Array.isArray(req.files.videoFile) &&
        req.files.videoFile[0] &&
        req.files.videoFile[0].mimetype.split("/")[0] === "video"
    )) {
        throw new ApiError(400, "video file is required");
    }

    const videoLocalFile = req.files.videoFile[0].path;

    if (!(
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail[0] &&
        req.files.thumbnail[0].mimetype.split("/")[0] === "image"
    )) {
        throw new ApiError(400, "thumbnail file is required");
    }

    const thumbnailLocalFile = req.files.thumbnail[0].path;

    const videoFile = await uploadOnCloudinary(videoLocalFile);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFile);

    console.log(videoFile);
    console.log(thumbnail);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "unable to upload files");
    }

    const video = await Video.create({
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id,
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id,
        },
        title,
        description,
        duration: videoFile.duration,
        // NOTE: when a field stores a ObjectId you can pass the _id directly and you don't have to convert it to mongoose.Types.ObjectId, mongoose can automatically do that for you, you don't need to worry about that. And if you want you can also pass the user object mongoose automatically get the _id inside it - basically if you pass any object it search for a _id inside it and upload it
        owner: req.user._id,
    });

    const uploadedVideo = await Video.findById(video._id);

    if (!uploadedVideo) {
        throw new ApiError(500, "unable to upload file");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, uploadedVideo, "video uploaded successfully")
        );
});

// TODO: there is an error in the getVideoById() because we have to check first that the video is published or not first and if it is not published then only the owner should have the right to watch the video
const getVideoById = asyncHandler(async (req, res) => {
    /* 
    - get the videoId from the params
    - validate it
    - get the video document forom the db by joining the owner with the User using aggretation pipeline
    - add the subscribers count
    - add the isSubscribed field
    - project only _id, userName, fullName, subscribers, isSubscribed
    - send the response
    */

    // NOTE: you are thinking that why directly passing the videoId in the params, why not in query param because you have seen that YouTube use /watch?v={videoId}. See - that is a webserver URL, they want to show a perticular UI in which the data is changing. Fro them the files are resources. But for our app server each video data is a specific resource so we sending the videoId in the path param.
    const { videoId } = req.params || {};

    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers",
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [req.user?._id, "$subscribers"],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            userName: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1,
                        },
                    },
                ],
            },
        },
    ]);

    if (!video) {
        throw new ApiError(500, "unable to fetch video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "video not found");
        }

        if (!video.owner.equals(req.user?._id)) {
            console.log(video.owner, req.user?._id);
            throw new ApiError(
                401,
                "unauthorized to update the video the video"
            );
        }

        const { title, description } = req.body;

        if (!title?.trim() || !description?.trim()) {
            throw new ApiError(400, "title and description are required");
        }

        const thumbnailLocalFilePath = req.file?.path;

        if (!thumbnailLocalFilePath) {
            throw new ApiError(400, "thumbnail is required");
        }

        const newThumbnailCludinary = await uploadOnCloudinary(
            thumbnailLocalFilePath
        );

        if (!newThumbnailCludinary) {
            throw new ApiError(500, "unable to update thumbnail");
        }

        const oldThumbnailPublicId = video.thumbnail.public_id;

        video.thumbnail = {
            url: newThumbnailCludinary.url,
            public_id: newThumbnailCludinary.public_id,
        };
        video.title = title;
        video.description = description;
        await video.save({ validateBeforeSave: false });

        await deleteImageFromCloudinary(oldThumbnailPublicId);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    title,
                    description,
                    thumbnail: newThumbnailCludinary.url,
                    thumbnailPublicId: newThumbnailCludinary.public_id,
                },
                "video details updated successfully"
            )
        );
    } catch (error) {
        // INFO: I a doing this because if I got any error befor the thumbnail uploaded to cloudinary then the local thumbnail file stays there and don't removed. You can do it everywhere where you dealing with the images
        unlinkFileSync(req.file?.path);
        throw error;
    }
});

export { publishAVideo, getVideoById, updateVideo };
