//# dependencies
import Joi from "joi";

//# utils
import { generalRule, ReviewStatus } from "../../Utils/index.js";

//? create review schema validation
const createReviewSchema = {
    body: Joi.object({
        rating: generalRule.rating,
        comment: Joi.string().messages({
            "string.base": "Comment must be a string",
            "string.empty": "Comment cannot be empty",
        }),
    }),
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

//? change review status schema validation
const changeReviewStatusSchema = {
    params: Joi.object({
        reviewId: generalRule.objectId,
    }),
    body: Joi.object({
        status: Joi.string()
            .valid(ReviewStatus.APPROVED, ReviewStatus.REJECTED)
            .messages({
                "string.base": "Status must be a string",
                "string.empty": "Status cannot be empty",
                "any.required": "Status is required",
                "any.only": `Status must be one of ${ReviewStatus.APPROVED} or ${ReviewStatus.REJECTED}`,
            })
    }),
};

export { createReviewSchema, changeReviewStatusSchema };
