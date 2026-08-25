import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        parent: {
            type: Schema.Types.ObjectId,
            refPath: "parentModel",
            required: true,
        },
        parentModel: {
            type: String,
            required: true,
            enum: ["Video", "Tweet", "Comment"],
        },
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
