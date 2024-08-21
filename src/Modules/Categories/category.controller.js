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
import {
    Brand,
    Category,
    Product,
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
        createdBy: _id
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
    const category = await Category.findOne(queryFilters).select("-createdAt -updatedAt -version_key");
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
    category.version_key += 1;
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
    //? delete relevant sub-category from database
    const deletedSubCategories = await SubCategory.deleteMany({
        categoryId: deletedCategory._id,
    });
    //? if sub-categories deleted => delete relevant products and brands from database
    if (deletedSubCategories.deletedCount) {
        //? delete relevant brands from database
        const deletedBrands = await Brand.deleteMany({
            categoryId: deletedCategory._id,
        });
        //? if brands deleted => delete relevant products from database
        if (deletedBrands.deletedCount) {
            //? delete relevant products from database
            await Product.deleteMany({ categoryId: deletedCategory._id });
        }
    }
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
    /*
        //? destruct data from req.query
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
      */

    /*
        /// => way No.1 using find, limit and skip method ///
        //? find all categories paginated with their sub-categories
        const categories = await Category.find()
            .populate("subCategories")
            .skip(skip)
            .limit(limit);
        //? count total number of pages
        const count = await Category.countDocuments();
        //? return response
        res.status(200).json({
            status: "success",
            message: "Categories found successfully",
            categoriesData: categories,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
      */

    /*
        /// => way No.2 using using paginate method from mongoose-paginate-v2 as schema plugin ///
        //? find all categories paginated with their sub-categories
        const categories = await Category.paginate(
            {},
            {
                page,
                limit,
                skip,
                populate: ["subCategories"],
            }
        );
        //? return response
        res.status(200).json({
            status: "success",
            message: "Categories found successfully",
            categoriesData: categories,
        });
      */

    /// => way No.3 using api features ///
    //? destruct data from req.query
    let { limit = 5, page = 1 } = req.query;
    if (page < 1) page = 1;
    if (limit < 1) limit = 5;
    //? build a query
    const mongooseQuery = Category.find();
    const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
        .paginate()
        .search()
        .limitFields();
    //? execute query
    const categories = await ApiFeaturesInstance.mongooseQuery.populate(
        "subCategories"
    );
    //? count total number of documents
    const count = await Category.countDocuments();
    //? send response
    res.status(200).json({
        status: "success",
        message: "Categories found successfully",
        categoriesData: categories,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    });
};

export {
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
};
