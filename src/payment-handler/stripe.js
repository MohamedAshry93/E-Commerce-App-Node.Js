//# dependencies
import Stripe from "stripe";

//# utils
import { DiscountType, ErrorHandlerClass } from "../Utils/index.js";

//# models
import { Coupon } from "../../database/Models/index.js";

//! create checkout session
const createCheckoutSession = async ({
    customer_email,
    client_reference_id,
    metadata,
    discounts,
    line_items,
}) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        customer_email,
        client_reference_id,
        metadata,
        discounts,
        line_items,
    });
    return session;
};

//! create stripe coupon
const createStripeCoupon = async ({ couponId }) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? check coupon exist in DB or not
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        throw new ErrorHandlerClass(
            "Coupon not found",
            404,
            "Error in create stripe coupon",
            "at stripe.js",
            { couponId }
        );
    }
    //? create coupon object
    let couponObject = {};
    //? check coupon type
    if (coupon.couponType === DiscountType.AMOUNT) {
        couponObject = {
            currency: "egp",
            amount_off: coupon.couponAmount * 100,
            name: coupon.couponCode,
        };
    }
    if (coupon.couponType === DiscountType.PERCENTAGE) {
        couponObject = {
            percent_off: coupon.couponAmount,
            name: coupon.couponCode,
        };
    }
    //? create stripe coupon
    const stripeCoupon = await stripe.coupons.create(couponObject);
    return stripeCoupon;
};

//! create PaymentMethod
const createPaymentMethod = async ({ token }) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? create payment method
    const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
            token,
        },
    });
    return paymentMethod;
};

//! create PaymentIntent
const createPaymentIntent = async ({ amount, currency }) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? create payment method
    const paymentMethod = await createPaymentMethod({ token: "tok_visa" });
    //? create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
        payment_method: paymentMethod.id,
    });
    return paymentIntent;
};

//! Retrieve a PaymentIntent
const retrievePaymentIntent = async ({ paymentIntentId }) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
};

//! confirm PaymentIntent
const confirmPaymentIntent = async ({ paymentIntentId }) => {
    //? create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //? get payment details
    const paymentDetails = await retrievePaymentIntent({ paymentIntentId });
    //? confirm payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentDetails.payment_method,
    });
    return paymentIntent;
};

export {
    createCheckoutSession,
    createStripeCoupon,
    createPaymentIntent,
    createPaymentMethod,
    confirmPaymentIntent,
    retrievePaymentIntent,
};
