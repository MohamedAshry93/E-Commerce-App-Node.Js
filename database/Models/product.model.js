//# dependencies
import slugify from "slugify";

//# global setup
import mongoose from "../global-setup.js";

//# utils
import {
    Badges,
    calculateProductPrice,
    DiscountType,
} from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create product schema
const productSchema = new Schema(
    {
        //# Strings section
        title: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            lowercase: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
            default: function () {
                return slugify(this.title, {
                    trim: true,
                    lower: true,
                });
            },
        },
        description: {
            type: String,
            lowercase: true,
            trim: true,
            default: "No description provided",
        },
        badge: {
            type: String,
            enum: Object.values(Badges),
        },
        //# Objects section
        specs: Object,
        //# Numbers section
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: 50,
        },
        appliedDiscount: {
            //# Number section
            amount: {
                type: Number,
                min: 0,
                default: 0,
            },
            //# String section
            type: {
                type: String,
                enum: Object.values(DiscountType),
                default: DiscountType.PERCENTAGE,
            },
        },
        appliedPrice: {
            type: Number,
            required: true,
            default: function () {
                return calculateProductPrice(this.price, this.appliedDiscount);
            },
        },
        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            min: 1,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        //# Images section
        images: {
            //# Array section
            URLs: [
                //# Strings section
                {
                    secure_url: {
                        type: String,
                        required: true,
                    },
                    public_id: {
                        type: String,
                        required: true,
                        unique: true,
                    },
                },
            ],
            //# String section
            customId: {
                type: String,
                required: true,
                unique: true,
            },
        },
        //# ObjectIds section
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
    }
);

//# create virtual populate with product reviews
productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "productId",
    localField: "_id",
});

export const Product =
    mongoose.models.Product || model("Product", productSchema);
