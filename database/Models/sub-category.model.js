//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
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
        },
        images: {
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
        brands: [
            {
                type: Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],
    },
    { timestamps: true, versionKey: "version_key" }
);

export const SubCategory =
    mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
