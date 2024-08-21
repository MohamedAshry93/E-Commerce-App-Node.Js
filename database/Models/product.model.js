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

const productSchema = new Schema(
    {
        //# Strings section
        title: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
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
        description: String,
        specs: {
            type: Map,
            of: String | Number,
        },
        badge: {
            type: String,
            enum: Object.values(Badges),
        },
        //# Numbers section
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: 50,
        },
        appliedDiscount: {
            amount: {
                type: Number,
                min: 0,
                default: 0,
            },
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
            URLs: [
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
            customId: {
                type: String,
                required: true,
                unique: true,
            },
        },
        //# Ids section
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
    { timestamps: true, versionKey: "version_key" }
);

export const Product =
    mongoose.models.Product || model("Product", productSchema);
