import { User } from "../model/user.model.js";
import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import jwt from "jsonwebtoken";

//INFO: next() just indecate to run the next task (either run the next middleware or give the response(when I said "give the response" I mean the actual task - did you remember that middlewares are nothing but just functions/tasks we perform before giving the actual response))
//next() just say - "It's done here and now we move to the next task(middleware or to give response)"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // Thsi try catch is here because verifying jwt (jwt.verify()) can through error if the token is not authorized and we should give a custom 401 error for error. when I didn't handled it in postman it shous like a 500 error code so now I add the try-catch 'cause I want to tell the user that "its not me, its you mf"
    try {
        //info: thise(&&, ||) operators don't return only a boolean instead they return a truthy(a value that represent true) or falsy value (see bible of js if you want to learn more)
        //info: these operators return the value for which the result of this condition is determined (learn about how the conditions get checked for those conditional operators by the the the compiler/interpreter to understand waht I have said)
        //info: req.cookies?.accesstoken line is same to req.cookies && req.cookies.accesstoken
        //DOUBT: why we write "Bearer <token>" why no only the token
        // const token = req.header("Authorization")?.replace("Bearer ", "");
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log(token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // NOTE: This jwt.verify() is verifying everything for us - whether the token is genuine or the its expiry. If everything is good then its giving the decoded palyload else it will gives an error
        // TODO: print the decodedToken and see what it giving
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        // INFO: I have printed it and I saw - the jwt.verify verify the token and if it is authenticated (see notes from your copy if you don't know jwt token authenticity get checked traditionally) then it returns the decoded payload (which is just base64 encoded)
        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
