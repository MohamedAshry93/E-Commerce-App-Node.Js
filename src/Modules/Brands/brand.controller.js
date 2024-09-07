//# dependencies
import { nanoid } from "nanoid";
import slugify from "slugify";

//# utils
import {
    cloudinaryConfig,
    uploadNewFile,
    uploadUpdatedFile,
    ErrorHandlerClass,
} from "../../Utils/index.js";

//# models
import { Brand, SubCategory } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /categories/:category/:subCategory/brands/create (create new brand)
*/
//! ========================================== Create Brand ========================================== //
const createBrand = async (req, res, next) => {
    //? destruct data from req.authUser;
    const { _id } = req.authUser;
    //? destruct categoryId and subCategoryId from req.params
    const { category, subCategory } = req.params;
    //? check if category and sub-category exists in DB
    const isSubCategoryExist = await SubCategory.findById({
        _id: subCategory,
        categoryId: category,
    }).populate("categoryId");
    //? check if sub-category exists in DB
    if (!isSubCategoryExist) {
        return next(
            new ErrorHandlerClass(
                `Sub-Category not found`,
                404,
                "Error in createBrand API",
                "at Brand controller",
                { category, subCategory }
            )
        );
    }
    //? destruct data from req.body
    const { name } = req.body;
    //? generate brand slug
    const slug = slugify(name, {
        trim: true,
        lower: true,
    });
    //? Image
    if (!req.file) {
        return next(
            new ErrorHandlerClass(
                "Brand image not found",
                400,
                "Please upload an image"
            )
        );
    }
    //? upload image to cloudinary
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadNewFile({
        file: req.file.path,
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${isSubCategoryExist.categoryId.customId}/Sub-Categories/${isSubCategoryExist.customId}/Brands/${customId}`,
        resource_type: "image",
        use_filename: true,
        tags: ["brandImage"],
        next,
    });
    //? create brand object
    const brand = {
        name,
        slug,
        logo: {
            public_id,
            secure_url,
        },
        customId,
        categoryId: isSubCategoryExist.categoryId._id,
        subCategoryId: isSubCategoryExist._id,
        createdBy: _id,
    };
    //? create brand
    const newBrand = await Brand.create(brand);
    //? check if brand created or not
    if (!newBrand) {
        return next(
            new ErrorHandlerClass(
                "Brand not created, please try again",
                400,
                "Error in createBrand API",
                "at Brand controller",
                { brand }
            )
        );
    }
    //? update sub-category (add brand to its sub-category)
    isSubCategoryExist.brands.push(newBrand._id);
    await isSubCategoryExist.save();
    //? check if new brand id added to brands array or not
    if (!isSubCategoryExist.brands.includes(newBrand._id)) {
        return next(
            new ErrorHandlerClass(
                "Brand id not added to brands array in subCategory, please try again",
                400,
                "Error in createBrand API",
                "at Brand controller"
            )
        );
    }
    //? return response
    return res.status(201).json({
        status: "success",
        message: "Brand created successfully",
        data: newBrand,
    });
};

/*
@api {GET} /brands/ (get brand by name or id or slug)
*/
//! ========================================== Get Brand ========================================== //
const getBrand = async (req, res, next) => {
    //? destruct data from req.query
    const { name, id, slug } = req.query;
    const queryFilters = {};
    //? check if query exists
    if (name) queryFilters.name = name;
    if (id) queryFilters._id = id;
    if (slug) queryFilters.slug = slug;
    //? find the brand
    const brand = await Brand.findOne(queryFilters);
    //? check if brand exists
    if (!brand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in getBrand API",
                "at Brand controller"
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brand found successfully",
        data: brand,
    });
};

/*
@api {PUT} /brands/update/:_id (update a brand)
*/
//! ========================================== Update Brand ========================================== //
const updateBrand = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if brand exists in DB
    const brand = await Brand.findById(_id)
        .populate("categoryId")
        .populate("subCategoryId");
    if (!brand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in updateBrand API",
                "at Brand controller"
            )
        );
    }
    //? destruct data from req.body
    const { name, old_public_id } = req.body;
    if (name) {
        //? generate brand slug
        const slug = slugify(name, {
            trim: true,
            lower: true,
        });
        brand.name = name;
        brand.slug = slug;
    }
    //? Image
    if (req.file) {
        //? upload image to cloudinary
        const { secure_url, public_id } = await uploadUpdatedFile({
            old_public_id,
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/Sub-Categories/${brand.subCategoryId.customId}/Brands/${brand.customId}`,
            use_filename: true,
            resource_type: "image",
            tags: ["brandImage"],
            next,
        });
        brand.logo.secure_url = secure_url;
        brand.logo.public_id = public_id;
    }
    //? update brand
    const updatedBrand = await brand.save();
    //? check if brand updated or not
    if (!updatedBrand) {
        return next(
            new ErrorHandlerClass(
                "Brand not updated, please try again",
                400,
                "Error in updateBrand API",
                "at Brand controller",
                { brand }
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brand updated successfully",
        data: updatedBrand,
    });
};

/*
@api {DELETE} /brands/delete/:_id (delete a brand)
*/
//! ========================================== Delete Brand ========================================== //
const deleteBrand = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if brand exists in DB
    //? if exist => delete brand
    const deletedBrand = await Brand.findByIdAndDelete(_id)
        .populate("categoryId")
        .populate("subCategoryId");
    if (!deletedBrand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in deleteBrand API",
                "at Brand controller"
            )
        );
    }
    const brandPath = `${process.env.UPLOADS_FOLDER}/Categories/${deletedBrand?.categoryId.customId}/Sub-Categories/${deletedBrand?.subCategoryId.customId}/Brands/${deletedBrand?.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(brandPath);
    //? update sub-category (delete brand from its sub-category)
    await SubCategory.findByIdAndUpdate(deletedBrand.subCategoryId._id, {
        $pull: {
            brands: deletedBrand._id,
        },
    });
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brand deleted successfully",
        data: deletedBrand,
    });
};

/*
@api {GET} /brands/ (get brands for specific subCategory or category or name)
*/
//! ====================== Get brands for specific subCategory or category or name ====================== //
const getBrands = async (req, res, next) => {
    //? destruct data from req.query
    const { category, subCategory, name } = req.query;
    const queryFilters = {};
    //? check if query exists
    if (category) queryFilters.categoryId = category;
    if (subCategory) queryFilters.subCategoryId = subCategory;
    if (name) queryFilters.name = name;
    //? find the brands
    const brands = await Brand.find(queryFilters);
    //? check if brands found or not
    if (!brands.length) {
        return next(
            new ErrorHandlerClass(
                "Brands not found",
                404,
                "Error in getBrands API",
                "at Brand controller"
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brands found successfully",
        data: brands,
    });
};

/*
@api {GET} /brands/list (get all brands with its products)
*/
//! ================================ Get all brands with their products ================================ //
const getAllBrands = async (req, res, next) => {
    //? find the brands with their products
    const brands = await Brand.find().populate("products");
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brands found successfully",
        data: brands,
    });
};

export {
    createBrand,
    getBrand,
    updateBrand,
    deleteBrand,
    getAllBrands,
    getBrands,
};
