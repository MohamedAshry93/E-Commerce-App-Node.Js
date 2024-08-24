//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

//# create subCategory schema
const subCategorySchema = new Schema(
    {
        //# Strings section
        name: {
            type: String,
            required: [true, "subCategory name is required"],
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
        //# Images section
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
        //# Ids section
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
