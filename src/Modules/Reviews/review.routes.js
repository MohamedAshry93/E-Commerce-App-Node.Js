//# dependencies
import { Router } from "express";

//# controller
import * as reviewController from "./review.controller.js";

//# middlewares
import * as middleware from "../../Middlewares/index.js";

//# schemas
import * as reviewSchema from "./review.schema.js";

//# utils
import { SystemRoles } from "../../Utils/index.js";

const reviewRouter = Router();

//! add review API router
reviewRouter.post(
    "/add/:productId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(reviewSchema.createReviewSchema)
    ),
    middleware.errorHandling(reviewController.addReview)
);

//! get user reviews API router
reviewRouter.get(
    "/list",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.USER)
    ),
    middleware.errorHandling(reviewController.getUserReviews)
);

//! change review status API router
reviewRouter.patch(
    "/change-status/:reviewId",
    middleware.errorHandling(middleware.authenticationMiddleware()),
    middleware.errorHandling(
        middleware.authorizationMiddleware(SystemRoles.COMPANY_ADMIN)
    ),
    middleware.errorHandling(
        middleware.validationMiddleware(reviewSchema.changeReviewStatusSchema)
    ),
    middleware.errorHandling(reviewController.changeReviewStatus)
);

export { reviewRouter };
