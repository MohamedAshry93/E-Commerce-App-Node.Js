import { Router } from "express";
import * as cartController from "./cart.controller.js";
import * as middleware from "../../Middlewares/index.js";

const cartRouter = Router();

export { cartRouter };
