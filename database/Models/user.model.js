//# dependencies
import { hashSync } from "bcrypt";

//# global setup
import mongoose from "../global-setup.js";

//# utils
import { Gender, SystemRoles } from "../../src/Utils/index.js";

const { Schema, model } = mongoose;

//# create user schema
const userSchema = new Schema(
    {
        //# Strings section
        userName: {
            type: String,
            required: [true, "user name is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minLength: [3, "too short user name"],
            maxLength: [30, "too long user name"],
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        userType: {
            type: String,
            required: [true, "you must choose your role"],
            enum: Object.values(SystemRoles),
        },
        gender: {
            type: String,
            enum: Object.values(Gender),
        },
        phone: {
            type: String,
            required: [true, "phone number is required"],
        },
        resetPasswordOtp: String,
        //# Numbers section
        age: {
            type: Number,
            min: [10, "too young member"],
            max: 100,
        },
        //# Boolean section
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isMarkedAsDeleted: {
            type: Boolean,
            default: false,
        },
        isLoggedIn: {
            type: Boolean,
            default: false,
        },
        resetPasswordVerified: Boolean,
        //# Dates section
        resetPasswordExpires: Date,
        passwordChangeAt: Date,
    },
    { timestamps: true, versionKey: "version_key" }
);

//! ================================ Document Middleware ================================ //
//? pre Hook to hash password before save it to database
userSchema.pre("save", function (next) {
    if (this.isModified("password"))
        this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
    next();
});

export const User = mongoose.models.User || model("User", userSchema);
