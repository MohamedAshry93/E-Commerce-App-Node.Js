//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create product schema validation
const createProductSchema = {
    body: Joi.object({
        title: generalRule.title,
        description: generalRule.description,
        specs: generalRule.specs,
        price: generalRule.price,
        discountAmount: generalRule.discountAmount,
        discountType: generalRule.discountType,
        badge: generalRule.badge,
        stock: generalRule.stock,
        rating: generalRule.rating,
    }),
};

//? get product schema validation
const getProductSchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
};

//? update product schema validation
const updateProductSchema = {
    params: Joi.object({
        productId: generalRule.objectId,
    }),
    body: Joi.object({
        title: generalRule.title.optional(),
        description: generalRule.description.optional(),
        specs: generalRule.specs.optional(),
        price: generalRule.price.optional(),
        discountAmount: generalRule.discountAmount.optional(),
        discountType: generalRule.discountType.optional(),
        badge: generalRule.badge.optional(),
        stock: generalRule.stock.optional(),
        rating: generalRule.rating.optional(),
        old_public_ids: generalRule.old_public_id,
    }),
};

//? delete product schema validation
const deleteProductSchema = {
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

export {
    createProductSchema,
    getProductSchema,
    updateProductSchema,
    deleteProductSchema,
};
