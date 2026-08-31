import { isValidObjectId } from "mongoose";
import { Playlist } from "../model/playlist.model.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { User } from "../model/user.model.js";
import { Video } from "../model/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body || {};

    if (!name) {
        throw new ApiError(400, "name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params || {};

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "valid user id is required");
    }

    const isUserExist = await User.exists({ _id: userId });

    if (!isUserExist) {
        throw new ApiError(400, "user doesn't exist");
    }

    const playlist = await Playlist.find({ owner: userId }).select(
        "_id name description videos"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params || {};

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "playlist doesn't exists");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    /* 
        - validate playlistId and videoId
        - check playlist exists or not
        - check video exists or not
        - if both exists then add the video id in the playlst's video
        - send a response
    */
    const { playlistId, videoId } = req.params || {};

    if (
        [playlistId, videoId].some((param) => !param || !isValidObjectId(param))
    ) {
        throw new ApiError(400, "invalid param");
    }

    const video = await Video.findById(videoId).select(
        "_id thumbnail title description"
    );

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,
            videos: { $ne: videoId },
        },
        { $addToSet: { videos: videoId } },
        { returnDocument: "after" }
    );

    if(!playlist){
        throw new ApiError(404, "unable to add video to playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { playlistId, addedVideo: video }));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params || {};

    if (
        [playlistId, videoId].some((param) => !param || !isValidObjectId(param))
    ) {
        throw new ApiError(400, "invalid param");
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $pull: {
                videos: videoId,
            },
        },
        {
            returnDocument: "after",
        }
    );

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params || {};

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(404, "playlist doesnot exist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params || {};
    const { name, description } = req.body || {};

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId");
    }

    if (!name?.trim()) {
        throw new ApiError(400, "name is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        { returnDocument: "after" }
    );

    if (!playlist) {
        throw new ApiError(404, "playlist doesnot exist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
