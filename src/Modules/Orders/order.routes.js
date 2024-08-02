import { Router } from "express";
import * as orderController from "./order.controller.js";
import * as middleware from "../../Middlewares/index.js";

const orderRouter = Router();

export { orderRouter };
