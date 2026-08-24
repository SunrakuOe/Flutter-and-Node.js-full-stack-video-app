import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            // The one who is subscribing
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            // To whom the subscriber is subscribing
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
