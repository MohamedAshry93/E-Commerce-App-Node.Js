//# dependencies
import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";

//# models
import {
    Address,
    Coupon,
    Product,
    Review,
} from "./../../database/Models/index.js";

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

//! ========================== Calculate the average rating for product Cron =========================== //
const calculateProductRatingCron = () => {
    scheduleJob("0 59 23 * * *", async () => {
        console.log(
            "cron job to calculate the average rating for product calculateProductRatingCron()"
        );
        //? get all products
        const products = await Product.find().sort({ createdAt: -1 });
        //? check if products exist in DB or not
        if (products.length) {
            //? loop to get all products
            for (const product of products) {
                //? get all reviews for product
                const reviews = await Review.find({ productId: product._id });
                //? check if reviews exist in DB or not
                if (reviews.length) {
                    //? calculate the average rating for product
                    const averageRating =
                        reviews.reduce((acc, review) => acc + review.rating, 0) /
                        reviews.length;
                    //? update product rating
                    product.rating = averageRating;
                    //? save product
                    await product.save();
                }
            }
        }
    });
};

export { disableCouponsCron, deleteAddressesCron, calculateProductRatingCron };
