import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create category schema validation
const createCategorySchema = {
    body: Joi.object({
        name: generalRule.name,
    }),
};

//? get category schema validation
const getCategorySchema = {
    query: Joi.object({
        id: generalRule.objectId.optional(),
        name: generalRule.name.optional(),
        slug: generalRule.slug,
    }),
};

//? update category schema validation
const updateCategorySchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
    body: Joi.object({
        name: generalRule.name.optional(),
        old_public_id: generalRule.old_public_id,
    }),
};

//? delete category schema validation
const deleteCategorySchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
};

export {
    createCategorySchema,
    getCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
};
