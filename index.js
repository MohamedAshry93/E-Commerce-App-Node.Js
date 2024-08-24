//# dependencies
import { config } from "dotenv";
import express from "express";
import path from "path";

//# connection
import connectionDB from "./database/connection.js";

//# modules
import * as routers from "./src/Modules/index.js";

//# utils
import { deleteAddressesCron, disableCouponsCron, ErrorHandlerClass } from "./src/Utils/index.js";

//# middlewares
import { globalResponse } from "./src/Middlewares/index.js";

//# config
if (process.env.NODE_ENV == "prod") {
    config({ path: path.resolve(".prod.env") });
}
if (process.env.NODE_ENV == "dev") {
    config({ path: path.resolve(".dev.env") });
}
config();

//# express app
const app = express();

//# port
let port = process.env.PORT;

//# routers
app.use(express.json());
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

connectionDB();
disableCouponsCron();
deleteAddressesCron();

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

//# start server
app.listen(port, () => console.log(`Example app listening on port ${port}! 👀`));
