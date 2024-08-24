//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? add to cart schema validation
const addToCartSchema = {
    body: Joi.object({
        quantity: generalRule.quantity,
    }),
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

//? remove from cart schema validation
const removeFromCartSchema = {
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

//? update cart schema validation
const updateCartSchema = {
    body: Joi.object({
        quantity: generalRule.quantity,
    }),
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

export { addToCartSchema, removeFromCartSchema, updateCartSchema };
