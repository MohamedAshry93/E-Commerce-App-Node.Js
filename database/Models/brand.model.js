import mongoose from "mongoose";

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
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
