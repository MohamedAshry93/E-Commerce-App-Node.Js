//# utils
import { ErrorHandlerClass } from "../../Utils/index.js";

//#middlewares
import { checkProductStock } from "../../Middlewares/index.js";

//# models
import { Cart } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /carts/add/:productId (Add to Cart)
*/
//! ========================================== Add to Cart ========================================== //
const addToCart = async (req, res, next) => {
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.body
    const { quantity } = req.body;
    //? destruct productId from req.params
    const { productId } = req.params;
    //? check if product exists in DB or not
    const product = await checkProductStock(productId, quantity);
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not available",
                404,
                "Error in addToCart API",
                "at Cart controller"
            )
        );
    }
    //? check if cart exists in DB or not
    const cart = await Cart.findOne({ userId });
    //? if not found create new cart
    if (!cart) {
        const newCart = new Cart({
            userId,
            products: [
                { productId: product._id, quantity, price: product.appliedPrice },
            ],
        });
        await newCart.save();
        return res.status(201).json({
            status: "success",
            message: "Cart created successfully",
            data: newCart,
        });
    }
    //? if found update cart
    const isProductExist = cart.products.find(
        (product) => product.productId == productId
    );
    if (isProductExist) {
        return next(
            new ErrorHandlerClass(
                "Product already in cart",
                400,
                "Error in addToCart API",
                "at Cart controller",
                { productId }
            )
        );
    }
    //? update cart
    cart.products.push({
        productId: product._id,
        quantity,
        price: product.appliedPrice,
    });
    //? save cart
    await cart.save();
    //? send response
    return res.status(200).json({
        status: "success",
        message: "Cart updated successfully",
        data: cart,
    });
};

/*
@api {PUT} /carts/remove/:productId (remove from Cart)
*/
//! ========================================== Remove from Cart ========================================== //
const removeFromCart = async (req, res, next) => {
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? destruct productId from req.params
    const { productId } = req.params;
    //? check if product exist in cart or not
    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(
            new ErrorHandlerClass(
                "Product not found in cart",
                404,
                "Error in removeFromCart API",
                "at Cart controller",
                { productId }
            )
        );
    }
    //? if found update cart (remove product from cart)
    cart.products = cart.products.filter(
        (product) => product.productId != productId
    );
    //? save cart
    await cart.save();
    //? send response
    return res.status(200).json({
        status: "success",
        message: "Cart updated successfully",
        data: cart,
    });
};

/*
@api {PUT} /carts/update/:productId (Update cart)
*/
//! ========================================== Update Cart ========================================== //
const updateCart = async (req, res, next) => {
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.params
    const { productId } = req.params;
    //? destruct data from req.body
    const { quantity } = req.body;
    //? check if product exist in cart or not
    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(
            new ErrorHandlerClass(
                "Product not found in cart",
                404,
                "Error in removeFromCart API",
                "at Cart controller",
                { productId }
            )
        );
    }
    //? if found update product
    const product = await checkProductStock(productId, quantity);
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not available",
                404,
                "Error in addToCart API",
                "at Cart controller"
            )
        );
    }
    //? if found update cart
    const productIndex = cart.products.findIndex(
        (prod) => prod.productId.toString() == product._id.toString()
    );
    cart.products[productIndex].quantity = quantity;
    //? save cart
    await cart.save();
    //? send response
    return res.status(200).json({
        status: "success",
        message: "Cart updated successfully",
        data: cart,
    });
};

/*
@api {GET} /carts/ (Get cart)
*/
//! ========================================== Get Cart ========================================== //
const getCart = async (req, res, next) => {
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? get cart
    const cart = await Cart.findOne({ userId });
    //? send response
    return res.status(200).json({
        status: "success",
        message: "Cart fetched successfully",
        data: cart,
    });
};

export { addToCart, removeFromCart, updateCart, getCart };
