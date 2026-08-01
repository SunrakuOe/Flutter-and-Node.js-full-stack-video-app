import multer from "multer";

//TODO: see what multer do in express.js documentations
//TODO: see whatever files coming to the backend - can we directly upload it to the file storeage without saving it locally without using mutler
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
