//# utils
import { ErrorHandlerClass } from "../Utils/index.js";

//# models
import { Coupon, Product, User } from "../../database/Models/index.js";

//! ===================================== Check Model by Name ===================================== //
const modelNameExist = (model) => {
    return async (req, res, next) => {
        //? destruct data from req.body
        const { name } = req.body;
        if (name) {
            //? find model by name
            const data = await model.findOne({ name });
            //? check if name exists in database
            if (data) {
                return next(
                    new ErrorHandlerClass(
                        `${model.modelName} name already exist`,
                        400,
                        "Error in modelNameExist API",
                        "at checkData middleware",
                        { name }
                    )
                );
            }
        }
        next();
    };
};

//! ===================================== Check Model by Ids ===================================== //
const checkIdsExist = (model) => {
    return async (req, res, next) => {
        //? destruct categoryId, subCategoryId and brandId from req.params
        const { categoryId, subCategoryId, brandId } = req.params;
        //? check Ids exists in database
        const brandDocument = await model
            .findOne({
                _id: brandId,
                categoryId,
                subCategoryId,
            })
            .populate([
                { path: "categoryId", select: "customId" },
                { path: "subCategoryId", select: "customId" },
            ]);
        //? check if brandDocument exists in database
        if (!brandDocument) {
            return next(
                new ErrorHandlerClass(
                    `${model.modelName} not found`,
                    404,
                    "Error in checkIdsExist API",
                    "at checkData middleware",
                    { categoryId, subCategoryId, brandId }
                )
            );
        }
        //? set brandDocument to req.document
        req.document = brandDocument;
        next();
    };
};

//! ===================================== Check User Data ===================================== //
const checkUserDataExist = () => {
    return async (req, res, next) => {
        //? destruct data from req.body
        const { userName, email } = req.body;
        //? check if user exists
        const user = await User.findOne({ $or: [{ userName }, { email }] });
        //? check if user exists in database
        if (user) {
            return next(
                new ErrorHandlerClass(
                    "user data already exist",
                    400,
                    "Error in checkUserDataExist API",
                    "at checkData middleware",
                    { userName, email }
                )
            );
        }
        next();
    };
};

//! ===================================== Check Product Availability ===================================== //
const checkProductStock = async (productId, quantity) => {
    return await Product.findOne({ _id: productId, stock: { $gte: quantity } });
};

//! ===================================== Check Coupon Code ===================================== //
const checkCouponCodeExist = () => {
    return async (req, res, next) => {
        //? destruct data from req.body
        const { couponCode } = req.body;
        if (couponCode) {
            //? check if couponCode exists in database
            const coupon = await Coupon.findOne({ couponCode });
            if (coupon) {
                return next(
                    new ErrorHandlerClass(
                        "coupon code already exist",
                        400,
                        "Error in checkCouponCodeExist API",
                        "at checkData middleware",
                        { couponCode }
                    )
                );
            }
        }
        next();
    };
};

export {
    modelNameExist,
    checkIdsExist,
    checkUserDataExist,
    checkProductStock,
    checkCouponCodeExist,
};
