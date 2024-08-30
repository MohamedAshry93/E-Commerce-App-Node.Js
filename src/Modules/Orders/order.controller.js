//# dependencies
import { DateTime } from "luxon";

//# middlewares

//# utils
import {
    ApiFeatures,
    applyCoupon,
    calculateCartSubTotal,
    ErrorHandlerClass,
    OrderStatus,
    PaymentMethod,
    validateCoupon,
} from "../../Utils/index.js";

//# models
import {
    Address,
    Cart,
    Coupon,
    Order,
    Product,
} from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /orders/create (create new order)
*/
//! ========================================== Create Orders ========================================== //
const createOrder = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.body
    const {
        address,
        addressId,
        contactNumber,
        shippingFee,
        VAT,
        paymentMethod,
        couponCode,
        fromCart,
    } = req.body;
    //? get user's cart with products
    const userCart = await Cart.findOne({ userId }).populate(
        "products.productId"
    );
    //? check if user has cart
    if (!userCart || !userCart.products.length) {
        return next(
            new ErrorHandlerClass(
                "Cart is empty",
                400,
                "Error in createOrder API",
                "at Order controller",
                { userCart }
            )
        );
    }
    //? check if product still available or not
    const isSoldOut = userCart.products.find(
        (product) => product.productId.stock < product.quantity
    );
    if (isSoldOut) {
        return next(
            new ErrorHandlerClass(
                `Product ${isSoldOut.productId.title} is sold out`,
                400,
                "Error in createOrder API at check product availability",
                "at Order controller",
                { isSoldOut }
            )
        );
    }
    //? calculate new subTotal price
    const subTotal = calculateCartSubTotal(userCart.products);
    let total = subTotal + shippingFee + VAT;
    //? check availability of coupon
    let coupon = null;
    if (couponCode) {
        const isCouponValid = await validateCoupon(couponCode, userId);
        if (isCouponValid.error) {
            return next(
                new ErrorHandlerClass(
                    isCouponValid.message,
                    403,
                    "Error in createOrder API at validate coupon",
                    "at Order controller",
                    { isCouponValid }
                )
            );
        }
        //? calculate total price after applied a coupon
        coupon = isCouponValid.coupon;
        total = applyCoupon(subTotal, coupon);
    }
    //? check if not sending address
    if (!address && !addressId) {
        return next(
            new ErrorHandlerClass(
                "Please provide address, address is required",
                400,
                "Error in createOrder API",
                "at Order controller"
            )
        );
    }
    if (addressId) {
        //? get address from user addresses
        const addressInfo = await Address.findOne({ _id: addressId, userId });
        if (!addressInfo) {
            return next(
                new ErrorHandlerClass(
                    "Address not found",
                    404,
                    "Error in createOrder API at checking addressId",
                    "at Order controller"
                )
            );
        }
    }
    //? payment method
    let orderStatus = OrderStatus.PENDING;
    if (paymentMethod === PaymentMethod.CASH) {
        orderStatus = OrderStatus.PLACED;
    }
    //? create order instance
    const orderInstance = new Order({
        userId,
        products: userCart.products,
        address,
        addressId,
        contactNumber,
        shippingFee,
        VAT,
        subTotal,
        total,
        paymentMethod,
        couponId: coupon?._id,
        orderStatus,
        fromCart,
        arrivalEstimateTime: DateTime.now()
            .plus({ days: 7 })
            .toFormat("yyyy-MM-dd"),
    });
    //? save order
    const order = await orderInstance.save();
    //? update stock of products
    userCart.products.forEach(async (product) => {
        await Product.updateOne(
            { _id: product.productId },
            { $inc: { stock: -product.quantity } }
        );
    });
    //? clear user's cart
    userCart.products = [];
    await userCart.save();
    //? increment usageCount of coupon
    if (order?.couponId) {
        const coupon = await Coupon.findById({ _id: order?.couponId });
        coupon.couponAssignedToUsers.find(
            (user) => user.userId.toString() === userId.toString()
        ).numberOfUsage++;
        await coupon.save();
    }
    //? send response
    res.status(201).json({
        message: "Order created successfully",
        order,
    });
};

/*
@api {PUT} /orders/cancel/:orderId (cancel order)
*/
//! ========================================== Cancel Order ========================================== //
const cancelOrder = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.params
    const { orderId } = req.params;
    //? check if order exist
    const order = await Order.findOne({
        _id: orderId,
        userId,
        orderStatus: {
            $in: [OrderStatus.PENDING, OrderStatus.PLACED, OrderStatus.CONFIRMED],
        },
    });
    if (!order) {
        return next(
            new ErrorHandlerClass(
                "Order not found",
                404,
                "Error in cancelOrder API",
                "at Order controller"
            )
        );
    }
    //? check if order bought before 1 day or not
    if (
        DateTime.fromJSDate(order.arrivalEstimateTime).toSeconds() -
        DateTime.now().toSeconds() <
        518400
    ) {
        return next(
            new ErrorHandlerClass(
                "Order can't be cancelled",
                400,
                "Error in cancelOrder API at checking order date",
                "at Order controller"
            )
        );
    }
    /*
                const orderDate = DateTime.fromJSDate(order.createdAt);
                const currentDate = DateTime.now();
                const diff = Math.ceil(
                Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
                );
                if (diff < 3) {
                    return next(
                        new ErrorHandlerClass(
                            "Order can't be cancelled",
                            400,
                            "Error in cancelOrder API checking order date",
                            "at Order controller"
                        )
                    );
                }
                */
    //? update order status
    order.orderStatus = OrderStatus.CANCELLED;
    //? add canceled time
    order.canceledAt = DateTime.now();
    //? add canceled by
    order.canceledBy = userId;
    //? return canceled products to stock
    order.products.forEach(async (product) => {
        await Product.updateOne(
            { _id: product.productId },
            { $inc: { stock: product.quantity } }
        );
    });
    //? update coupon (decrement usageCount of coupon)
    if (order?.couponId) {
        const coupon = await Coupon.findById({ _id: order?.couponId });
        coupon.couponAssignedToUsers.find(
            (user) => user.userId.toString() === userId.toString()
        ).numberOfUsage--;
        await coupon.save();
    }
    //? save order
    const canceledOrder = await order.save();
    //? send response
    res.status(200).json({
        status: "success",
        message: "Order cancelled successfully",
        data: canceledOrder,
    });
};

/*
@api {GET} /orders/delivered/:orderId (delivered order)
*/
//! ========================================== Delivered Order ========================================== //
const deliveredOrder = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.params
    const { orderId } = req.params;
    //? check if order exist
    const order = await Order.findOne({
        _id: orderId,
        userId,
        orderStatus: {
            $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED],
        },
    });
    if (!order) {
        return next(
            new ErrorHandlerClass(
                "Order not found",
                404,
                "Error in deliveredOrder API",
                "at Order controller"
            )
        );
    }
    //? update order status
    order.orderStatus = OrderStatus.DELIVERED;
    //? add delivered time
    order.deliveredAt = DateTime.now();
    //? add delivered by
    order.deliveredBy = userId;
    //? save order
    const deliveredOrder = await order.save();
    //? send response
    res.status(200).json({
        status: "success",
        message: "Order delivered successfully",
        data: deliveredOrder,
    });
};

/*
@api {GET} /orders/list-orders (get all orders)
*/
//! ========================================== Get All Orders ========================================== //
const listOrders = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? get query object
    const query = { userId, ...req.query };
    //? get populate array
    const populateArray = [
        {
            path: "products.productId",
            select:
                "title description specs price appliedDiscount rating stock images appliedPrice",
        },
    ];
    //? get paginated orders
    const ApiFeaturesInstance = new ApiFeatures(Order, query, populateArray)
        .pagination()
        .sort()
        .filters();
    const orders = await ApiFeaturesInstance.mongooseQuery;
    //? send response
    res.status(200).json({
        status: "success",
        message: "Orders fetched successfully",
        data: orders,
    });
};

/*
@api {GET} /orders/order/:orderId (get order details)
*/
//! ========================================== Get Specific Order ========================================== //
const getOrderDetails = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.params
    const { orderId } = req.params;
    //? check if order exist
    const order = await Order.findOne({ _id: orderId, userId }).populate({
        path: "products.productId",
        select:
            "title description specs price appliedDiscount rating stock images appliedPrice",
    });
    if (!order) {
        return next(
            new ErrorHandlerClass(
                "Order not found",
                404,
                "Error in getOrderDetails API",
                "at Order controller"
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Order fetched successfully",
        data: order,
    });
};

export {
    createOrder,
    cancelOrder,
    deliveredOrder,
    listOrders,
    getOrderDetails,
};
