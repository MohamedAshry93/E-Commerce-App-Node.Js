import { Router } from "express";
import * as categoryController from "./category.controller.js";
import * as middleware from "../../Middlewares/index.js";
import { extensions } from "../../Utils/index.js";
import { Category } from "./../../../database/Models/index.js";

const categoryRouter = Router();

categoryRouter.post(
    "/create",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({
                allowedExtensions: extensions.IMAGE_EXTENSIONS,
            })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(Category)),
    middleware.errorHandling(categoryController.createCategory)
);

categoryRouter.get(
    "/",
    middleware.errorHandling(categoryController.getCategory)
);

categoryRouter.put(
    "/update/:_id",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({
                allowedExtensions: extensions.IMAGE_EXTENSIONS,
            })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(Category)),
    middleware.errorHandling(categoryController.updateCategory)
);

categoryRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(categoryController.deleteCategory)
);

export { categoryRouter };
