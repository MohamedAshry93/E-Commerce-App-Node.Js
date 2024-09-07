//# dependencies
import { Router } from "express";

//# controllers
import * as categoryController from "./category.controller.js";

//# schemas
import * as categorySchema from "./category.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions, SystemRoles } from "../../Utils/index.js";

//# models
import { Category } from "./../../../database/Models/index.js";

//# models route
import { subCategoryRouter } from "../Sub-Categories/sub-category.routes.js";
import { brandRouter } from "../Brands/brand.routes.js";
import { productRouter } from "../Products/product.routes.js";

const categoryRouter = Router();

//$ merged categoryId with sub-category API routers
categoryRouter.use("/:categoryId/sub-categories", subCategoryRouter);

//$ merged categoryId and subCategoryId with brand API routers
categoryRouter.use("/:category/:subCategory/brands", brandRouter);

//$ merged categoryId subCategoryId and brandId with product API routers
categoryRouter.use(
    "/:categoryId/:subCategoryId/:brandId/products",
    productRouter
);

//! add category API router
categoryRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({
                allowedExtensions: extensions.IMAGE_EXTENSIONS,
            })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(categorySchema.createCategorySchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(Category)),
    middleware.errorHandling(categoryController.createCategory)
);

//! get all categories API router
categoryRouter.get(
    "/all",
    middleware.errorHandling(categoryController.getAllCategories)
);

//! get category API router
categoryRouter.get(
    "/",
    middleware.errorHandling(
        middleware.validationMiddleware(categorySchema.getCategorySchema)
    ),
    middleware.errorHandling(categoryController.getCategory)
);

//! update category API router
categoryRouter.put(
    "/update/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({
                allowedExtensions: extensions.IMAGE_EXTENSIONS,
            })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(categorySchema.updateCategorySchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(Category)),
    middleware.errorHandling(categoryController.updateCategory)
);

//! delete category API router
categoryRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(categorySchema.deleteCategorySchema)
    ),
    middleware.errorHandling(categoryController.deleteCategory)
);

export { categoryRouter };
