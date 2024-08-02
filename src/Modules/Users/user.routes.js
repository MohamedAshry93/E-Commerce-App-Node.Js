import { Router } from "express";
import * as userController from "./user.controller.js";
import * as middleware from "../../Middlewares/index.js";

const userRouter = Router();

export { userRouter };
