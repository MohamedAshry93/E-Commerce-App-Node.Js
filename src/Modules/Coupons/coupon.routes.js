//# dependencies
import { Router } from "express";

//# controller
import * as couponController from "./coupon.controller.js";

//#  schemas
import * as couponSchema from "./coupon.schema.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# utils
import { GeneralRoles, SystemRoles } from "../../Utils/index.js";

const couponRouter = Router();

//! create coupon API router
couponRouter.post(
    "/create",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(couponSchema.createCouponSchema)
    ),
    middleware.errorHandling(middleware.checkCouponCodeExist()),
    middleware.errorHandling(couponController.createCoupon)
);

//! get all coupons API router
couponRouter.get(
    "/all",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(GeneralRoles.GENERAL_ROLES_USER_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(couponSchema.getAllCouponsSchema)
    ),
    middleware.errorHandling(couponController.getAllCoupons)
);

//! get coupon details by id API router
couponRouter.get(
    "/details/:couponId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(GeneralRoles.GENERAL_ROLES_USER_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(couponSchema.getCouponDetailsByIdSchema)
    ),
    middleware.errorHandling(couponController.getSpecificCoupon)
);

//! update coupon API router
couponRouter.put(
    "/update/:couponId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(couponSchema.updateCouponSchema)
    ),
    middleware.errorHandling(middleware.checkCouponCodeExist()),
    middleware.errorHandling(couponController.updateCoupon)
);

//! disable or enable coupon API router
couponRouter.patch(
    "/disable-or-enable/:couponId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(couponSchema.disableOrEnableCouponSchema)
    ),
    middleware.errorHandling(couponController.disableOrEnableCoupon)
);

export { couponRouter };
