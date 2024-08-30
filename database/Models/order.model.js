//# global setup
import mongoose from "../global-setup.js";

//# utils
import { OrderStatus, PaymentMethod } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create order schema
const orderSchema = new Schema(
    {
        //# ObjectIds section
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        addressId: {
            type: Schema.Types.ObjectId,
            ref: "Address",
        },
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
        },
        deliveredBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        canceledBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        //# Array section
        products: [
            {
                //# ObjectId section
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                //# Numbers section
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        //# Boolean section
        fromCart: {
            type: Boolean,
            default: false,
        },
        //# Numbers section
        subTotal: {
            type: Number,
            required: true,
        },
        shippingFee: {
            type: Number,
            required: true,
        },
        VAT: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        //# Strings section
        paymentMethod: {
            type: String,
            required: true,
            enum: Object.values(PaymentMethod),
        },
        orderStatus: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
        contactNumber: {
            type: String,
            required: true,
        },
        address: String,
        //# Dates section
        arrivalEstimateTime: {
            type: Date,
            required: true,
        },
        deliveredAt: Date,
        canceledAt: Date,
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Order = mongoose.models.Order || model("Order", orderSchema);
