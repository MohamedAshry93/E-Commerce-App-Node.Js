import { config } from "dotenv";
import express from "express";
import path from "path";

import connectionDB from "./database/connection.js";
import * as routers from "./src/Modules/index.js";
import { ErrorHandlerClass } from "./src/Utils/error-class.utils.js";
import { globalResponse } from "./src/Middlewares/index.js";

if (process.env.NODE_ENV == "prod") {
    config({ path: path.resolve(".prod.env") });
}
if (process.env.NODE_ENV == "dev") {
    config({ path: path.resolve(".dev.env") });
}
config();

const app = express();
let port = process.env.PORT;

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

connectionDB();

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
