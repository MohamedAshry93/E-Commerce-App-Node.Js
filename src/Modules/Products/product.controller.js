//# dependencies
import { nanoid } from "nanoid";
import slugify from "slugify";

//# utils
import {
    calculateProductPrice,
    cloudinaryConfig,
    ErrorHandlerClass,
    uploadNewFile,
    ApiFeatures,
} from "../../Utils/index.js";

//# models
import { Product, Brand } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /products/create (create new product)
*/
//! ========================================== Create Product ========================================== //
const createProduct = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? destruct data from req.body
    const {
        title,
        description,
        specs,
        badge,
        price,
        discountAmount,
        discountType,
        stock,
        rating,
    } = req.body;
    //? req.files
    if (!req.files.length) {
        return next(
            new ErrorHandlerClass(
                "Product image not found",
                400,
                "Please upload an image"
            )
        );
    }
    //# Ids check
    const brandDocument = req.document;
    //? images section
    //? Access the customIds of the category, sub-category and brand from the document
    const brandCustomId = brandDocument.customId;
    const categoryCustomId = brandDocument.categoryId.customId;
    const subCategoryCustomId = brandDocument.subCategoryId.customId;
    const customId = nanoid(4);
    const folder = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/Sub-Categories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;

    const URLs = [];
    for (const file of req.files) {
        const { secure_url, public_id } = await uploadNewFile({
            file: file.path,
            folder,
            resource_type: "image",
            use_filename: true,
            tags: ["productImage"],
            next,
        });
        URLs.push({ secure_url, public_id });
    }
    //? create product object
    const product = {
        title,
        description,
        specs: JSON.parse(specs),
        badge,
        price,
        appliedDiscount: {
            amount: discountAmount,
            type: discountType,
        },
        stock,
        rating,
        images: {
            URLs,
            customId,
        },
        brandId: brandDocument._id,
        categoryId: brandDocument.categoryId._id,
        subCategoryId: brandDocument.subCategoryId._id,
        createdBy: _id,
    };
    //? create product
    const newProduct = await Product.create(product);
    //? check if new product created or not
    if (!newProduct) {
        return next(
            new ErrorHandlerClass(
                "Product not created, please try again",
                400,
                "Error in createProduct API",
                "at Product controller",
                { product }
            )
        );
    }
    //? update brand (add product id to its brand)
    const updatedBrand = await Brand.findByIdAndUpdate(
        brandDocument._id,
        {
            $push: { products: newProduct._id },
        },
        { new: true }
    );
    //? check if new product id added to products array in brand or not
    if (!updatedBrand.products.includes(newProduct._id)) {
        return next(
            new ErrorHandlerClass(
                "Product id not added to products array in brand",
                400,
                "Error in createProduct API",
                "at Product controller"
            )
        );
    }
    //? send response
    res.status(201).json({
        status: "success",
        message: "Product created successfully",
        product: newProduct,
    });
};

/*
@api {GET} /products/:_id (get product by id)
*/
//! ========================================== Get Product ========================================== //
const getProduct = async (req, res, next) => {
    //? destruct id from req.params
    const { _id } = req.params;
    //? check if product exists in DB
    const product = await Product.findById(_id);
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in getProduct API",
                "at Product controller"
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Product found successfully",
        data: product,
    });
};

/*
@api {GET} /products/all (get all products with pagination)
*/
//! ================================ Get All Products with pagination ================================ //
const getAllProducts = async (req, res, next) => {
    /*
            //? destruct data from req.query
                const {
                    page = 1,
                    limit = 5,
                    sort,
                    ...filters
                } = req.query;
                const skip = (page - 1) * limit;
            //? destruct price, appliedPrice, stock, categoryId, subCategoryId, brandId, rating from filters
                const filtersAsString = JSON.stringify(filters);
                const replacedFilters = filtersAsString.replaceAll(
                    /lt|gt|lte|gte|eq|ne|regex/g,
                    (ele) => `$${ele}`
                );
                const parsedFilters = JSON.parse(replacedFilters);
            */

    /*
            /// => way No.1 using find, limit and skip method ///
            //? find all products with pagination
                const products = await Product.find(parsedFilters)
                    .limit(limit)
                    .skip(skip)
                    .populate([{ path: "brandId" }, { path: "categoryId" }, { path: "subCategoryId" }])
                    .sort(sort);
            //? count total number of documents
                const count = await Product.countDocuments();
            //? send response
                res.status(200).json({
                    status: "success",
                    message: "Products found successfully",
                    productsData: products,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                });
            */

    /*
            /// => way No.2 using using paginate method from mongoose-paginate-v2 as schema plugin ///
            //? find all products with pagination
                const products = await Product.paginate(parsedFilters, {
                    page,
                    limit,
                    skip,
                    sort,
                    populate: ["brandId", "categoryId", "subCategoryId"],
                });
            //? send response
                res.status(200).json({
                    status: "success",
                    message: "Products found successfully",
                    productsData: products,
                });
            */

    /// => way No.3 using api features ///
    //? destruct data from req.query
    let { limit = 5, page = 1 } = req.query;
    //? build a query
    const mongooseQuery = Product.find();
    const ApiFeaturesInstance = new ApiFeatures(mongooseQuery, req.query)
        .paginate()
        .filter()
        .search()
        .limitFields()
        .sort();
    //? execute query
    const products = await ApiFeaturesInstance.mongooseQuery.populate([
        { path: "brandId" },
        { path: "categoryId" },
        { path: "subCategoryId" },
    ]);
    //? count total number of documents
    const count = await Product.countDocuments();
    //? send response
    res.status(200).json({
        status: "success",
        message: "Products found successfully",
        productsData: products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    });
};

/*
@api {PUT} /products/update/:_id (update a product)
*/
//! ========================================== Update Product ========================================== //
const updateProduct = async (req, res, next) => {
    //? destruct id from req.params
    const { productId } = req.params;
    //? destructing data from req.body
    const {
        title,
        description,
        specs,
        badge,
        price,
        discountAmount,
        discountType,
        stock,
        rating,
        old_public_ids,
    } = req.body;
    //? check if product exists in DB
    const product = await Product.findById(productId);
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in updateProduct API",
                "at Product controller"
            )
        );
    }
    //? update the product title and slug
    if (title) {
        product.title = title;
        product.slug = slugify(title, {
            trim: true,
            lower: true,
        });
    }
    //? update the product description, stock, badges, specs and rating
    if (description) product.description = description;
    if (stock) product.stock = stock;
    if (badge) product.badge = badge;
    if (specs) product.specs = JSON.parse(specs);
    if (rating) product.rating = rating;
    //? update the product price and discount
    if (price || discountAmount || discountType) {
        const newPrice = price || product.price;
        const discount = {};
        discount.amount = discountAmount || product.appliedDiscount.amount;
        discount.type = discountType || product.appliedDiscount.type;
        product.appliedPrice = calculateProductPrice(newPrice, discount);
        product.price = newPrice;
        product.appliedDiscount = discount;
    }
    //? update the product images
    //# Ids check
    const brandDocument = req.document;
    //? images section
    //? Access the customIds of the category, sub-category and brand from the document
    const brandCustomId = brandDocument.customId;
    const categoryCustomId = brandDocument.categoryId.customId;
    const subCategoryCustomId = brandDocument.subCategoryId.customId;
    const folder = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/Sub-Categories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${product.images?.customId}`;
    const URLs = [];
    //? check if an image is uploaded or not
    if (req.files.length) {
        //? delete the old images from cloudinary
        const deletedOldImages = await cloudinaryConfig().api.delete_resources(
            old_public_ids
        );
        for (const image in deletedOldImages.deleted) {
            //? check if the old image is not found
            if (deletedOldImages.deleted[image] == "not_found") {
                return next(
                    new ErrorHandlerClass(
                        "Old images not found",
                        404,
                        "Error in updateProduct API",
                        "at Product controller",
                        { image }
                    )
                );
            }
        }
        for (const file of req.files) {
            //? upload new images to cloudinary
            const { secure_url, public_id } = await uploadNewFile({
                file: file.path,
                folder,
                resource_type: "image",
                use_filename: true,
                tags: ["productImage"],
                next,
            });
            URLs.push({ secure_url, public_id });
        }
        product.images.URLs = URLs;
    }
    //? save the product
    const updatedProduct = await product.save();
    //? check if product updated or not
    if (!updatedProduct) {
        return next(
            new ErrorHandlerClass(
                "Product not updated, please try again",
                400,
                "Error in updateProduct API",
                "at Product controller",
                { product }
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
    });
};

/*
@api {DELETE} /products/delete/:_id (delete a product)
*/
//! ========================================== Delete Product ========================================== //
const deleteProduct = async (req, res, next) => {
    //? destruct id from req.params
    const { productId } = req.params;
    //? check if product exists in DB
    const deletedProduct = await Product.findByIdAndDelete(productId)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("brandId");
    if (!deletedProduct) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in deleteProduct API",
                "at Product controller"
            )
        );
    }
    const productPath = `${process.env.UPLOADS_FOLDER}/Categories/${deletedProduct.categoryId.customId}/Sub-Categories/${deletedProduct.subCategoryId.customId}/Brands/${deletedProduct.brandId.customId}/Products/${deletedProduct.images.customId}`;
    //? delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(productPath);
    //? delete folder from cloudinary
    await cloudinaryConfig().api.delete_folder(productPath);
    //? update brand (delete product id from its brand)
    const updatedBrand = await Brand.findByIdAndUpdate(
        deletedProduct.brandId._id,
        {
            $pull: { products: deletedProduct._id },
        },
        { new: true }
    );
    //? check if product id deleted from products array in brand or not
    if (updatedBrand.products.includes({ _id: productId })) {
        return next(
            new ErrorHandlerClass(
                "Product id not deleted from products array in brand",
                400,
                "Error in deleteProduct API",
                "at Product controller",
                { updatedBrand }
            )
        );
    }
    //? return response
    res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
        data: deletedProduct._id,
    });
};

export {
    createProduct,
    updateProduct,
    getProduct,
    getAllProducts,
    deleteProduct,
};
