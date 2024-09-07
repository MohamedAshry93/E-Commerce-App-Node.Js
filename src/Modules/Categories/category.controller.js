//# dependencies
import slugify from "slugify";
import { nanoid } from "nanoid";

//# utils
import {
    cloudinaryConfig,
    uploadNewFile,
    uploadUpdatedFile,
    ErrorHandlerClass,
    ApiFeatures,
} from "../../Utils/index.js";

//# models
import { Category } from "./../../../database/Models/index.js";

//# APIS
/*
@api {POST} /categories/create (create new category)
*/
//! ========================================== Create Category ========================================== //
const createCategory = async (req, res, next) => {
    //? destruct data from req.body
    const { name } = req.body;
    //? destruct data from req.authUser
    const { _id } = req.authUser;
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
        createdBy: _id,
    };
    //? create category to database
    const newCategory = await Category.create(category);
    //? check if category created or not
    if (!newCategory) {
        return next(
            new ErrorHandlerClass(
                "Category not created, please try again",
                400,
                "Error in createCategory API",
                "at Category controller",
                { category }
            )
        );
    }
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
    const queryFilters = {};
    //? check if query exists
    if (name) queryFilters.name = name;
    if (id) queryFilters._id = id;
    if (slug) queryFilters.slug = slug;
    //? find the category
    const category = await Category.findOne(queryFilters).select(
        "-createdAt -updatedAt"
    );
    //? check if category exists
    if (!category) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in getCategory API",
                "at Category controller"
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
    //? check if category exists in DB
    const category = await Category.findById(_id);
    if (!category) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in updateCategory API",
                "at Category controller"
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
            next,
        });
        category.images.secure_url = secure_url;
        category.images.public_id = public_id;
    }
    //? update category
    const updatedCategory = await category.save();
    //? check if category updated or not
    if (!updatedCategory) {
        return next(
            new ErrorHandlerClass(
                "Category not updated, please try again",
                400,
                "Error in updateCategory API",
                "at Category controller",
                { category }
            )
        );
    }
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
    //? check if category exists in DB
    //? if exist => delete category
    const deletedCategory = await Category.findByIdAndDelete(_id);
    if (!deletedCategory) {
        return next(
            new ErrorHandlerClass(
                "Category not found",
                404,
                "Error in deleteCategory API",
                "at Category controller"
            )
        );
    }
    const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${deletedCategory?.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(categoryPath);
    //? return response
    res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
        data: deletedCategory,
    });
};

/*
@api {GET} /categories/all (get all category with pagination)
*/
//! ========================= Get all categories paginated with their sub-categories ========================= //
const getAllCategories = async (req, res, next) => {
    /// => using paginate method from mongoose-paginate-v2 as schema plugin ///
    //? find all categories paginated with their sub-categories
    //? get query object
    const query = { ...req.query };
    //? get populate array
    const populateArray = [{ path: "subCategories", select: "name images -_id" }];
    //? get paginated categories
    const ApiFeaturesInstance = new ApiFeatures(Category, query, populateArray)
        .pagination()
        .filters()
        .sort()
        .search();
    const categories = await ApiFeaturesInstance.mongooseQuery;
    //? return response
    res.status(200).json({
        status: "success",
        message: "Categories found successfully",
        categoriesData: categories,
    });
};

export {
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
};
