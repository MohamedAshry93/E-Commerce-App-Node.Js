//# global setup
import mongoose from "../global-setup.js";

//# utils
import { ReviewStatus } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create review schema
const reviewSchema = new Schema(
    {
        //# ObjectIds section
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        actionDoneBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        //# Numbers section
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        //# String section
        comment: String,
        reviewStatus: {
            type: String,
            enum: Object.values(ReviewStatus),
            default: ReviewStatus.PENDING,
        },
    },
    { timestamps: true, versionKey: false }
);

export const Review = mongoose.models.Review || model("Review", reviewSchema);
