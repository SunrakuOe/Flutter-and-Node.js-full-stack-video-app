//it is a custom error handling middleware. don't confused with my function name with some tyr-catch stuff
const errorHandler = (err, req, res, next) => {
/*      
NOTE: don't send any Error directly in the json because you will get only {}. yes and in our case if it is a ApiError (an inherited class of Error) we get only the extras we have defined =  {
    "statusCode": 401,
    "data": null,
    "success": false,
    "errors": []
} and we don't get any message or anything 

*/
    console.log(err);
    return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message,
        data: null,
        success: false,
    });
};

export { errorHandler };
