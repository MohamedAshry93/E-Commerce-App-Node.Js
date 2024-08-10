//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
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
        customId: {
            type: String,
            required: true,
            unique: true,
        },
        subCategories: [
            {
                type: Schema.Types.ObjectId,
                ref: "SubCategory",
            },
        ],
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Category =
    mongoose.models.Category || model("Category", categorySchema);
