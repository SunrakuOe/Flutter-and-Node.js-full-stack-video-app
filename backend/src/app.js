import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//routes import
import userRouter from "./route/user.route.js";

app.use("/api/v1/user", userRouter);

import videoRouter from "./route/video.route.js";

app.use("/api/v1/video", videoRouter);


//note: add error handling middleware always at the end because this handler only get called by Express if any next(any argument and not necesserily an error) called before the handler
// remember that the error-handling-middleware (a middleware with (err, req, res, next)) get called if the next(err) get called in any nearest(no any other error-handling-middleware in between) middleware that is attached before the error-handling middleware
// if there is not any user defined error-handling middleware then the default error-handling middleware of Express will get called

import { errorHandler } from "./middleware/errorHandler.middleware.js";
app.use(errorHandler)

export { app };
