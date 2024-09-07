//# dependencies
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

//# utils
import { ErrorHandlerClass } from "../Utils/index.js";

//# models
import { User } from "../../database/Models/index.js";

const authenticationMiddleware = () => {
    return async (req, res, next) => {
        //? destruct token
        const { token } = req.headers;
        //? check token
        if (!token) {
            return next(
                new ErrorHandlerClass(
                    "Please login to access this resource",
                    401,
                    "Error in authenticationMiddleware API",
                    "at authentication middleware",
                    { token }
                )
            );
        }
        //? check bearer token
        if (!token.startsWith(process.env.TOKEN_PREFIX)) {
            return next(
                new ErrorHandlerClass(
                    "Invalid token",
                    401,
                    "Error in authenticationMiddleware API",
                    "at authentication middleware",
                    { token }
                )
            );
        }
        //? get token without bearer
        const originalToken = token.split(" ")[1];
        //? verify token
        const decodedData = jwt.verify(originalToken, process.env.LOGIN_SECRET);
        //? check decoded data
        if (!decodedData?.userId) {
            return next(
                new ErrorHandlerClass(
                    "Invalid token payload",
                    401,
                    "Error in verify decodedData",
                    "at authentication middleware",
                    { token }
                )
            );
        }
        //? find user by id
        const user = await User.findById(decodedData?.userId).select("-password");
        //? check user exists in database
        if (!user) {
            return next(
                new ErrorHandlerClass(
                    "Please signUp and try to logIn again",
                    401,
                    "Error in findUserById",
                    "at authentication middleware",
                    { userId: decodedData.userId }
                )
            );
        }
        //? check password change time with iat
        let timeChangedPassword = parseInt(
            DateTime.fromJSDate(user.passwordChangedAt).toSeconds()
        );
        if (timeChangedPassword > decodedData.iat) {
            return next(
                new ErrorHandlerClass(
                    "Token expired. Please login again",
                    401,
                    "Error in authenticationMiddleware API",
                    "at authentication middleware",
                    { token }
                )
            );
        }
        //? send user data to next middleware
        req.authUser = user;
        next();
    };
};

export { authenticationMiddleware };
