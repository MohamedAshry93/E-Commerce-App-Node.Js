import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? add address schema validation
const addAddressSchema = {
    body: Joi.object({
        country: generalRule.country,
        city: generalRule.city,
        postalCode: generalRule.postalCode,
        buildingNumber: generalRule.buildingNumber,
        floorNumber: generalRule.floorNumber,
        addressLabel: generalRule.addressLabel,
        setAsDefault: Joi.boolean().valid(true, false).optional().messages({
            "any.only": "setAsDefault must be either true or false",
            "boolean.base": "setAsDefault must be a boolean",
            "boolean.empty": "Invalid setAsDefault it cannot be an empty boolean",
        }),
    }),
};

//? edit address schema validation
const editAddressSchema = {
    body: Joi.object({
        country: generalRule.country.optional(),
        city: generalRule.city.optional(),
        postalCode: generalRule.postalCode.optional(),
        buildingNumber: generalRule.buildingNumber.optional(),
        floorNumber: generalRule.floorNumber.optional(),
        addressLabel: generalRule.addressLabel.optional(),
        setAsDefault: Joi.boolean().valid(true, false).optional().messages({
            "any.only": "setAsDefault must be either true or false",
            "boolean.base": "setAsDefault must be a boolean",
            "boolean.empty": "Invalid setAsDefault it cannot be an empty boolean",
        }),
    }),
    params: Joi.object({
        addressId: generalRule.objectId,
    }),
};

//? remove address schema validation
const removeAddressSchema = {
    params: Joi.object({
        addressId: generalRule.objectId,
    }),
};

//? recover address schema validation
const recoverAddressSchema = {
    params: Joi.object({
        addressId: generalRule.objectId,
    }),
};

export {
    addAddressSchema,
    editAddressSchema,
    removeAddressSchema,
    recoverAddressSchema,
};
