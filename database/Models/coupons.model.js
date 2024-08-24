//# global setup
import mongoose from "../global-setup.js";

//# utils
import { DiscountType } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create coupon schema
const couponSchema = new Schema(
    {
        //# Strings section
        couponCode: {
            type: String,
            unique: true,
            required: true,
        },
        couponType: {
            type: String,
            required: true,
            enum: Object.values(DiscountType),
        },
        //# Numbers section
        couponAmount: {
            type: Number,
            required: true,
        },
        //# Dates section
        from: {
            type: Date,
            required: true,
        },
        till: {
            type: Date,
            required: true,
        },
        //# Array section
        couponAssignedToUsers: [
            {
                //# ObjectId section
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                //# Numbers section
                maxCount: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                numberOfUsage: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
            },
        ],
        //# Booleans section
        isEnable: {
            type: Boolean,
            default: true,
        },
        //# ObjectIds section
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);

//# create coupon change log schema
const couponChangeLogSchema = new Schema(
    {
        //# ObjectIds section
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        //# Objects section
        changes: {
            type: Object,
            required: true,
        }
    },
    { timestamps: true, versionKey: "version_key" }
);

export const CouponChangeLog =
    mongoose.models.CouponChangeLog ||
    model("CouponChangeLog", couponChangeLogSchema);
