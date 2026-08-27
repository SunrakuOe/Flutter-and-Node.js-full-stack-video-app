import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
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
});

export const Comment = mongoose.model("Comment", commentSchema);
