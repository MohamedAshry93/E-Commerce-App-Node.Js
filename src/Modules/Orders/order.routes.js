//# dependencies
import { Router } from "express";

//# controller
import * as orderController from "./order.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

const orderRouter = Router();

export { orderRouter };
