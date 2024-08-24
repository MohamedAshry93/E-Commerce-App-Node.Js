//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

//# create address schema
const addressSchema = new Schema(
    {
        //# ObjectIds section
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        //# Strings section
        country: {
            type: String,
            required: [true, "country is required"],
        },
        city: {
            type: String,
            required: [true, "city is required"],
        },
        addressLabel: String,
        //# Numbers section
        postalCode: {
            type: Number,
            required: [true, "postalCode is required"],
        },
        buildingNumber: {
            type: Number,
            required: [true, "buildingNumber is required"],
        },
        floorNumber: {
            type: Number,
            required: [true, "floorNumber is required"],
        },
        //# Booleans section
        isDefault: {
            type: Boolean,
            default: false,
        },
        isMarkedAsDeleted: {
            type: Boolean,
            default: false,
        },
        //# Dates section
        deletedAt: Date,
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Address =
    mongoose.models.Address || model("Address", addressSchema);
