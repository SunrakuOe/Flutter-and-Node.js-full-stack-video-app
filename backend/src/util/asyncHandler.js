/* 
NOTE: 
- The problem - most of the time we deal with any async code we wrap them with try-catch 'cause they can break and give errors.
- To get rid of this repetative try-catch boilerplate we are creating this wrapper functoin which takes our async function -> return another function inside which our method is get called within try-catch block (or we can say inside that returned function our method is wrapped in try-catch) -> now that returned function we can call whereever, multiple times we need
    - remember we don't call the async functon directly inside the handler - we call it inside a returned functon so that we can call it later anywhere we need and multiple times if we need - we don't want to call it immediately
*/

// we made this higher order function to wrap route handlers (middlewares, controllers). so use this mehod only for route handlers. the express pass the req, res, etc to the route handlers

// NOTE: So you are thinking that - "Hey I am not passing the next wile defining the request handlers so, how/where it is getting the next here". How dumb I am, bro the returned function is getting called by express itself because you are passing those as the route handlers(controllers, middlewares) it the routes and express is passing those parameters. Now you know buddy?
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        /* 
            NOTE: The Promise.resolve(value) just wraps a value in promise if it is not already a Promise
            - it returns a Promise object resolved with that given value
            - as we are handling the error using promise (using .catch) we need to be sure that it is a Promise
            - if the value is a regular value (string, number, object, array etc.), then it returns a Promise already fulfilled with that value
            - if the value is a Promise then it simply returns that exact same Promise value directly, rather than nexting it to a new one
            - if the value is a thenable object (an object with a .then() method) then it returns a Promise that follows the then() of the thenable object (means if you do the .then() on the returned Promise js will call the .then() of the thenable object)
        */
        Promise.resolve(requestHandler(req, res, next)).catch(
            (err) =>
                next(err)

            /* 
                NOTE: so next() is express's built-in function to pass control to the next middleware - and specifically, if you call the next() with an argument for example next(error) then Expres treats it as an error and forwarrd it(the argument passed - like error here) to your error-handleing middleware
                - you can simply say next(argument) means indicatoin to call the nearest error-handling middleware
                - don't skip next(arg) here because it is Expresse's own mechanism that moves the control to the error handling middleware, means 
                        - it skips all the normal middlewares 
                        - jumps straight to the nearest error-handling-middleware(an error handling middleware is any middleware with arity 4 - means 4 argumensts - err, req, res, next)
                - if you skip the next(err) then it move to the next middleware - Example user not authenticated but still the next middleware(getVideo) run and the user get the video

                - also you can do catch(next) instead of .catch((err) => next(err)) because .catch need a callback and it call that with the err argument and if you pass the next as callback then the .catch call that next with the err. big brain :)
            */
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
