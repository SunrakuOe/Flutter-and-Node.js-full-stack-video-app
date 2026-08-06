/* 
NOTE: 
- The problem - most of the time we deal with any async code we wrap them with try-catch 'cause they can break and give errors.
- To get rid of this repetative try-catch boilerplate we are creating this wrapper functoin which takes our async function -> return another function inside which our method is get called within try-catch block (or we can say inside that returned function our method is wrapped in try-catch) -> now that returned function we can call whereever, multiple times we need
    - remember we don't call the async functon directly inside the handler - we call it inside a returned functon so that we can call it later anywhere we need and multiple times if we need - we don't want to call it immediately
*/
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            //TODO: what next() is doing here in the error part and how is it even working though I am not passing the next() in arguments in many places
            next(err.message || err)
        );
    };
};

export { asyncHandler };

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
