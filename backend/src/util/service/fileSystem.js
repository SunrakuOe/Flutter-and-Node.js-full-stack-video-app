import fs from "fs";

// you can use the method in this method in the cloudinary.js
const unlinkFileSync = (path) => {
    if (path) {
        fs.unlinkSync(path);
    }
};

export { unlinkFileSync };
