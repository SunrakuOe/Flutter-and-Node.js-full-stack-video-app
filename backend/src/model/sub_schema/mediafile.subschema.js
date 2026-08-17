import mongoose from "mongoose";

// NOTE: I think that I should only store the public_id because we can get the url from it and the public_id is what is required to delete the file. We can simpy get the url by cloudinary.v2.api.resource(public_id)
export const mediaFileSubSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);
