//# dependencies

//# middlewares

//# utils
import {
    ErrorHandlerClass,
    OrderStatus,
    ReviewStatus,
} from "../../Utils/index.js";

//# models
import { Order, Product, Review } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /reviews/add/:productId (add new review)
*/
//! ========================================== Add Reviews ========================================== //
const addReview = async (req, res, next) => {
    //? destruct data from req.body
    const { rating, comment } = req.body;
    //? get product id from req.params
    const { productId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? check if user already reviewed this product or not
    const review = await Review.findOne({ reviewedBy: userId, productId });
    if (review) {
        return next(
            new ErrorHandlerClass(
                "You already reviewed this product",
                400,
                "Error in addReview API",
                "at Review controller"
            )
        );
    }
    //? check if product exists on DB or not
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        return next(
            new ErrorHandlerClass(
                "Product not found",
                404,
                "Error in addReview API",
                "at Review controller",
                { productId }
            )
        );
    }
    //? check if user already bought this product or not
    const order = await Order.findOne({
        userId,
        "products.productId": productId,
        orderStatus: OrderStatus.DELIVERED,
    });
    if (!order) {
        return next(
            new ErrorHandlerClass(
                "You have not bought this product",
                400,
                "Error in addReview API",
                "at Review controller",
                { productId }
            )
        );
    }
    //? create review instance
    const reviewInstance = new Review({
        reviewedBy: userId,
        productId,
        rating,
        comment,
    });
    //? save review
    const newReview = await reviewInstance.save();
    //? send response
    res.status(201).json({
        status: "success",
        message: "Review added successfully",
        data: newReview,
    });
};

/*
@api {GET} /reviews/list (get user reviews)
*/
//! ========================================== Get User Reviews ========================================== //
const getUserReviews = async (req, res, next) => {
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? get reviews
    const reviews = await Review.find({ reviewedBy: userId }).populate([
        { path: "productId", select: "title description specs images rating -_id" },
    ]);
    //? send response
    res.status(200).json({
        status: "success",
        message: "Reviews found successfully",
        data: reviews,
    });
};

/*
@api {PATCH} /reviews/change-status/:reviewId (change review status)
*/
//! ========================================== Change Review Status ========================================== //
const changeReviewStatus = async (req, res, next) => {
    //? destruct data from req.params
    const { reviewId } = req.params;
    //? destruct data from req.body
    const { status } = req.body;
    //? check if review exists on DB or not
    const review = await Review.findByIdAndUpdate(
        { _id: reviewId },
        {
            reviewStatus: [ReviewStatus.APPROVED, ReviewStatus.REJECTED].includes(
                status
            )
                ? status
                : ReviewStatus.PENDING,
        },
        { new: true }
    );
    if (!review) {
        return next(
            new ErrorHandlerClass(
                "Review not found",
                404,
                "Error in changeReviewStatus API",
                "at Review controller",
                { reviewId }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Review status changed successfully",
        data: review,
    });
};

export { addReview, getUserReviews, changeReviewStatus };