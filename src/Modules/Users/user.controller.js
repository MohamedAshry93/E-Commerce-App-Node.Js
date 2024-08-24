//# dependencies
import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import axios from "axios";

//# utils
import { ErrorHandlerClass } from "../../Utils/index.js";

//# services
import { sendEmailService } from "../../Services/send-email.service.js";

//# models
import {
    Address,
    Brand,
    Category,
    Coupon,
    Product,
    SubCategory,
    User,
} from "./../../../database/Models/index.js";

//# APIS
/*
@api {POST} /users/signup (register a new user)
*/
//! ========================================== Registration ========================================== //
const signUp = async (req, res, next) => {
    //? destructing data from req.body
    const {
        userName,
        email,
        password,
        confirmPassword,
        userType,
        age,
        gender,
        phone,
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
    } = req.body;
    //? create user instance
    const userInstance = new User({
        userName,
        email,
        password,
        userType,
        age,
        gender,
        phone,
    });
    //? create cities and countries validation api
    const region = await axios.get(
        `https://api.api-ninjas.com/v1/city?name=${city}&country=${country}`,
        {
            headers: {
                "X-Api-Key": process.env.API_NINJA_KEY,
            },
        }
    );
    //? check if city and country exist in validation api or not
    if (!region?.data.length) {
        return next(
            new ErrorHandlerClass(
                "City or Country not found please check your region and enter a valid city name and valid country name (country must be an ISO-3166 alpha-2 country code (e.g. US))",
                404,
                "Error in addAddress API",
                "at Address controller",
                { city, country }
            )
        );
    }
    //? create new address instance
    const addressInstance = new Address({
        userId: userInstance._id,
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        isDefault: true,
    });
    //? generate token
    const token = jwt.sign(
        {
            userId: userInstance._id,
            email: userInstance.email,
            mobile: userInstance.phone,
        },
        process.env.CONFIRMATION_SECRET,
        { expiresIn: "1h" }
    );
    //? generate confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/users/verify-email/${token}`;
    //? send email confirmation link
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Welcome to Our App - Verify your email address",
        text: "Please verify your email address",
        html: `<a href=${confirmationLink} > Please verify your email address </a>`,
    });
    //? check if email sent successfully or not
    if (!isEmailSent.accepted.length) {
        return next(
            new ErrorHandlerClass(
                "Verification sending email is failed, please try again",
                400,
                "Error in user controller",
                "at checking isEmailSent in signUp API",
                { email }
            )
        );
    }
    //? save user in database
    const user = await userInstance.save();
    //? check if user saved or not
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User registration is failed, please try again",
                400,
                "Error in user controller",
                "at checking user added or not in signUp API",
                { userInstance }
            )
        );
    }
    //? save address in database
    const address = await addressInstance.save();
    //? check if address saved or not
    if (!address) {
        return next(
            new ErrorHandlerClass(
                "User registration is failed, please try again",
                400,
                "Error in user controller",
                "at checking address added or not in signUp API",
                { addressInstance }
            )
        );
    }
    //? send response
    res.status(201).json({
        status: "success",
        message: "User created successfully",
        userData: {
            id: user._id,
            name: user.userName,
            email: user.email,
            mobile: user.phone,
            userType: user.userType,
            age: user.age,
            gender: user.gender,
            isEmailVerified: user.isEmailVerified,
        },
        addressData: address,
    });
};

/*
@api {GET} /users/verify-email/:token (verify an email)
*/
//! ============================================= Verify email ============================================= //
const verifyEmail = async (req, res, next) => {
    //? destruct token
    const { token } = req.params;
    //? verify token
    const decodedData = jwt.verify(token, process.env.CONFIRMATION_SECRET);
    //? check decoded data
    if (!decodedData?.userId) {
        return next(
            new ErrorHandlerClass(
                "Invalid token payload",
                401,
                "Error in user controller",
                "at verify decodedData in verifyEmail API",
                { token }
            )
        );
    }
    //? update user
    const confirmedUser = await User.findOneAndUpdate(
        {
            _id: decodedData?.userId,
            isEmailVerified: false,
        },
        { isEmailVerified: true },
        { new: true }
    );
    //? check user exists in database or not
    if (!confirmedUser) {
        return next(
            new ErrorHandlerClass(
                "Invalid verification link",
                404,
                "Error in user controller",
                "at checking confirmedUser in verifyEmail API",
                { token }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Email verified successfully",
        confirmedUser,
    });
};

/*
@api {POST} /users/login (user signIn)
*/
//! ============================================= Login ============================================= //
const signIn = async (req, res, next) => {
    //? destruct data from req.body
    const { email, password } = req.body;
    //? check if user exists in database or not
    const user = await User.findOne({ email });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "Invalid Login credentials",
                404,
                "Error in user controller",
                "at signIn API"
            )
        );
    }
    //? compare password
    if (!compareSync(password, user.password)) {
        return next(
            new ErrorHandlerClass(
                "Invalid Login credentials",
                401,
                "Error in user controller",
                "at signIn API"
            )
        );
    }
    //? generate token
    const token = jwt.sign(
        {
            userId: user._id,
            name: user.userName,
            email: user.email,
            mobile: user.phone,
        },
        process.env.LOGIN_SECRET,
        { expiresIn: "1h" }
    );
    (user.isLoggedIn = true), await user.save();
    //? send response
    res.status(200).json({
        status: "success",
        message: "User logIn successfully",
        token,
    });
};

/*
@api {POST} /users/logout (user signOut)
*/
//! ============================================= Log Out ============================================= //
const signOut = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? update user
    const user = await User.findOneAndUpdate(
        { _id },
        { isLoggedIn: false },
        { new: true }
    );
    //? send response
    res.status(200).json({
        status: "success",
        message: "User logOut successfully",
        userData: { name: user.userName },
    });
};

/*
@api {PUT} /users/update-profile (update profile)
*/
//! ================================= Update account by his user ================================= //
const updatedAccount = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? destruct data from req.body
    const { userName, email, phone, age, gender } = req.body;
    //? check user exists in database or not
    const user = await User.findOne({ _id, isLoggedIn: true });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User not found you must login",
                404,
                "Error in user controller",
                "at checking user in updatedAccount API"
            )
        );
    }
    //? check if user name is updated
    if (userName) user.userName = userName;
    //? check if phone is updated
    if (phone) user.phone = phone;
    //? check if age is updated
    if (age) user.age = age;
    //? check if gender is updated
    if (gender) user.gender = gender;
    //? check if email is updated
    if (email) {
        user.email = email;
        user.isEmailVerified = false;
        //? generate token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                mobile: user.phone,
            },
            process.env.CONFIRMATION_SECRET,
            { expiresIn: "1h" }
        );
        //? generate confirmation link
        const confirmationLink = `${req.protocol}://${req.headers.host}/users/verify-email/${token}`;
        //? send email confirmation link
        const isEmailSent = await sendEmailService({
            to: email,
            subject: "Welcome to Our App - Verify your email address",
            text: "Please verify your email address",
            html: `<a href=${confirmationLink} > Please verify your email address </a>`,
        });
        //? check if email sent successfully or not
        if (!isEmailSent.accepted.length) {
            return next(
                new ErrorHandlerClass(
                    "Verification sending email is failed, please try again",
                    400,
                    "Error in user controller",
                    "at checking isEmailSent in updatedAccount API",
                    { email }
                )
            );
        }
    }
    user.version_key += 1;
    //? save user in database
    const updatedUser = await user.save();
    //? check user saved in database or not
    if (!updatedUser) {
        return next(
            new ErrorHandlerClass(
                "User updated is failed, please try again",
                400,
                "Error in user controller",
                "at checking user updated or not in updatedAccount API",
                { user }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "User updated successfully",
        userData: {
            id: updatedUser._id,
            name: updatedUser.userName,
            email: updatedUser.email,
            mobile: updatedUser.phone,
            age: updatedUser.age,
            gender: updatedUser.gender,
            isEmailVerified: updatedUser.isEmailVerified,
        },
    });
};

/*
@api {DELETE} /users/delete-account (delete account)
*/
//! ==================================== Delete account by his user ==================================== //
const deletedAccount = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? check user exists in database or not
    const user = await User.findById({ _id });
    //? check if user is admin or not
    if (user.userType == "Company_ADMIN") {
        await Category.deleteMany({ createdBy: _id });
        await SubCategory.deleteMany({ createdBy: _id });
        await Brand.deleteMany({ createdBy: _id });
        await Product.deleteMany({ createdBy: _id });
        await User.findByIdAndDelete({ _id });
        await Address.deleteMany({ userId: _id });
        await Coupon.deleteMany({ createdBy: _id });
    }
    if (user.userType == "User") {
        await User.findByIdAndDelete({ _id });
        await Address.deleteMany({ userId: _id });
    }
    //? send response
    res.status(200).json({
        message: "User deleted successfully",
        userData: {
            id: user._id,
            name: user.userName,
            email: user.email,
            mobile: user.phone,
            userType: user.userType,
            age: user.age,
            gender: user.gender,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

/*
@api {GET} /users/user-data (get account data)
*/
//! ================================= Get account data for loggedIn user ================================ //
const getAccountData = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? check user exists in database or not
    const user = await User.findOne({ _id, isLoggedIn: true });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User not found you must login",
                404,
                "Error in user controller",
                "at checking user in getAccountData API"
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Account found successfully",
        accountData: {
            id: user._id,
            name: user.userName,
            email: user.email,
            mobile: user.phone,
            userType: user.userType,
            age: user.age,
            gender: user.gender,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

/*
@api {PUT} /users/update-password (update password)
*/
//! ========================================= Update password ========================================= //
const updatedPassword = async (req, res, next) => {
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? destruct data from req.body
    const { password, confirmPassword, oldPassword } = req.body;
    //? check user exists in database or not
    const user = await User.findOne({ _id, isLoggedIn: true });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User not found you must login",
                404,
                "Error in user controller",
                "at checking user in updatedPassword API"
            )
        );
    }
    //? check old password
    if (!compareSync(oldPassword, user.password)) {
        return next(
            new ErrorHandlerClass(
                "Old password is not correct",
                400,
                "Error in user controller",
                "at checking old password in updatedPassword API"
            )
        );
    }
    //? check if password and confirmPassword are updated
    if (password) user.password = password;
    user.version_key += 1;
    //? update user
    const updatedUser = await user.save();
    //? check user updated or not
    if (!updatedUser) {
        return next(
            new ErrorHandlerClass(
                "User updated is failed, please try again",
                400,
                "Error in user controller",
                "at checking user updated or not in updatedPassword API"
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Password updated successfully",
        userData: {
            id: updatedUser._id,
            name: updatedUser.userName,
        },
    });
};

/*
@api {POST} /users/forget-password (forget password)
*/
//! ========================================= Forget password ========================================= //
const forgetPassword = async (req, res, next) => {
    //? destruct data from req.body
    const { email } = req.body;
    //? check user exists in database or not
    const user = await User.findOne({ email });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User not found",
                404,
                "Error in user controller",
                "at searching for user in forgetPassword API",
                { email }
            )
        );
    }
    //? generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    //? hashed OTP
    const hashedOtp = hashSync(otp.toString(), +process.env.SALT_ROUNDS);
    //? send email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Welcome to Our App - Password Reset OTP",
        text: "Password Reset OTP",
        html: `<h1>Hii ${user.userName} 👋</h1>\n
            <h4>we received a request to reset your password..</h4>
            <h3><b>This is your password reset OTP:</b> ${otp}</h3> \n
            <h4>If you did not request this, please ignore this email.</h4>`,
    });
    //? check if email sending is successful or not
    if (!isEmailSent.accepted.length) {
        return next(
            new ErrorHandlerClass(
                "Verification sending email is failed, please try again",
                400,
                "Error in forget password controller",
                "at checking isEmailSent",
                { email }
            )
        );
    }
    //? save hashed OTP in database
    user.resetPasswordOtp = hashedOtp;
    //? set expiration time for OTP (10 min)
    user.resetPasswordExpires = Date.now() + 3600000;
    user.resetPasswordVerified = false;
    //? update user
    const updatedData = await user.save();
    //? check data updated or not
    if (!updatedData) {
        return next(
            new ErrorHandlerClass(
                "Data updated is failed, please try again",
                400,
                "Error in user controller",
                "at checking data updated or not in forgetPassword API",
                { user }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "OTP sent successfully",
        otp: hashedOtp,
    });
};

/*
@api {POST} /users/reset-password (reset password)
*/
//! ========================================= Reset password ========================================= //
const resetPassword = async (req, res, next) => {
    //? destruct data from req.body
    const { email, otp, password, confirmPassword } = req.body;
    //? check user exists in database or not
    const user = await User.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(
            new ErrorHandlerClass(
                "User not found",
                404,
                "Error in resetPassword controller",
                "at searching for user",
                { email }
            )
        );
    }
    //? compare OTP
    if (!compareSync(otp, user.resetPasswordOtp)) {
        return next(
            new ErrorHandlerClass(
                "Invalid OTP",
                400,
                "Error in resetPassword controller",
                "at checking otp",
                { otp }
            )
        );
    }
    //? update password
    user.password = password;
    //? delete hashed OTP from database
    user.resetPasswordOtp = undefined;
    //? delete expiration time from database
    user.resetPasswordExpires = undefined;
    //? set passwordVerified to true
    user.resetPasswordVerified = true;
    user.version_key += 1;
    //? update user
    const updatedUser = await user.save();
    //? check user updated or not
    if (!updatedUser) {
        return next(
            new ErrorHandlerClass(
                "User updated is failed, please try again",
                400,
                "Error in user controller",
                "at checking user updated or not in resetPassword API",
                { user }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Password reset successfully",
    });
};

export {
    signUp,
    verifyEmail,
    signIn,
    signOut,
    updatedAccount,
    deletedAccount,
    getAccountData,
    updatedPassword,
    forgetPassword,
    resetPassword,
};
