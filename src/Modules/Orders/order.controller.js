//# dependencies
import { DateTime } from "luxon";

//# utils
import {
    ApiFeatures,
    applyCoupon,
    calculateCartSubTotal,
    createInvoice,
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

//# payment
import {
    createCheckoutSession,
    createPaymentIntent,
    createStripeCoupon,
} from "../../payment-handler/stripe.js";

//# services
import { sendEmailService } from "../../Services/send-email.service.js";

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
        productId,
        quantity,
        address,
        addressId,
        contactNumber,
        shippingFee,
        VAT,
        paymentMethod,
        couponCode,
        fromCart,
    } = req.body;
    let products = [];
    let flag = false;
    let checkUserCart = [{}];
    //? check if user has productId and quantity
    if (productId && quantity) {
        products = [{ productId, quantity }];
    } else {
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
        //? push products of userCart to initiate products array
        products = userCart.products;
        //? push userCart to initiate checkUserCart array
        checkUserCart = userCart;
        //? set flag
        flag = true;
    }
    let finalProducts = [];
    //? check if product still available or not
    for (let product of products) {
        const productInfo = await Product.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
        });
        if (!productInfo) {
            return next(
                new ErrorHandlerClass(
                    "Product not exist or out of stock",
                    404,
                    "Error in createOrder API",
                    "at Order controller",
                    { productInfo }
                )
            );
        }
        //? push product to finalProducts array
        if (flag) {
            product = product.toObject();
        }
        product.title = productInfo.title;
        product.description = productInfo.description;
        product.price = productInfo.price;
        finalProducts.push(product);
    }
    //? calculate new subTotal price
    const subTotal = calculateCartSubTotal(finalProducts);
    let total = subTotal + shippingFee + VAT;
    //? check availability of coupon
    let coupon = null;
    if (couponCode) {
        const isCouponValid = await validateCoupon(
            couponCode.toLowerCase(),
            userId
        );
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
    let addressDetails = [{}];
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
        addressDetails = addressInfo;
    }
    //? payment method
    let orderStatus = OrderStatus.PENDING;
    if (paymentMethod === PaymentMethod.CASH) {
        orderStatus = OrderStatus.PLACED;
    }
    //? create order instance
    const orderInstance = new Order({
        userId,
        products: finalProducts,
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
    finalProducts.forEach(async (product) => {
        await Product.updateOne(
            { _id: product.productId },
            { $inc: { stock: -product.quantity } }
        );
    });
    //? clear user's cart
    if (!checkUserCart.length) {
        checkUserCart.products = [];
        await checkUserCart.save();
    }
    //? increment usageCount of coupon
    if (order?.couponId) {
        const coupon = await Coupon.findById({ _id: order?.couponId });
        coupon.couponAssignedToUsers.find(
            (user) => user.userId.toString() === userId.toString()
        ).numberOfUsage++;
        await coupon.save();
    }
    //? create invoice
    const invoice = {
        shipping: {
            name: req.authUser.userName,
            address: address
                ? address
                : addressDetails.buildingNumber +
                ", " +
                addressDetails.floorNumber +
                ", " +
                "Main Street",
            city: addressDetails.city,
            state: "CA",
            country: addressDetails.country,
            postal_code: addressDetails.postalCode,
        },
        items: order?.products,
        subtotal: order?.subTotal * 100,
        paid: order?.total,
        invoice_nr: order?._id,
        date: order?.createdAt,
        shippingFee: order?.shippingFee,
        VAT: order?.VAT,
        coupon: coupon?.couponAmount || 0,
    };
    await createInvoice(invoice, "invoice.pdf");
    //? send email with invoice pdf
    const isEmailSent = await sendEmailService({
        to: req.authUser.email,
        subject: "Order Placed",
        html: "Your order has been placed successfully",
        attachments: [
            {
                path: "invoice.pdf",
                filename: "invoice.pdf",
                contentType: "application/pdf",
            },
            {
                path: "logo.jpeg",
                filename: "logo.jpeg",
                contentType: "image/jpeg",
            },
        ],
    });
    //? check if email sent successfully or not
    if (!isEmailSent.accepted.length) {
        return next(
            new ErrorHandlerClass(
                "Verification sending email is failed, please try again",
                400,
                "Error in user controller",
                "at checking isEmailSent in signUp API",
                { email: req.authUser.email }
            )
        );
    }
    //? send response
    res.status(201).json({
        status: "success",
        message: "Order created successfully",
        orderData: order,
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

/*
@api {POST} /orders/payment/:orderId (payment with stripe)
*/
//! ====================================== Payment with Stripe ====================================== //
const paymentWithStripe = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.params
    const { orderId } = req.params;
    //? check if order exist
    const order = await Order.findOne({
        _id: orderId,
        userId,
        orderStatus: OrderStatus.PENDING,
    });
    if (!order) {
        return next(
            new ErrorHandlerClass(
                "Order not found",
                404,
                "Error in paymentWithStripe API",
                "at Order controller",
                { orderId }
            )
        );
    }
    //? get customer data
    let customerData = {
        customerName: req.authUser.userName,
        Address: order.address,
        Phone: order.contactNumber,
    };
    //? create payment object
    const paymentObject = {
        customer_email: req.authUser.email,
        metadata: { shippingDetails: customerData },
        client_reference_id: order?._id.toString(),
        discounts: [],
        line_items: order.products.map((product) => {
            return {
                price_data: {
                    currency: "egp",
                    unit_amount: product.price * 100,
                    product_data: {
                        name: req.authUser.userName,
                    },
                },
                quantity: product.quantity,
            };
        }),
    };
    //? check if order has a coupon
    if (order.couponId) {
        const stripeCoupon = await createStripeCoupon({ couponId: order.couponId });
        if (stripeCoupon.status) {
            return next(
                new ErrorHandlerClass(
                    stripeCoupon.message,
                    400,
                    "Error in paymentWithStripe API",
                    "at Order controller",
                    { couponId: order.couponId }
                )
            );
        }
        //? add coupon to payment object
        paymentObject.discounts = [
            {
                coupon: stripeCoupon.id,
            },
        ];
    }
    //? create checkout session
    const checkoutSession = await createCheckoutSession(paymentObject);
    //? create payment intent
    const paymentIntent = await createPaymentIntent({
        amount: order.total,
        currency: "egp",
    });
    //? save paymentIntent id in DB
    order.payment_intent = paymentIntent.id;
    await order.save();
    //? send response
    res.status(200).json({
        status: "success",
        message: "Payment intent created successfully",
        checkoutSessionData: checkoutSession,
        paymentIntentData: paymentIntent,
    });
};

export {
    createOrder,
    cancelOrder,
    deliveredOrder,
    listOrders,
    getOrderDetails,
    paymentWithStripe,
};
