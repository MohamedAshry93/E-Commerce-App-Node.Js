//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

//# create brand schema
const brandSchema = new Schema(
    {
        //# Strings section
        name: {
            type: String,
            required: [true, "Brand name is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            default: function () {
                return slugify(this.name, {
                    trim: true,
                    lower: true,
                });
            },
        },
        customId: {
            type: String,
            required: true,
            unique: true,
        },
        //# logo section
        logo: {
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
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
