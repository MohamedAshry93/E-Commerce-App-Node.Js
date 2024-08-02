import { Router } from "express";
import * as productController from "./product.controller.js";
import * as middleware from "../../Middlewares/index.js";

const productRouter = Router();

export { productRouter };
