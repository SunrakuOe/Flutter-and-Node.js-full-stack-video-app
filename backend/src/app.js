import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app.use(
//     cors({
//         origin: process.env.CORS_ORIGIN,
//         credentials: true,
//     })
// );
// another way (more explicit) of whilisting domain for cors
const corsOptions = {
    origin: function (origin, callback) {
        // NOTE: allow requests with no origin (like Postman, mobile apps)
        //NOTE:  we are returning here because we don't want to go further if origin is not present
        if (!origin) return callback(null, true);
        //info: the first argument is the callback is error and second is isAllowOrigin
        const allowedOrigins = ["http://localhost:3000"]; // use * to allow all

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by cors"));
        }
    },
    credentials: true, //needed if you are sending cookies
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//routes import
import userRouter from "./route/user.route.js";

app.use("/api/v1/user", userRouter);

import videoRouter from "./route/video.route.js";

app.use("/api/v1/video", videoRouter);

import subscriptionRouter from "./route/subscription.route.js";

app.use("/api/v1/subscription", subscriptionRouter);

import tweetRouter from "./route/tweet.route.js";

app.use("/api/v1/tweet", tweetRouter);

import likeRouter from "./route/like.route.js";

app.use("/api/v1/like", likeRouter);

import commentRouter from "./route/comment.route.js";

app.use("/api/v1/comment", commentRouter);

import playlistRoute from "./route/playlist.route.js";

app.use("/api/v1/playlist", playlistRoute);

import healthcheckRouter from "./route/healthcheck.route.js";

app.use("/api/v1/healthcheck", healthcheckRouter);

import dashboardRouter from "./route/dashboard.route.js";

app.use("/api/v1/dashboard", dashboardRouter);

//NOTE: add error handling middleware always at the end because this handler only get called by Express if any next(any argument and not necesserily an error) called before the handler
// remember that the error-handling-middleware (a middleware with (err, req, res, next)) get called if the next(err) get called in any nearest(no any other error-handling-middleware in between) middleware that is attached before the error-handling middleware
// if there is not any user defined error-handling middleware then the default error-handling middleware of Express will get called

import { errorHandler } from "./middleware/errorHandler.middleware.js";
app.use(errorHandler);

export { app };
