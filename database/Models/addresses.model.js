//# global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const addressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        country: {
            type: String,
            required: [true, "country is required"],
        },
        city: {
            type: String,
            required: [true, "city is required"],
        },
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
        addressLabel: String,
        isDefault: {
            type: Boolean,
            default: false,
        },
        isMarkedAsDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
    },
    { timestamps: true, versionKey: "version_key" }
);

export const Address =
    mongoose.models.Address || model("Address", addressSchema);
