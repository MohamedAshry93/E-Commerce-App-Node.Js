//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create brand schema validation
const createBrandSchema = {
    params: Joi.object({
        category: generalRule.objectId,
        subCategory: generalRule.objectId,
    }),
    body: Joi.object({
        name: generalRule.name,
    }),
};

//? get brand schema validation
const getBrandSchema = {
    query: Joi.object({
        id: generalRule.objectId.optional(),
        name: generalRule.name.optional(),
        slug: generalRule.slug,
    }),
};

//? update brand schema validation
const updateBrandSchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
    body: Joi.object({
        name: generalRule.name.optional(),
        old_public_id: generalRule.old_public_id,
    }),
};

//? delete brand schema validation
const deleteBrandSchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
};

//? Get brands schema validation
const getBrandsSchema = {
    query: Joi.object({
        category: generalRule.objectId.optional(),
        subCategory: generalRule.objectId.optional(),
        name: generalRule.name.optional(),
    }),
};

export {
    createBrandSchema,
    getBrandSchema,
    updateBrandSchema,
    deleteBrandSchema,
    getBrandsSchema,
};
