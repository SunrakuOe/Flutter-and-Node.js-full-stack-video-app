import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // console.log("file(multer) - ", file)
        callback(null, "./public/temp"); // NOTE: When you specify file path for multer - assume you are at the root folder of the node project; not on the file where you are defining it
    },
    filename: function (req, file, callback) {
        const uniqueFileName = Date.now() + "-" + file.originalname;
        callback(null, uniqueFileName);
    },
});

const upload = multer({ storage }); // syntax - same as {storage: storage} - es6 feature
export { upload };
