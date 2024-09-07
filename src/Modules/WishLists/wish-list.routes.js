//# dependencies
import { Router } from "express";

//# controllers
import * as wishListController from "./wish-list.controller.js";

//# schemas
import * as wishListSchema from "./wish-list.schema.js";

//# utils
import { GeneralRoles, SystemRoles } from "../../Utils/index.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

const wishListRouter = Router({ mergeParams: true });

//! create wish-list API router
wishListRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(wishListSchema.createWishListSchema)
    ),
    middleware.errorHandling(wishListController.createWishList)
);

//! update wish-list API router
wishListRouter.patch(
    "/remove",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(wishListSchema.updateWishListSchema)
    ),
    middleware.errorHandling(wishListController.removeWishList)
);

//! get all wish-list API router
wishListRouter.get(
    "/all",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(wishListController.getAllWishList)
);

//! get wish-list API router
wishListRouter.get(
    "/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(GeneralRoles.GENERAL_ROLES_USER_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(wishListSchema.getSpecificWishListSchema)
    ),
    middleware.errorHandling(wishListController.getWishList)
);

export { wishListRouter };
