import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // console.log("File uploaded successfully on clouninary", result.url);
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath); //info: remove the local saved temporary file as the upload operation get failed
        return null;
    }
};

const deleteImageFromCloudinary = async (assetPublicId) => {
    try {
        if (!filePath) return null;
        const result = await cloudinary.uploader.destroy(assetPublicId, {
            resource_type: "image",
        });
        return result?.result == "ok";
    } catch (error) {
        return false;
    }
};

export { uploadOnCloudinary, deleteImageFromCloudinary };
