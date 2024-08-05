import { nanoid } from "nanoid";
import slugify from "slugify";

//# utils
import { ErrorHandlerClass } from "../../Utils/error-class.utils.js";
import {
    cloudinaryConfig,
    uploadNewFile,
    uploadUpdatedFile,
} from "../../Utils/index.js";

//# models
import {
    Brand,
    Category,
    SubCategory,
} from "./../../../database/Models/index.js";

//# APIS
/*
@api {POST} /sub-categories/create (create new sub-category)
*/
//! ========================================== Create Sub-Category ========================================== //
const createSubCategory = async (req, res, next) => {
    //? destruct categoryId from req.query
    const { categoryId } = req.query;
    const category = await Category.findById(categoryId);
    //? check if category exists
    if (!category) {
        return next(
            new ErrorHandlerClass(
                `Category not found`,
                404,
                "Error in createSubCategory API",
                "at createSubCategory controller",
                { categoryId }
            )
        );
    }
    //? destruct data from req.body
    const { name } = req.body;
    //? generate sub-category slug
    const slug = slugify(name, {
        trim: true,
        lower: true,
    });
    //? Image
    if (!req.file) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category image not found",
                400,
                "Please upload an image"
            )
        );
    }
    //? upload image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadNewFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/Sub-Categories/${customId}`,
        resource_type: "image",
        use_filename: true,
        tags: ["subCategoryImage"],
    });
    //? create sub-category object
    const subCategory = {
        name,
        slug,
        images: {
            secure_url,
            public_id,
        },
        customId,
        categoryId: category._id,
    };
    //? create sub-category to database
    const newSubCategory = await SubCategory.create(subCategory);
    //? return response
    res.status(201).json({
        status: "success",
        message: "Sub-Category created successfully",
        data: newSubCategory,
    });
};

/*
@api {GET} /sub-categories/ (get sub-category by name or id or slug)
*/
//! ========================================== Get Sub-Category ========================================== //
const getSubCategory = async (req, res, next) => {
    //? destruct data from req.query
    const { name, id, slug } = req.query;
    const queryFilter = {};
    //? check if query exists
    if (name) queryFilter.name = name;
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = slug;
    //? find the sub-category
    const subCategory = await SubCategory.findOne(queryFilter);
    //? check if sub-category exists
    if (!subCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in getSubCategory API",
                "at getSubCategory controller"
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Sub-Category found successfully",
        data: subCategory,
    });
};

/*
@api {PUT} /sub-categories/update/:_id (update a sub-category)
*/
//! ========================================== Update Sub-Category ========================================== //
const updateSubCategory = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if category exists
    const subCategory = await SubCategory.findById(_id).populate("categoryId");
    if (!subCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in updateSubCategory API",
                "at updateSubCategory controller"
            )
        );
    }
    //? destruct data from req.body
    const { name, old_public_id } = req.body;
    //? change name
    if (name) {
        //? generate sub-category slug
        const slug = slugify(name, {
            trim: true,
            lower: true,
        });
        //? change name and slug
        subCategory.name = name;
        subCategory.slug = slug;
    }
    //? change image
    if (req.file) {
        //? upload image to cloudinary
        const { secure_url, public_id } = await uploadUpdatedFile({
            old_public_id,
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/Sub-Categories/${subCategory.customId}`,
            use_filename: true,
            resource_type: "image",
            tags: ["subCategoryImage"],
        });
        subCategory.images.secure_url = secure_url;
        subCategory.images.public_id = public_id;
    }
    //? update sub-category
    const updatedSubCategory = await subCategory.save();
    //? return response
    res.status(200).json({
        status: "success",
        message: "Sub-Category updated successfully",
        data: updatedSubCategory,
    });
};

/*
@api {DELETE} /sub-categories/delete/:_id (delete a sub-category)
*/
//! ========================================== Delete Sub-Category ========================================== //
const deleteSubCategory = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if sub-category exists
    const deletedSubCategory = await SubCategory.findByIdAndDelete(_id).populate(
        "categoryId"
    );
    if (!deletedSubCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in deleteSubCategory API",
                "at deleteSubCategory controller"
            )
        );
    }
    const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${deletedSubCategory?.categoryId.customId}/Sub-Categories/${deletedSubCategory?.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(subCategoryPath);
    //? delete relevant brands from database
    await Brand.deleteMany({ subCategoryId: deletedSubCategory._id });

    // TODO: delete relevant products from database

    //? return response
    res.status(200).json({
        status: "success",
        message: "Sub-Category deleted successfully",
        data: deletedSubCategory,
    });
};

/*
@api {GET} /sub-categories/all (get all sub-category with paginated)
*/
//! =========================== Get all subCategories paginated with it’s brands =========================== //


export {
    createSubCategory,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory,
};
