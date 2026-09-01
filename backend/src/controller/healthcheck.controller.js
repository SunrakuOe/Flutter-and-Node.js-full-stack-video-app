import { asyncHandler } from "../util/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "everything is fine",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export { healthCheck };
