//# dependencies
import Joi from "joi";

//# utils
import { generalRule, PaymentMethod } from "../../Utils/index.js";

//? create order schema validation
const createOrderSchema = {
    body: Joi.object({
        address: Joi.string().messages({
            "string.base": "Address must be a string",
            "any.required": "Address is a required field",
        }),
        addressId: generalRule.objectId.optional(),
        contactNumber: generalRule.phone,
        shippingFee: Joi.number().positive().required().messages({
            "number.base": "shippingFee must be a number",
            "number.empty": "Invalid shippingFee it cannot be an empty string",
            "any.required": "shippingFee is required",
        }),
        VAT: Joi.number().positive().required().messages({
            "number.base": "VAT must be a number",
            "number.empty": "Invalid VAT it cannot be an empty string",
            "any.required": "VAT is required",
        }),
        paymentMethod: Joi.string()
            .valid(...Object.values(PaymentMethod))
            .required()
            .messages({
                "string.base": "paymentMethod must be a string",
                "any.only": `paymentMethod must be one of ${Object.values(
                    PaymentMethod
                ).join(", ")}`,
                "any.required": "paymentMethod is required",
            }),
        couponCode: generalRule.couponCode.optional(),
        fromCart: Joi.boolean().valid(true, false).messages({
            "boolean.base": "fromCart must be a boolean",
            "any.only": "fromCart must be true or false",
        }),
    }),
};

//? cancel order schema validation
const cancelOrderSchema = {
    params: Joi.object({
        orderId: generalRule.objectId,
    }),
};

//? delivered order schema validation
const deliveredOrderSchema = {
    params: Joi.object({
        orderId: generalRule.objectId,
    }),
};

//? get specific order details schema validation
const getOrderDetailsByIdSchema = {
    params: Joi.object({
        orderId: generalRule.objectId,
    }),
};

export {
    createOrderSchema,
    cancelOrderSchema,
    deliveredOrderSchema,
    getOrderDetailsByIdSchema,
};
