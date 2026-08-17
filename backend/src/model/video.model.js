import mongoose, { Schema } from "mongoose"; //NOTE: you can also import Schema directly so you don't have to do mongoose.Schema all the time
import { mediaFileSubSchema } from "./sub_schema/mediafile.subschema.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: mediaFileSubSchema,
            required: true,
        },
        thumbnail: {
            type: mediaFileSubSchema,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            //DOUBT: I think I should make it required
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate); //TODO: Learn about plugin in mongoose
export const Video = mongoose.model("Video", videoSchema);
