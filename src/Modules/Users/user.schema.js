import Joi from "joi";

//# utils
import { generalRule } from "../../Utils/index.js";

//? user signUp schema validation
const signUpSchema = {
    body: Joi.object({
        userName: generalRule.userName,
        email: generalRule.email,
        password: generalRule.password,
        confirmPassword: generalRule.confirmPassword,
        userType: generalRule.userType,
        age: generalRule.age,
        gender: generalRule.gender,
        phone: generalRule.phone,
        country: generalRule.country,
        city: generalRule.city,
        postalCode: generalRule.postalCode,
        buildingNumber: generalRule.buildingNumber,
        floorNumber: generalRule.floorNumber,
        addressLabel: generalRule.addressLabel,
    }),
};

//? user logIn schema validation
const signInSchema = {
    body: Joi.object({
        email: generalRule.email,
        password: generalRule.password,
    }),
};

//? user update schema validation
const updateUserSchema = {
    body: Joi.object({
        userName: generalRule.userName.optional(),
        email: generalRule.email.optional(),
        age: generalRule.age.optional(),
        gender: generalRule.gender.optional(),
        phone: generalRule.phone.optional(),
    }),
};

//? user update password schema validation
const updatePasswordSchema = {
    body: Joi.object({
        password: generalRule.password,
        confirmPassword: generalRule.confirmPassword,
        oldPassword: generalRule.oldPassword,
    }),
};

//? user forget password schema validation
const forgetPasswordSchema = {
    body: Joi.object({
        email: generalRule.email,
    }),
};

//? user reset password schema validation
const resetPasswordSchema = {
    body: Joi.object({
        email: generalRule.email,
        password: generalRule.password,
        confirmPassword: generalRule.confirmPassword,
        otp: Joi.string().required().messages({
            "string.base": "otp must be a string",
            "string.empty": "Invalid otp it cannot be an empty string",
            "any.required": "otp is required",
        }),
    }),
};

export {
    signUpSchema,
    signInSchema,
    updateUserSchema,
    updatePasswordSchema,
    forgetPasswordSchema,
    resetPasswordSchema,
};
