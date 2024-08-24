//# dependencies
import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";

//# models
import { Address, Coupon } from "./../../database/Models/index.js";

//! ===================================== Disable Coupons Cron ===================================== //
const disableCouponsCron = () => {
    scheduleJob("0 59 23 * * *", async () => {
        console.log("cron job to disable expired coupons disableCouponsCron()");
        //? get all enabled coupons
        const enabledCoupons = await Coupon.find({ isEnable: true }).sort({
            createdAt: -1,
        });
        //? check if coupons exist in DB or not
        if (enabledCoupons.length) {
            //? loop to get expired coupons
            for (const coupon of enabledCoupons) {
                //? check if coupon is expired
                if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
                    //? disable coupon
                    coupon.isEnable = false;
                    //? save coupon
                    await coupon.save();
                }
            }
        }
    });
};

//! ===================================== Delete Expire Addresses Cron ===================================== //
const deleteAddressesCron = () => {
    scheduleJob("0 59 23 * * *", async () => {
        console.log(
            "cron job to delete expire recovering addresses deleteAddressesCron()"
        );
        //? get all isMarkedAsDelete addresses
        const isMarkedAsDeletedAddresses = await Address.find({
            isMarkedAsDeleted: true,
        }).sort({ createdAt: -1 });
        //? check if addresses exist in DB or not
        if (isMarkedAsDeletedAddresses.length) {
            //? loop to get expired recovering deleted addresses
            for (const address of isMarkedAsDeletedAddresses) {
                //? check if recovering address is expired
                if (DateTime.now() > DateTime.fromJSDate(address.deletedAt)) {
                    //? delete address
                    await address.deleteOne();
                }
            }
        }
    });
};

export { disableCouponsCron, deleteAddressesCron };
