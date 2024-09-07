//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

//# create wishlist schema
const wishListSchema = new Schema(
    {
        //# ObjectIds section
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        //# Array section
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

export const WishList =
    mongoose.models.WishList || model("WishList", wishListSchema);
