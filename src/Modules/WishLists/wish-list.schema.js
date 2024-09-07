//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create wish-list schema validation
const createWishListSchema = {
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

//? update wish-list schema validation
const updateWishListSchema = {
    params: Joi.object({
        productId: generalRule.objectId,
    }),
};

//? get specific wish-list schema validation
const getSpecificWishListSchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
};

export { createWishListSchema, updateWishListSchema, getSpecificWishListSchema };
