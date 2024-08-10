//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const brandSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
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
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, //TODO: change to true after authentication
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
        customId: {
            type: String,
            required: true,
            unique: true,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
