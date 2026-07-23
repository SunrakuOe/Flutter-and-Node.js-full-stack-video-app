import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../util/service/cloudinary.js";
import { ApiResponse } from "../util/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;
    console.log(req.body);

    //DOUBT: why we are not cheching all therese validations in a middleware. Arn't middlewares for these. Or can we use

    if (
        [fullName, email, userName, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //TODO: Learn more about thse operators - $or, $and , $nor
    const existedUser = User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or user name alreay exists");
    }

    //DOUBT: console.log req.files, body, avatar etc and see what they are - print everything in this contoller and see
    // console.log(req.files.avatar);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
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

    const createdUser = User.findById(user._id).select(
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

export { registerUser };
