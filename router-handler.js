//# dependencies
import cors from "cors";
import express from "express";

//# modules
import * as routers from "./src/Modules/index.js";

//# middlewares
import { globalResponse } from "./src/Middlewares/index.js";

//# utils
import { ErrorHandlerClass } from "./src/Utils/index.js";

const routerHandler = (app) => {
    //# routers handling
    app.use(cors());
    app.use(express.json());

    //# REST APIS
    app.use("/users", routers.userRouter);
    app.use("/products", routers.productRouter);
    app.use("/categories", routers.categoryRouter);
    app.use("/sub-categories", routers.subCategoryRouter);
    app.use("/brands", routers.brandRouter);
    app.use("/reviews", routers.reviewRouter);
    app.use("/coupons", routers.couponRouter);
    app.use("/orders", routers.orderRouter);
    app.use("/carts", routers.cartRouter);
    app.use("/addresses", routers.addressRouter);
    app.use("/wish-lists", routers.wishListRouter);

    //# global error handling middleware
    app.use("*", (req, res, next) =>
        next(
            new ErrorHandlerClass(
                `Invalid url ${req.originalUrl}`,
                404,
                "at index.js or modules.routes.js",
                "error in API route",
                "No route found"
            )
        )
    );
    app.use(globalResponse);
};

export { routerHandler };
