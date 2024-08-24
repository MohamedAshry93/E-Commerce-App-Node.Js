//# dependencies
import Joi from "joi";
import { Types } from "mongoose";

//# utils
import {
    Badges,
    DiscountType,
    Gender,
    SystemRoles,
} from "./enums.utils.js";

//? general object rule
const objectIdRule = (value, helper) => {
    const isObjectIdValid = Types.ObjectId.isValid(value);
    return isObjectIdValid
        ? value
        : helper.message("Invalid objectId length must be 24 and hexadecimal");
};

//? general rule validation
const generalRule = {
    objectId: Joi.string().custom(objectIdRule).required().messages({
        "string.base": "objectId must be a string",
        "string.empty": "Invalid objectId it cannot be an empty string",
        "any.required": "objectId is required",
        "string.length": "Invalid objectId length must be 24 and hexadecimal",
    }),
    headers: Joi.object({
        "content-type": Joi.string().valid("application/json").optional(),
        "user-agent": Joi.string().optional(),
        host: Joi.string().optional(),
        "content-length": Joi.string().optional(),
        "accept-encoding": Joi.string().optional(),
        accept: Joi.string().optional(),
        "accept-language": Joi.string().optional(),
        "cache-control": Joi.string().optional(),
        connection: Joi.string().optional(),
        cookie: Joi.string().optional(),
        dnt: Joi.string().optional(),
        "postman-token": Joi.string().optional(),
        "user-agent": Joi.string().optional(),
        "x-forwarded-for": Joi.string().optional(),
        "x-forwarded-host": Joi.string().optional(),
        "x-forwarded-proto": Joi.string().optional(),
        "x-real-ip": Joi.string().optional(),
        "x-request-id": Joi.string().optional(),
        "x-ua-compatible": Joi.string().optional(),
        "x-verified-by": Joi.string().optional(),
        "x-verified-by": Joi.string().optional(),
        "x-verified-by": Joi.string().optional(),
    }),
    userName: Joi.string().required().min(3).max(30).messages({
        "string.base": "userName must be a string",
        "string.empty": "Invalid userName it cannot be an empty string",
        "any.required": "userName is required",
        "string.min": "userName must be at least 3 characters long",
        "string.max": "userName must be less than or equal 30 characters long",
    }),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            maxDomainSegments: 3,
            tlds: { allow: ["com", "net", "org", "edu", "gov"] },
        })
        .required()
        .messages({
            "string.base": "email must be a string",
            "string.empty": "Invalid email it cannot be an empty string",
            "any.required": "email is required",
            "string.email":
                "Invalid email format email must be like example@gmail.com or example@mail.net example@mail.org example@mail.edu example@mail.gov",
            "string.unique": "email must be unique",
        }),
    password: Joi.string()
        .required()
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .messages({
            "string.base": "password must be a string",
            "string.empty": "Invalid password it cannot be an empty string",
            "any.required": "password is required",
            "string.pattern.base":
                "password must contain at least one lowercase letter ,at least one uppercase letter ,at least one digit ,at least one special character from the set @$!%*?& and minimum length 8",
        }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "confirmPassword must be same as password",
        "any.required": "confirmPassword is required",
        "any.ref": "confirmPassword must be same as password",
        "string.base": "confirmPassword must be a string",
        "string.empty": "Invalid confirmPassword it cannot be an empty string",
    }),
    oldPassword: Joi.string().required().messages({
        "string.base": "oldPassword must be a string",
        "string.empty": "Invalid oldPassword it cannot be an empty string",
        "any.required": "oldPassword is required",
    }),
    age: Joi.number().integer().positive().min(10).max(100).optional().messages({
        "number.base": "age must be a number",
        "number.empty": "Invalid age it cannot be an empty string",
        "number.integer": "age must be an integer",
        "number.min": "age must be at least 10",
        "number.max": "age must be less than or equal 80",
    }),
    phone: Joi.string()
        .required()
        .pattern(/^01[0125][0-9]{8}$/)
        .messages({
            "string.base": "phone must be a string",
            "string.empty": "Invalid phone it cannot be an empty string",
            "any.required": "phone is required",
            "string.pattern.base": "phone must be a valid Egyptian phone number",
        }),
    gender: Joi.string()
        .valid(...Object.values(Gender))
        .optional()
        .messages({
            "string.base": "gender must be a string",
            "string.empty": "Invalid gender it cannot be an empty string",
            "any.only": "gender must be either Male or Female",
        }),
    userType: Joi.string()
        .valid(...Object.values(SystemRoles))
        .required()
        .messages({
            "string.base": "userType must be a string",
            "string.empty": "Invalid userType it cannot be an empty string",
            "any.required": "userType is required",
            "any.only": "userType must be either User or Company_ADMIN",
        }),
    name: Joi.string().required().messages({
        "string.base": "model name must be a string",
        "string.empty": "Invalid model name it cannot be an empty string",
        "any.required": "name is required",
        "string.unique": "model name must be unique",
    }),
    slug: Joi.string().messages({
        "string.base": "slug must be a string",
        "string.empty": "Invalid slug it cannot be an empty string",
    }),
    title: Joi.string().required().messages({
        "string.base": "title must be a string",
        "string.empty": "Invalid title it cannot be an empty string",
        "any.required": "title is required",
    }),
    description: Joi.string().optional().messages({
        "string.base": "description must be a string",
        "string.empty": "Invalid description it cannot be an empty string",
    }),
    specs: Joi.object()
        .pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number()))
        .optional()
        .messages({
            "string.base": "specs must be a object of strings",
            "string.empty": "Invalid specs it cannot be an empty string",
            "object.pattern.base": "specs must be a object of strings",
        }),
    badge: Joi.string()
        .valid(...Object.values(Badges))
        .optional()
        .messages({
            "string.base": "badge must be a string",
            "string.empty": "Invalid badge it cannot be an empty string",
            "any.only": "badge must be either BEST_SELLER or NEW or SALE",
        }),
    price: Joi.number().min(50).required().messages({
        "number.base": "price must be a number",
        "number.empty": "Invalid price it cannot be an empty number",
        "any.required": "price is required",
        "number.min": "price must be at least 50",
    }),
    discountType: Joi.string()
        .valid(...Object.values(DiscountType))
        .optional()
        .messages({
            "string.base": "type must be a string",
            "string.empty": "Invalid type it cannot be an empty string",
            "any.only": "type must be either PERCENTAGE or AMOUNT",
        }),
    discountAmount: Joi.number()
        .positive()
        .when("discountType", {
            is: Joi.string().valid(DiscountType.PERCENTAGE),
            then: Joi.number().min(0).max(100).required(),
            otherwise: Joi.number().min(0).required(),
        })
        .optional()
        .messages({
            "number.base": "discountAmount must be a number",
            "number.empty": "Invalid discountAmount it cannot be an empty number",
            "number.min": "discountAmount must be at least 0",
            "number.max": "discountAmount must be less than or equal 100",
        }),
    stock: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "stock must be a number",
        "number.empty": "Invalid stock it cannot be an empty number",
        "any.required": "stock is required",
        "number.integer": "stock must be an integer",
        "number.min": "stock must be at least 1",
    }),
    rating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "rating must be a number",
        "number.empty": "Invalid rating it cannot be an empty number",
        "number.min": "rating must be at least 0",
        "number.max": "rating must be less than or equal 5",
    }),
    country: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            "string.base": "country must be a string",
            "string.empty": "Invalid country it cannot be an empty string",
            "any.required": "country is required",
            "string.pattern.base":
                "country must be a valid country name that contain only alphabetic characters and spaces (no numbers or special characters)",
        }),
    city: Joi.string()
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            "string.base": "city must be a string",
            "string.empty": "Invalid city it cannot be an empty string",
            "any.required": "city is required",
            "string.pattern.base":
                "city must be a valid city name that contain only alphabetic characters and spaces (no numbers or special characters)",
        }),
    postalCode: Joi.number().integer().positive().required().messages({
        "number.base": "postalCode must be a number",
        "number.empty": "Invalid postalCode it cannot be an empty number",
        "any.required": "postalCode is required",
        "number.integer": "postalCode must be an integer",
    }),
    buildingNumber: Joi.number().integer().positive().required().messages({
        "number.base": "buildingNumber must be a number",
        "number.empty": "Invalid buildingNumber it cannot be an empty number",
        "any.required": "buildingNumber is required",
        "number.integer": "buildingNumber must be an integer",
    }),
    floorNumber: Joi.number().integer().positive().required().messages({
        "number.base": "floorNumber must be a number",
        "number.empty": "Invalid floorNumber it cannot be an empty number",
        "any.required": "floorNumber is required",
        "number.integer": "floorNumber must be an integer",
    }),
    addressLabel: Joi.string().optional().messages({
        "string.base": "addressLabel must be a string",
        "string.empty": "Invalid addressLabel it cannot be an empty string",
    }),
    old_public_id: Joi.string().messages({
        "string.base": "old_public_id must be a string",
        "string.empty": "old_public_id cannot be empty",
    }),
    quantity: Joi.number().integer().positive().min(1).required().messages({
        "number.base": "quantity must be a number",
        "number.empty": "Invalid quantity it cannot be an empty number",
        "any.required": "quantity is required",
        "number.integer": "quantity must be an integer",
        "number.min": "quantity must be at least 1",
    }),
    couponCode: Joi.string().required().messages({
        "string.base": "couponCode must be a string",
        "string.empty": "Invalid couponCode it cannot be an empty string",
        "any.required": "couponCode is required",
    }),
    couponType: Joi.string()
        .valid(...Object.values(DiscountType))
        .required()
        .messages({
            "string.base": "couponType must be a string",
            "string.empty": "Invalid couponType it cannot be an empty string",
            "any.required": "couponType is required",
            "any.only": "couponType must be either PERCENTAGE or AMOUNT",
        }),
    couponAmount: Joi.number()
        .when("couponType", {
            is: Joi.string().valid(DiscountType.PERCENTAGE),
            then: Joi.number().min(1).max(100),
            otherwise: Joi.number().min(1),
        })
        .required()
        .messages({
            "number.base": "couponAmount must be a number",
            "number.empty": "Invalid couponAmount it cannot be an empty number",
            "any.required": "couponAmount is required",
            "number.min": "couponAmount must be at least 1",
            "number.max": "couponAmount must be less than or equal 100",
        }),
    from: Joi.date().greater(Date.now()).required().messages({
        "date.base": "from must be a date",
        "date.empty": "Invalid from it cannot be an empty date",
        "any.required": "from is required",
        "date.greater": "from must be greater than today",
    }),
    till: Joi.date().greater(Joi.ref("from")).required().messages({
        "date.base": "till must be a date",
        "date.empty": "Invalid till it cannot be an empty date",
        "any.required": "till is required",
        "date.greater": "till must be greater than from",
    }),
    maxCount: Joi.number().integer().min(1).positive().required().messages({
        "number.base": "maxCount must be a number",
        "number.empty": "Invalid maxCount it cannot be an empty number",
        "any.required": "maxCount is required",
        "number.integer": "maxCount must be an integer",
        "number.min": "maxCount must be at least 1",
    }),
    numberOfUsage: Joi.number().integer().min(0).optional().messages({
        "number.base": "numberOfUsage must be a number",
        "number.empty": "Invalid numberOfUsage it cannot be an empty number",
        "number.integer": "numberOfUsage must be an integer",
        "number.min": "numberOfUsage must be at least 0",
    }),
    isEnable: Joi.boolean().valid(true, false).required().messages({
        "any.only": "isEnable must be a boolean value (true or false)",
        "boolean.base": "isEnable must be a boolean value (true or false)",
        "boolean.valid": "isEnable must be a boolean value (true or false)",
        "boolean.empty": "Invalid isEnable it cannot be an empty boolean",
        "any.required": "isEnable is required",
    })
};

export { generalRule };
