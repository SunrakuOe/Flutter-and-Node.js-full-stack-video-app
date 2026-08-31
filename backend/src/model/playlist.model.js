import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
            maxLength: 100,
        },
        description: {
            type: String,
            default: "",
            maxLength: 500,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
    },
    { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
