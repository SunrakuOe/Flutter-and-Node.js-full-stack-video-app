import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../util/service/cloudinary.js";
import { ApiResponse } from "../util/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); //DOUBT: what is this line for?

        return { accessToken, refreshToken }; //Note: this syntax mean {accessToken: accesstoken, refreshToken: refreshToken} - whent he variable name and the field name is same then we can do that
    } catch (error) {
        throw new ApiError(
            500,
            "something weng wrong while generation access and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // Note: Here is a problem that - if the body is not coming (i.e - req.body is null or undefined) then the following line(when you destructure) could give error so make sure to handle this either check first is the req.body is available and proceed if available or through error if it is not there
    // whatever I did here (req.body || {}) will work but I don't think that it is the proper way of doing that> I mean you should through a proper error mentioning that the body is not avalilable
    const { fullName, email, userName, password } = req.body || {};
    // console.log("req - ", req); //Note: isko mat print karna re baba warna 1km lamba print hota hai
    // console.log("req.body - ", req.body);

    //DOUBT: why we are not cheching all therese validations in a middleware. Arn't middlewares for these. Or can we use

    //info: the some() method returns ture if for any value the callback returns true
    if (
        [fullName, email, userName, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //TODO: Learn more about thse operators - $or, $and , $nor
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or user name alreay exists");
    }

    //DOUBT: console.log req.files, body, avatar etc and see what they are - print everything in this contoller and see
    // console.log(req.files.avatar);
    // console.log("req.files - ", req.files);
    // console.log("req.files?.avatar - ", req.files?.avatar);
    // console.log("req.files?.avatar[0]?.path - ", req.files?.avatar[0]?.path);
    // console.log("req.files?.coverImage[0]?.path - ", req.files?.coverImage[0]?.path);

    //NOTE: the req.files field added by muler which add all the files data in this files field
    let avatarLocalPath;
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    } else {
        throw new ApiError(400, "Avatar file is required");
    }

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering a user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "user regisertred successfuly")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    /* 
    NOTE: this algorithem is not completely right - there some changes in the actual implementation. This algo below is just a todo(assignment).
        - check req.body is defined ✅`
        - extract the values for the body ✅
        - check all those values are valid (values are present or not) ✅
        - check user is registered or not ✅
        - compare password hash ✅
        - generate access and refresh token ✅
        - save the refresh token in db ✅
        - send a res to the user with the access token ✅
    */

    if (!req.body) {
        throw new ApiError(400, "unable to find the request body");
    }

    const { userName, email, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "user name or email is required");
    }

    if (!password) {
        throw new ApiError(400, "password is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { password }],
    });
    // console.log(user);

    //TODO: to comment everything below and console.log and see what if we search for a field which is not present in the document

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credentionls");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    /* 
    NOTE: 
    - Do not make here a db query again if you think that doing a db qury here is expensive for you  
    - expensive in a way that  
        1) it going to increase your respose time(and you don't want it)
        2) it will increase your bill
    - So to avaoid that you can simple add those accessToken and refreshToken fields to the existing user -> then remove the sensitive data which you don't want to sent to the user (like password etc. stuff)
    */
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //TODO: to learn about these otpions more
    const options = {
        httpOnly: true,
        secure: true,
    };

    return (
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            //NOTE: we are sending the access and refresh token again in a json response, though we are sending them in cookies because incas of mobile applications because there is not cookies in mobile apps (or any apps)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "user logged in successfully"
                )
            )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    /* 
    DOUBT: - Can't we do user.save() here instead of User.findByIdAndUpdate ???
    */

    // TODO: see more about the more options like the $set

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true } //DOUBT: what is this for ({new: true})
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// NOTE: I think there is a bug in our program - we are getting all the cookies (both access and refresh token) for every request. The refresh token should not be exposed that frequentl; it should only send when we the access token got expired. But here we are getting the refresh token in every request. TODO: and we have to sovle this shit for security purpose

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken)
            throw new ApiError(401, "Unauthorized Request");

        const decodedPayload = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_KEY
        );

        const user = await User.findById(decodedPayload?._id);

        if (!user) throw new ApiError(401, "Unauthorized Request");

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secore: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token");
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
