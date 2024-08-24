//# dependencies
import { Router } from "express";

//# controllers
import * as cartController from "./cart.controller.js";

//# schemas
import * as cartSchema from "./cart.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { SystemRoles } from "../../Utils/index.js";

const cartRouter = Router();

//! add to cart API router
cartRouter.post(
    "/add/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(cartSchema.addToCartSchema)
    ),
    middleware.errorHandling(cartController.addToCart)
);

//! remove from cart API router
cartRouter.put(
    "/remove/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(cartSchema.removeFromCartSchema)
    ),
    middleware.errorHandling(cartController.removeFromCart)
);

//! update cart API router
cartRouter.put(
    "/update/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(cartSchema.updateCartSchema)
    ),
    middleware.errorHandling(cartController.updateCart)
);

//! get cart API router
cartRouter.get(
    "/",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(cartController.getCart)
);

export { cartRouter };
