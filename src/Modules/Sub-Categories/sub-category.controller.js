//# dependencies
import { nanoid } from "nanoid";
import slugify from "slugify";

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
    SubCategory,
    Product,
} from "./../../../database/Models/index.js";

//# APIS
/*
@api {POST} /sub-categories/create (create new sub-category)
*/
//! ========================================== Create Sub-Category ========================================== //
const createSubCategory = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? destruct categoryId from req.query
    const { categoryId } = req.query;
    const category = await Category.findById(categoryId);
    //? check if category exists in DB
    if (!category) {
        return next(
            new ErrorHandlerClass(
                `Category not found`,
                404,
                "Error in createSubCategory API",
                "at SubCategory controller",
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
        next,
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
        createdBy: _id,
    };
    //? create sub-category to database
    const newSubCategory = await SubCategory.create(subCategory);
    //? check if sub-category created or not
    if (!newSubCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not created, please try again",
                400,
                "Error in createSubCategory API",
                "at SubCategory controller",
                { subCategory }
            )
        );
    }
    //? update category sub-categories array
    category.subCategories.push(newSubCategory._id);
    await category.save();
    //? check if new subCategory id added to sub-categories array or not
    if (!category.subCategories.includes(newSubCategory._id)) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category id not added to sub-categories array in category",
                400,
                "Error in createSubCategory API",
                "at SubCategory controller"
            )
        );
    }
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
    const queryFilters = {};
    //? check if query exists
    if (name) queryFilters.name = name;
    if (id) queryFilters._id = id;
    if (slug) queryFilters.slug = slug;
    //? find the sub-category
    const subCategory = await SubCategory.findOne(queryFilters).select(
        "-createdAt -updatedAt -version_key"
    );
    //? check if sub-category exists
    if (!subCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in getSubCategory API",
                "at SubCategory controller"
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
    //? check if category exists in DB
    const subCategory = await SubCategory.findById(_id).populate("categoryId");
    if (!subCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in updateSubCategory API",
                "at SubCategory controller"
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
            next,
        });
        subCategory.images.secure_url = secure_url;
        subCategory.images.public_id = public_id;
    }
    subCategory.version_key += 1;
    //? update sub-category
    const updatedSubCategory = await subCategory.save();
    //? check if sub-category updated or not
    if (!updatedSubCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not updated, please try again",
                400,
                "Error in updateSubCategory API",
                "at SubCategory controller",
                { subCategory }
            )
        );
    }
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
    //? check if sub-category exists in DB
    //? if exist => delete sub-category
    const deletedSubCategory = await SubCategory.findByIdAndDelete(_id).populate(
        "categoryId"
    );
    if (!deletedSubCategory) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category not found",
                404,
                "Error in deleteSubCategory API",
                "at SubCategory controller"
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
    //? delete relevant products from database
    await Product.deleteMany({ subCategoryId: deletedSubCategory._id });
    //? update category (delete sub-category id from category)
    const updatedCategory = await Category.findByIdAndUpdate(
        deletedSubCategory.categoryId._id,
        {
            $pull: { subCategories: deletedSubCategory._id },
        },
        { new: true }
    );
    //? check if subCategory id deleted from subCategories array in category or not
    if (updatedCategory.subCategories.includes(_id)) {
        return next(
            new ErrorHandlerClass(
                "Sub-Category id not deleted from subCategories array in category",
                400,
                "Error in deleteSubCategory API",
                "at SubCategory controller",
                { updatedCategory }
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Sub-Category deleted successfully",
        data: deletedSubCategory,
    });
};

/*
@api {GET} /sub-categories/all (get all sub-category with pagination)
*/
//! =========================== Get all subCategories paginated with their brands =========================== //
const getAllSubCategories = async (req, res, next) => {
    /*
            //? destruct data from req.query
              const { page = 1, limit = 5 } = req.query;
              const skip = (page - 1) * limit;
          */

    /*
          /// => way No.1 using find, limit and skip method ///
            //? find all subCategories paginated with their brands
          const subCategories = await SubCategory.find()
              .populate("brands")
              .limit(limit)
              .skip(skip);
            //? count total number of pages
              const count = await SubCategory.countDocuments();
            //? return response
              res.status(200).json({
                  status: "success",
                  message: "Sub-Categories found successfully",
                  subCategoriesData: subCategories,
                  totalPages: Math.ceil(count / limit),
                  currentPage: page,
              });
          */

    /*
          /// => way No.2 using using paginate method from mongoose-paginate-v2 as schema plugin ///
            //? find all subCategories paginated with their brands
              const subCategories = await SubCategory.paginate(
                  {},
                  {
                      populate: "brands",
                      limit,
                      page,
                      skip,
                  }
              );
            //? return response
              res.status(200).json({
                  status: "success",
                  message: "Sub-Categories found successfully",
                  subCategoriesData: subCategories,
              });
          */

    /// => way No.3 using api features ///
    //? destruct data from req.query
    let { limit = 5, page = 1 } = req.query;
    if (page < 1) page = 1;
    if (limit < 1) limit = 5;
    //? build a query
    const mongooseQuery = SubCategory.find();
    const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
        .paginate()
        .search()
        .limitFields();
    //? execute query
    const subCategories = await ApiFeaturesInstance.mongooseQuery.populate(
        "brands"
    );
    //? count total number of documents
    const count = await SubCategory.countDocuments();
    //? send response
    res.status(200).json({
        status: "success",
        message: "SubCategories found successfully",
        subCategoriesData: subCategories,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    });
};

export {
    createSubCategory,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getAllSubCategories,
};
