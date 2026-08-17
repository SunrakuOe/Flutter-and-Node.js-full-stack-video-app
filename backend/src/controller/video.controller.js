import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { uploadOnCloudinary } from "../util/service/cloudinary.js";
import { Video } from "../model/video.model.js";

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

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo) {
        throw new ApiError(500, "unable to upload file")
    }

    return res.status(200).json(
        new ApiResponse(200, uploadedVideo, "video uploaded successfully")
    );
});

export { publishAVideo };
