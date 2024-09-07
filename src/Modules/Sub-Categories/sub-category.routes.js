//# dependencies
import { Router } from "express";

//# controllers
import * as subCategoryController from "./sub-category.controller.js";

//# schemas
import * as subCategorySchema from "./sub-category.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions, SystemRoles } from "../../Utils/index.js";

//# models
import { SubCategory } from "./../../../database/Models/index.js";

const subCategoryRouter = Router({ mergeParams: true });

//! add sub-category API router
subCategoryRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(subCategorySchema.createSubCategorySchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(SubCategory)),
    middleware.errorHandling(subCategoryController.createSubCategory)
);

//! get all sub-categories API router
subCategoryRouter.get(
    "/all",
    middleware.errorHandling(subCategoryController.getAllSubCategories)
);

//! get sub-category API router
subCategoryRouter.get(
    "/",
    middleware.errorHandling(
        middleware.validationMiddleware(subCategorySchema.getSubCategorySchema)
    ),
    middleware.errorHandling(subCategoryController.getSubCategory)
);

//! update sub-category API router
subCategoryRouter.put(
    "/update/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(subCategorySchema.updateSubCategorySchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(SubCategory)),
    middleware.errorHandling(subCategoryController.updateSubCategory)
);

//! delete sub-category API router
subCategoryRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(subCategorySchema.deleteSubCategorySchema)
    ),
    middleware.errorHandling(subCategoryController.deleteSubCategory)
);

export { subCategoryRouter };
