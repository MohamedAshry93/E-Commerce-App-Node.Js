import { Router } from "express";

//# controller
import * as userController from "./user.controller.js";

//# schema
import * as userSchema from "./user.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

const userRouter = Router();

//! add product API router
userRouter.post(
    "/signup",
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.signUpSchema)
    ),
    middleware.errorHandling(middleware.checkUserDataExist()),
    middleware.errorHandling(userController.signUp)
);

//! verify email API router
userRouter.get(
    "/verify-email/:token",
    middleware.errorHandling(userController.verifyEmail)
);

//! login API router
userRouter.post(
    "/login",
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.signInSchema)
    ),
    middleware.errorHandling(userController.signIn)
);

//! logout API router
userRouter.post(
    "/logout",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(userController.signOut)
);

//! update profile API router
userRouter.put(
    "/update-profile",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.updateUserSchema)
    ),
    middleware.errorHandling(middleware.checkUserDataExist()),
    middleware.errorHandling(userController.updatedAccount)
);

//! delete account API router
userRouter.delete(
    "/delete-account",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(userController.deletedAccount)
);

//! get account user data
userRouter.get(
    "/user-data",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(userController.getAccountData)
);

//! update password API router
userRouter.put(
    "/update-password",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.updatePasswordSchema)
    ),
    middleware.errorHandling(userController.updatedPassword)
);

//! forget password API router
userRouter.post(
    "/forget-password",
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.forgetPasswordSchema)
    ),
    middleware.errorHandling(userController.forgetPassword)
);

//! reset password API router
userRouter.post(
    "/reset-password",
    middleware.errorHandling(
        middleware.validationMiddleware(userSchema.resetPasswordSchema)
    ),
    middleware.errorHandling(userController.resetPassword)
);

export { userRouter };
