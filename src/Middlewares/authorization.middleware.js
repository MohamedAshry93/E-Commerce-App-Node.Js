//# utils
import { ErrorHandlerClass } from "../Utils/index.js";

const authorizationMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        //? loggedIn role
        const user = req.authUser;
        //? allowed roles
        if (!allowedRoles.includes(user.userType)) {
            return next(
                new ErrorHandlerClass(
                    "Unauthorized access",
                    401,
                    "Error in authorization middleware",
                    "You are not allowed to access this route",
                    {
                        userData: {
                            name: user.userName,
                            email: user.email,
                            userType: user.userType,
                        },
                    }
                )
            );
        }
        next();
    };
};

export { authorizationMiddleware };
