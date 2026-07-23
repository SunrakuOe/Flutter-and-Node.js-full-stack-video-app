//TODO: Lern more bout this Error in documents from node
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; //TODO: assignment - learn about this.data
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); //info: stacktrace provides you the location of the error - Kaun se file ke kaun se line me code break/error hua hai (basically kahan error ko throw kiya gaya hai)
        }
    }
}

export { ApiError };
