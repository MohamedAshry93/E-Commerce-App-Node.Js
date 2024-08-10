import { Router } from "express";
import * as brandController from "./brand.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions } from "../../Utils/index.js";

//# models
import { Brand } from "../../../database/Models/index.js";

const brandRouter = Router();

//# add brand API router
brandRouter.post(
    "/create",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(Brand)),
    middleware.errorHandling(brandController.createBrand)
);

//# get all brands API router
brandRouter.get("/all", middleware.errorHandling(brandController.getAllBrands));

//# get brands for specific subCategory or category or name API routers
brandRouter.get(
    "/all-brands",
    middleware.errorHandling(brandController.getBrands)
);

//# get brand API router
brandRouter.get("/", middleware.errorHandling(brandController.getBrand));

//# update brand API router
brandRouter.put(
    "/update/:_id",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .single("image")
    ),
    middleware.errorHandling(middleware.modelNameExist(Brand)),
    middleware.errorHandling(brandController.updateBrand)
);

//# delete brand API router
brandRouter.delete(
    "/delete/:_id",
    middleware.errorHandling(brandController.deleteBrand)
);

export { brandRouter };
