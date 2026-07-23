import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "../../public/temp");
    },
    filename: function (req, file, callback) {
        const uniqueFileName = Date.now() + "-" + file.originalname;
        callback(null, uniqueFileName);
    },
});

const upload = multer({ storage }); // syntax - same as {storage: storage} - es6 feature
export { upload };
