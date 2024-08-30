//# dependencies
import { DateTime } from "luxon";

//# models
import { Coupon } from "../../database/Models/index.js";

//# utils
import { DiscountType } from "./index.js";

//# APIS
/*
@params {couponCode, userId}
@return {message: string, error: Boolean, coupon: object}
*/
//! ===================================== Validate Coupon ===================================== //
const validateCoupon = async (couponCode, userId) => {
    //? get coupon by couponCode
    const coupon = await Coupon.findOne({ couponCode });
    //? check if coupon exist on DB or not
    if (!coupon) {
        return {
            message: "coupon not found or invalid couponCode",
            error: true,
            coupon: null,
        };
    }
    //? check if coupon is enable or not or expired
    if (!coupon.isEnable || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
        return {
            message: "coupon is not enable",
            error: true,
        };
    }
    //? check if coupon not started yet
    if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
        return {
            message: `coupon not started yet, will start on ${coupon.from}`,
            error: true,
        };
    }
    //? check if user not eligible to use coupon
    const isUserNotEligible = await coupon.couponAssignedToUsers.some(
        (user) =>
            user.userId.toString() !== userId.toString() ||
            (user.userId.toString() === userId.toString() &&
                user.maxCount <= user.numberOfUsage)
    );
    if (isUserNotEligible) {
        return {
            message:
                "user is not eligible to use this coupon or you already use max number of count of this coupon",
            error: true,
        };
    }
    //? coupon is valid
    return {
        message: "coupon is valid",
        error: false,
        coupon,
    };
};

//! ===================================== Apply Coupon to Order ===================================== //
const applyCoupon = (subTotal, coupon) => {
    //? calculate total price after applied a coupon
    let total = subTotal;
    if (coupon.couponType === DiscountType.PERCENTAGE) {
        total = subTotal - (subTotal * coupon.couponAmount) / 100;
    } else if (coupon.couponType === DiscountType.AMOUNT) {
        //? if subtotal > couponAmount
        if (subTotal < coupon.couponAmount) {
            return total;
        }
        total = subTotal - coupon.couponAmount;
    }
    return total;
};

export { validateCoupon, applyCoupon };
