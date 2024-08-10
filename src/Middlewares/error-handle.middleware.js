import { ErrorHandlerClass } from "../Utils/index.js";

const errorHandling = (API) => {
    return (req, res, next) => {
        API(req, res, next)?.catch((err) => {
            console.log("Error in async handling middleware", err);
            const insights = {
                error: "unhandled API error",
            };
            next(
                new ErrorHandlerClass(
                    "Internal Server Error",
                    500,
                    err.message,
                    err.stack,
                    insights
                )
            );
        });
    };
};

const globalResponse = (err, req, res, next) => {
    if (err) {
        res.status(err.statusCode || 500).json({
            message: "Fail Response",
            error_message: err.message,
            error_location: err.location,
            error_data: err.data,
            error_stack: err.stack,
        });
    }
};

export { errorHandling, globalResponse };
