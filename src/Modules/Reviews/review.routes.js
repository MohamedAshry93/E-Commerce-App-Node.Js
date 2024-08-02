import { Router } from "express";
import * as reviewController from "./review.controller.js";
import * as middleware from "../../Middlewares/index.js";

const reviewRouter = Router();

export { reviewRouter };
