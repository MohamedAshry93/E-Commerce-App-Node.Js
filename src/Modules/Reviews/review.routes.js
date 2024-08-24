//# dependencies
import { Router } from "express";

//# controller
import * as reviewController from "./review.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

const reviewRouter = Router();

export { reviewRouter };
