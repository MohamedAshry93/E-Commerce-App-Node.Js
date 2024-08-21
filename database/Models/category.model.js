//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
    {
        //# Strings section
        name: {
            type: String,
            required: [true, "Category name is required"],
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

/*
categorySchema.post("findOneAndDelete", async function () {
    const _id = this.getQuery()._id;
    //? delete relevant sub-category from database
    const deletedSubCategories = await mongoose.models.SubCategory.deleteMany({
        categoryId: _id,
    });
    //? if sub-categories deleted => delete relevant products and brands from database
    if (deletedSubCategories.deletedCount) {
        //? delete relevant brands from database
        const deletedBrands = await mongoose.models.Brand.deleteMany({
            categoryId: _id,
        });
        //? if brands deleted => delete relevant products from database
        if (deletedBrands.deletedCount) {
            //? delete relevant products from database
            await mongoose.models.Product.deleteMany({ categoryId: _id });
        }
    }
})
*/

export const Category =
    mongoose.models.Category || model("Category", categorySchema);
