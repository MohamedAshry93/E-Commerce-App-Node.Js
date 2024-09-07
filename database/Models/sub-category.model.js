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
            //# Strings section
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
        //# Array section
        brands: [
            //# ObjectId section
            {
                type: Schema.Types.ObjectId,
                ref: "Brand",
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

//! ===================================== Query Middleware ===================================== //
//$ post hook to delete relevant brands and products from database
subCategorySchema.post("findOneAndDelete", async function () {
    const _id = this.getQuery()._id;
    //? delete relevant brands from database
    await mongoose.models.Brand.deleteMany({ subCategoryId: _id });
    //? delete relevant products from database
    await mongoose.models.Product.deleteMany({ subCategoryId: _id });
});

export const SubCategory =
    mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
