//# utils
import { ErrorHandlerClass, SystemRoles } from "../../Utils/index.js";

//# models
import { Product, WishList } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /products/:productId/wish-lists/create (create new wish-list)
*/
//! ========================================== Create wishList ========================================== //
const createWishList = async (req, res, next) => {
    //? destruct data from req.params
    const { productId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? check if product exists or not
    const product = await Product.findById({ _id: productId });
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in createWishList API at checking if product exist in DB or not",
                "at WishList controller",
                { productId }
            )
        );
    }
    //? check if user already has a wish-list for this product or not
    const wishList = await WishList.findOne({ userId });
    if (!wishList) {
        //? create new wish-list
        const newWishList = await WishList.create({
            userId,
            products: [productId],
        });
        //? send response
        return res.status(201).json({
            success: true,
            message: "Wish-list created successfully",
            data: newWishList,
        });
    }
    //? check if product already exists in wish-list or not
    if (wishList?.products.includes(productId)) {
        return next(
            new ErrorHandlerClass(
                "Product already exists in wish-list",
                400,
                "Error in createWishList API",
                "at WishList controller",
                { productId }
            )
        );
    }
    //? update wish-list
    const updatedWishList = await WishList.findOneAndUpdate(
        { userId },
        {
            $addToSet: { products: productId },
        },
        { new: true }
    );
    //? send response
    res.status(201).json({
        success: true,
        message: "Wish-list updated successfully",
        data: updatedWishList,
    });
};

/*
@api {PATCH} /products/:productId/wish-lists/remove (remove product from wish-list)
*/
//! ===================================== Remove Product from wishList ==================================== //
const removeWishList = async (req, res, next) => {
    //? destruct data from req.params
    const { productId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? check if product exists or not
    const product = await Product.findById({ _id: productId });
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in removeWishList API at checking if product exist in DB or not",
                "at WishList controller",
                { productId }
            )
        );
    }
    //? check if user already has a wish-list for this product or not
    const wishList = await WishList.findOne({ userId });
    if (!wishList) {
        return next(
            new ErrorHandlerClass(
                "Wish-list not found",
                404,
                "Error in removeWishList API at checking if wish-list exist in DB or not",
                "at WishList controller",
                { userId }
            )
        );
    }
    //? check if product already exists in wish-list or not
    if (!wishList?.products.includes(productId)) {
        return next(
            new ErrorHandlerClass(
                "Product not found in wish-list",
                400,
                "Error in removeWishList API",
                "at WishList controller",
                { productId }
            )
        );
    }
    //? update wish-list
    const updatedWishList = await WishList.findOneAndUpdate(
        { userId },
        {
            $pull: { products: productId },
        },
        { new: true }
    );
    //? send response
    res.status(201).json({
        success: true,
        message: "Wish-list updated successfully",
        data: updatedWishList,
    });
};

/*
@api {GET} /wish-lists/all (get all wish-list)
*/
//! ===================================== Get All wish-List ==================================== //
const getAllWishList = async (req, res, next) => {
    //? get all wish-lists
    const wishLists = await WishList.find();
    //? check wish-list in DB or not
    if (wishLists.length === 0) {
        return next(
            new ErrorHandlerClass(
                "No wish-lists found",
                404,
                "Error in getAllWishList API",
                "at WishList controller"
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Wish-lists retrieved successfully",
        data: wishLists,
    });
};

/*
@api {GET} /wish-lists/:_id (get all wish-list)
*/
//! ===================================== Get Specific wish-List ==================================== //
const getWishList = async (req, res, next) => {
    //? destruct data from req.params
    const { _id } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? check if user is Admin or not
    if (req.authUser.userType == SystemRoles.COMPANY_ADMIN) {
        //? get a wish-list
        const wishList = await WishList.findOne({ _id });
        //? check if wish-list exists in DB or not
        if (!wishList) {
            return next(
                new ErrorHandlerClass(
                    "Wish-list not found",
                    404,
                    "Error in getWishList API",
                    "at WishList controller",
                    { _id }
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Wish-list retrieved successfully",
            data: wishList,
        });
    }
    //? check if user is user or not
    if (req.authUser.userType == SystemRoles.USER) {
        //? get a wish-list
        const wishList = await WishList.findOne({ _id, userId });
        //? check if wish-list exists in DB or not
        if (!wishList) {
            return next(
                new ErrorHandlerClass(
                    "Wish-list not found",
                    404,
                    "Error in getWishList API",
                    "at WishList controller",
                    { _id }
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Wish-list retrieved successfully",
            data: wishList,
        });
    }
};

export { createWishList, removeWishList, getAllWishList, getWishList };
