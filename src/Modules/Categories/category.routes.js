import { Router } from "express";
import * as categoryController from "./category.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions } from "../../Utils/index.js";

//# models
import { Category } from "./../../../database/Models/index.js";

const categoryRouter = Router();

//# add category API router
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

//# get category API router
categoryRouter.get(
    "/",
    middleware.errorHandling(categoryController.getCategory)
);

//# update category API router
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

//# delete category API router
categoryRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(categoryController.deleteCategory)
);

export { categoryRouter };
