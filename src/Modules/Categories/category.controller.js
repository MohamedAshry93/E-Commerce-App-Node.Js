import slugify from "slugify";
import { nanoid } from "nanoid";

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
@api {POST} /categories/create (create new category)
*/
//! ========================================== Create Category ========================================== //
const createCategory = async (req, res, next) => {
    //? destruct data from req.body
    const { name } = req.body;
    //? generate category slug
    const slug = slugify(name, {
        trim: true,
        lower: true,
    });
    //? Image
    if (!req.file) {
        return next(
            new ErrorHandlerClass(
                "Category image not found",
                400,
                "Please upload an image"
            )
        );
    }
    //? upload image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadNewFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`,
        resource_type: "image",
        use_filename: true,
        tags: ["categoryImage"],
        next,
    });
    //? create category object
    const category = {
        name,
        slug,
        images: {
            secure_url,
            public_id,
        },
        customId,
    };
    //? create category to database
    const newCategory = await Category.create(category);
    //? return response
    res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: newCategory,
    });
};

/*
@api {GET} /categories/ (get category by name or id or slug)
*/
//! ========================================== Get Category ========================================== //
const getCategory = async (req, res, next) => {
    //? destruct data from req.query
    const { name, id, slug } = req.query;
    const queryFilter = {};
    //? check if query exists
    if (name) queryFilter.name = name;
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = slug;
    //? find the category
    const category = await Category.findOne(queryFilter);
    //? check if category exists
    if (!category) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in getCategory API",
                "at getCategory middleware"
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Category found successfully",
        data: category,
    });
};

/*
@api {PUT} /categories/update/:_id (update a category)
*/
//! ========================================== Update Category ========================================== //
const updateCategory = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if category exists
    const category = await Category.findById(_id);
    if (!category) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in updatedCategory API",
                "at updatedCategory controller"
            )
        );
    }
    //? destruct data from req.body
    const { name, old_public_id } = req.body;
    //? change name
    if (name) {
        //? generate category slug
        const slug = slugify(name, {
            trim: true,
            lower: true,
        });
        //? change name and slug
        category.name = name;
        category.slug = slug;
    }
    //? change image
    if (req.file) {
        const { secure_url, public_id } = await uploadUpdatedFile({
            old_public_id,
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
            use_filename: true,
            resource_type: "image",
            tags: ["categoryImage"],
            next
        });
        category.images.secure_url = secure_url;
        category.images.public_id = public_id;
    }
    //? update category
    const updatedCategory = await category.save();
    //? return response
    res.status(200).json({
        status: "success",
        message: "Category updated successfully",
        newData: updatedCategory,
    });
};

/*
@api {DELETE} /categories/delete/:_id (delete a category)
*/
//! ========================================== Delete Category ========================================== //
const deleteCategory = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if category exists
    const deletedCategory = await Category.findByIdAndDelete(_id);
    if (!deletedCategory) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in deleteCategory API",
                "at deleteCategory controller"
            )
        );
    }
    const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${deletedCategory?.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(categoryPath);
    //? delete relevant sub-category from database
    const deletedSubCategory = await SubCategory.deleteMany({
        categoryId: _id,
    });
    //? delete relevant brands from database
    if (deletedSubCategory.deletedCount) {
        await Brand.deleteMany({ categoryId: _id });
    }

    // TODO: delete relevant products from database

    //? return response
    res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
        data: deletedCategory,
    });
};

/*
@api {GET} /categories/all (get all category with paginated)
*/
//! ========================= Get all categories paginated with its sub-categories ========================= //


export { createCategory, getCategory, updateCategory, deleteCategory };
