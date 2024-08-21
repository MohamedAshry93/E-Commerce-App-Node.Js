import { Router } from "express";

//# controller
import * as addressController from "./address.controller.js";

//# schema
import * as addressSchema from "./address.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { systemRoles } from "../../Utils/enums.utils.js";

const addressRouter = Router();

//! add address API router
addressRouter.post(
    "/add-address",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(systemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(addressSchema.addAddressSchema)
    ),
    middleware.errorHandling(addressController.addAddress)
);

//! update address API router
addressRouter.put(
    "/update-address/:addressId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(systemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(addressSchema.editAddressSchema)
    ),
    middleware.errorHandling(addressController.editAddress)
);

//! soft delete address API router
addressRouter.put(
    "/soft-delete/:addressId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(systemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(addressSchema.removeAddressSchema)
    ),
    middleware.errorHandling(addressController.removeAddress)
);

//! recovering address API router
addressRouter.put(
    "/recover-address/:addressId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(addressController.recoverAddress)
);

//! get all user addresses API router
addressRouter.get(
    "/user-addresses",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(addressController.getAllUserAddresses)
);

export { addressRouter };
