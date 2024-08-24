//# global setup
import mongoose from "../global-setup.js";

//# utils
import { calculateCartSubTotal } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create cart schema
const cartSchema = new Schema(
    {
        //# Ids section
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        //# Numbers section
        subTotal: Number,
    },
    { timestamps: true, versionKey: "version_key" }
);

//! ================================ Document Middleware ================================ //
/// Hooks before save >>>>>>>>>>>>>>>>>
cartSchema.pre("save", function (next) {
    this.subTotal = calculateCartSubTotal(this.products);
    console.log(`calculating cart subTotal before save: ${this.subTotal}`);
    next();
});

/// Hooks after save >>>>>>>>>>>>>>>>>
cartSchema.post("save", async function (doc) {
    //? if cart is empty delete cart
    if (doc.products.length == 0) {
        await Cart.deleteOne({ userId: doc.userId });
        console.log("Deleting cart as no products in cart id: ", doc._id);
    }
});

export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
