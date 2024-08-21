import { Router } from "express";

//# controller
import * as brandController from "./brand.controller.js";

//# schema
import * as brandSchema from "./brand.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions, systemRoles } from "../../Utils/index.js";

//# models
import { Brand } from "../../../database/Models/index.js";

const brandRouter = Router();

//! add brand API router
brandRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(systemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(brandSchema.createBrandSchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(Brand)),
    middleware.errorHandling(brandController.createBrand)
);

//! get brands for specific subCategory or category or name API routers
brandRouter.get(
    "/all-brands",
    middleware.errorHandling(
        middleware.validationMiddleware(brandSchema.getBrandsSchema)
    ),
    middleware.errorHandling(brandController.getBrands)
);

//! get all brands API router
brandRouter.get("/list", middleware.errorHandling(brandController.getAllBrands));

//! get brand API router
brandRouter.get(
    "/",
    middleware.errorHandling(
        middleware.validationMiddleware(brandSchema.getBrandSchema)
    ),
    middleware.errorHandling(brandController.getBrand)
);

//! update brand API router
brandRouter.put(
    "/update/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(middleware.authorizationMiddleware(systemRoles.COMPANY_ADMIN)),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(brandSchema.updateBrandSchema)
    ),
    middleware.errorHandling(middleware.modelNameExist(Brand)),
    middleware.errorHandling(brandController.updateBrand)
);

//! delete brand API router
brandRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(middleware.authorizationMiddleware(systemRoles.COMPANY_ADMIN)),
    middleware.errorHandling(
        middleware.validationMiddleware(brandSchema.deleteBrandSchema)
    ),
    middleware.errorHandling(brandController.deleteBrand)
);

export { brandRouter };
