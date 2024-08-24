//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create coupon schema validation
const createCouponSchema = {
    body: Joi.object({
        couponCode: generalRule.couponCode,
        couponAmount: generalRule.couponAmount,
        couponType: generalRule.couponType,
        from: generalRule.from,
        till: generalRule.till,
        couponAssignedToUsers: Joi.array()
            .items(
                Joi.object({
                    userId: generalRule.objectId,
                    maxCount: generalRule.maxCount,
                    numberOfUsage: generalRule.numberOfUsage,
                })
            )
            .required(),
        isEnable: generalRule.isEnable.optional(),
    }),
};

//? get all coupons schema validation
const getAllCouponsSchema = {
    query: Joi.object({
        isEnable: generalRule.isEnable.optional(),
    }),
};

//? get coupon details by id schema validation
const getCouponDetailsByIdSchema = {
    params: Joi.object({
        couponId: generalRule.objectId,
    }),
};

//? update coupon schema validation
const updateCouponSchema = {
    params: Joi.object({
        couponId: generalRule.objectId,
    }),
    body: Joi.object({
        couponCode: generalRule.couponCode.optional(),
        couponAmount: generalRule.couponAmount.optional(),
        couponType: generalRule.couponType.optional(),
        from: generalRule.from.optional(),
        till: generalRule.till.optional(),
        couponAssignedToUsers: Joi.array()
            .items(
                Joi.object({
                    userId: generalRule.objectId,
                    maxCount: generalRule.maxCount,
                    numberOfUsage: generalRule.numberOfUsage,
                })
            )
            .optional(),
    }),
};

//? disable or enable coupon schema validation
const disableOrEnableCouponSchema = {
    params: Joi.object({
        couponId: generalRule.objectId,
    }),
    body: Joi.object({
        isEnable: generalRule.isEnable,
    }),
};

export {
    createCouponSchema,
    getAllCouponsSchema,
    getCouponDetailsByIdSchema,
    updateCouponSchema,
    disableOrEnableCouponSchema,
};
