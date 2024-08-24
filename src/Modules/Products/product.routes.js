//# dependencies
import { Router } from "express";

//# controllers
import * as productController from "./product.controller.js";

//# schemas
import * as productSchema from "./product.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { extensions, SystemRoles } from "../../Utils/index.js";

//# models
import { Brand } from "../../../database/Models/index.js";

const productRouter = Router();

//! add product API router
productRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .array("images", 5)
    ),
    // middleware.errorHandling(
    //     middleware.validationMiddleware(productSchema.createProductSchema)
    // ),
    middleware.errorHandling(middleware.checkIdsExist(Brand)),
    middleware.errorHandling(productController.createProduct)
);

//! update product API router
productRouter.put(
    "/update/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware
            .multerHostMiddleware({ allowedExtensions: extensions.IMAGE_EXTENSIONS })
            .array("images", 5)
    ),
    // middleware.errorHandling(
    //     middleware.validationMiddleware(productSchema.updateProductSchema)
    // ),
    middleware.errorHandling(middleware.checkIdsExist(Brand)),
    middleware.errorHandling(productController.updateProduct)
);

//! delete product API router
productRouter.delete(
    "/delete/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(productSchema.deleteProductSchema)
    ),
    middleware.errorHandling(productController.deleteProduct)
);

//! get all products API router
productRouter.get(
    "/all",
    middleware.errorHandling(productController.getAllProducts)
);

//! get product API router
productRouter.get(
    "/:_id",
    middleware.errorHandling(
        middleware.validationMiddleware(productSchema.getProductSchema)
    ),
    middleware.errorHandling(productController.getProduct)
);

export { productRouter };
