import { Router } from "express";
import * as productController from "./product.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions } from "../../Utils/index.js";

//# models
import { Brand } from "../../../database/Models/index.js";

const productRouter = Router();

//# add product API router
productRouter.post(
    "/create",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .array("images", 5)
    ),
    middleware.errorHandling(middleware.checkIdsExist(Brand)),
    middleware.errorHandling(productController.createProduct)
);

//# update product API router
productRouter.put(
    "/update/:productId",
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .array("images", 5)
    ),
    middleware.errorHandling(middleware.checkIdsExist(Brand)),
    middleware.errorHandling(productController.updateProduct)
);

//# delete product API router
productRouter.delete(
    "/delete/:productId",
    middleware.errorHandling(productController.deleteProduct)
);

// # get all products API router
productRouter.get(
    "/all",
    middleware.errorHandling(productController.getAllProducts)
);

// # get product API router
productRouter.get(
    "/:_id",
    middleware.errorHandling(productController.getProduct)
);

export { productRouter };
