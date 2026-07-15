import "dotenv/config";
import connectDB from "./db/db.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error;
        });
        app.listen(port, () => {
            console.log(`Server is listening on ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO DB connection failed : ", err);
    });
