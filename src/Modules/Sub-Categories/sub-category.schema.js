//# dependencies
import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? create SubCategory schema validation
const createSubCategorySchema = {
    body: Joi.object({
        name: generalRule.name,
    }),
    params: Joi.object({
        categoryId: generalRule.objectId,
    }),
};

//? get SubCategory schema validation
const getSubCategorySchema = {
    query: Joi.object({
        id: generalRule.objectId.optional(),
        name: generalRule.name.optional(),
        slug: generalRule.slug,
    }),
};

//? update SubCategory schema validation
const updateSubCategorySchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
    body: Joi.object({
        name: generalRule.name.optional(),
        old_public_id: generalRule.old_public_id,
    }),
};

//? delete SubCategory schema validation
const deleteSubCategorySchema = {
    params: Joi.object({
        _id: generalRule.objectId,
    }),
};

export {
    createSubCategorySchema,
    getSubCategorySchema,
    updateSubCategorySchema,
    deleteSubCategorySchema,
};
