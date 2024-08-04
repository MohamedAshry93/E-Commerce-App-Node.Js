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
} from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /brands/create (create new brand)
*/
//! ========================================== Create Brand ========================================== //
const createBrand = async (req, res, next) => {
    //? destruct categoryId and subCategoryId from req.query
    const { category, subCategory } = req.query;
    const isSubCategoryExist = await SubCategory.findById({
        _id: subCategory,
        categoryId: category,
    }).populate("categoryId");
    //? check if sub-category exists
    if (!isSubCategoryExist) {
        return next(
            new ErrorHandlerClass(
                `Sub-Category not found`,
                404,
                "Error in createBrand API",
                "at createBrand controller",
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
    };
    //? create brand
    const newBrand = new Brand(brand);
    await newBrand.save();
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
    const queryFilter = {};
    //? check if query exists
    if (name) queryFilter.name = name;
    if (id) queryFilter._id = id;
    if (slug) queryFilter.slug = slug;
    //? find the brand
    const brand = await Brand.findOne(queryFilter);
    //? check if brand exists
    if (!brand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in getBrand API",
                "at getBrand controller"
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
    //? check if brand exists
    const brand = await Brand.findById(_id)
        .populate("categoryId")
        .populate("subCategoryId");
    if (!brand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in updateBrand API",
                "at updateBrand controller"
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
        });
        brand.logo.secure_url = secure_url;
        brand.logo.public_id = public_id;
    }
    //? update brand
    const updatedBrand = await brand.save();
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
    //? check if brand exists
    const deletedBrand = await Brand.findByIdAndDelete(_id).populate("categoryId").populate("subCategoryId");
    if (!deletedBrand) {
        return next(
            new ErrorHandlerClass(
                "Brand not found",
                404,
                "Error in deleteBrand API",
                "at deleteBrand controller"
            )
        )
    }
    const brandPath= `${process.env.UPLOADS_FOLDER}/Categories/${deletedBrand?.categoryId.customId}/Sub-Categories/${deletedBrand?.subCategoryId.customId}/Brands/${deletedBrand?.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(brandPath);
    //? return response
    res.status(200).json({
        status: "success",
        message: "Brand deleted successfully",
        data: deletedBrand,
    });

};

export { createBrand, getBrand, updateBrand, deleteBrand };
