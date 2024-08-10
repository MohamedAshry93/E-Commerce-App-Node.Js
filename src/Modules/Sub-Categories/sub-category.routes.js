import { Router } from "express";
import * as subCategoryController from "./sub-category.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions } from "../../Utils/index.js";

//# models
import { SubCategory } from "./../../../database/Models/index.js";

const subCategoryRouter = Router();

//# add sub-category API router
subCategoryRouter.post(
    "/create",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(SubCategory)),
    middleware.errorHandling(subCategoryController.createSubCategory)
);

//# get all sub-categories API router
subCategoryRouter.get(
    "/all",
    middleware.errorHandling(subCategoryController.getAllSubCategories)
);

//# get sub-category API router
subCategoryRouter.get(
    "/",
    middleware.errorHandling(subCategoryController.getSubCategory)
);

//# update sub-category API router
subCategoryRouter.put(
    "/update/:_id",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(SubCategory)),
    middleware.errorHandling(subCategoryController.updateSubCategory)
);

//# delete sub-category API router
subCategoryRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(subCategoryController.deleteSubCategory)
);

export { subCategoryRouter };
