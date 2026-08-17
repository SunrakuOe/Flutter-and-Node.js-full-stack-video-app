import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mediaFileSubSchema } from "./sub_schema/mediafile.subschema.js";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: mediaFileSubSchema,
            required: true,
        },
        coverImage: {
            type: mediaFileSubSchema,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId, //NOTE:When an attribute of model A represent/refer to a entry of model B then the type of that attribute is set as an ObjectId (which is defined in mongoose.Schema.Types.ObjectId) and we also have to mention the model name
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    //note: I removed the next callback parameter in the functon we are passing and returning it coz it was giving errors
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
            //info: jsonwebtoken automatically adds a iat (issued at) field in the payload
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            //info: this add the "exp" field in the payload
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

/*
info: 
==> In backend programming a model generally refers to a class that represents a specific type of data(like a user data, or a post data, a profile data, a transaction data etc.).Like here the mongoose.model() gives us a subclass of Model class (like here User is a Model that represent a user data) that will represent a specific data, also provides lot of methods to communicate to the conrrespondence/related collectoin in the database(MongoDB)

==> in mongoose.model(name_of_the_model, sahema_of_the_model) takes 2 arguments - 
1) a name of the model - which mongoose uses internally to name and register that model and to figure out which collection in the database this this model should talk to.
- The name of the correspondence collection (in the mongoDB) is derived from this name - * mongoose may not use the name as it is - it name the collecton in lower case and plural. Ex - "User" (name of the model) -> creates a collecton named "users" in the mongoDB

2) the sachema for the data - the actual structure of that data. Like what fields are there(usreName, fullname etc.), and differnt constreaints related to the field
*/
export const User = mongoose.model("User", userSchema);
