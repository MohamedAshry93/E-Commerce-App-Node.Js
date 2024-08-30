//# dependencies
import { Router } from "express";

//# controller
import * as orderController from "./order.controller.js";

//# schemas
import * as orderSchema from "./order.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { SystemRoles } from "../../Utils/index.js";

const orderRouter = Router();

//! create order API router
orderRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(orderSchema.createOrderSchema)
    ),
    middleware.errorHandling(orderController.createOrder)
);

//! cancel order API router
orderRouter.put(
    "/cancel/:orderId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(orderSchema.cancelOrderSchema)
    ),
    middleware.errorHandling(orderController.cancelOrder)
);

//! delivered order API router
orderRouter.put(
    "/delivered/:orderId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(orderSchema.deliveredOrderSchema)
    ),
    middleware.errorHandling(orderController.deliveredOrder)
);

//! get all orders API router
orderRouter.get(
    "/list-orders",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(orderController.listOrders)
);

//! get order details API router
orderRouter.get(
    "/order/:orderId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(orderSchema.getOrderDetailsByIdSchema)
    ),
    middleware.errorHandling(orderController.getOrderDetails)
);

export { orderRouter };
