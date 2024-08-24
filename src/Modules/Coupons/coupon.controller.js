//# utils
import { ErrorHandlerClass } from "../../Utils/index.js";

//# models
import {
    Coupon,
    CouponChangeLog,
    User,
} from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /coupons/create (create new coupon)
*/
//! ========================================== Create Coupons ========================================== //
const createCoupon = async (req, res, next) => {
    //? destruct data from req.body
    const {
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
        couponAssignedToUsers,
        isEnable,
    } = req.body;
    //? destruct data from req.authUser
    const { _id } = req.authUser;
    //? check if userIds are exist in DB or not
    const userIds = couponAssignedToUsers.map((user) => user.userId);
    const validUsers = await User.find({ _id: { $in: userIds } });
    //? check if some userIds are not valid
    if (validUsers.length != userIds.length) {
        return next(
            new ErrorHandlerClass(
                "some userIds are not valid",
                400,
                "Error in createCoupon API",
                "at coupon controller",
                { couponAssignedToUsers }
            )
        );
    }
    //? create coupon instance
    const couponInstance = new Coupon({
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
        couponAssignedToUsers,
        createdBy: _id,
        isEnable,
    });
    //? save coupon
    const newCoupon = await couponInstance.save();
    //? send response
    res.status(201).json({
        status: "success",
        message: "Coupon created successfully",
        data: newCoupon,
    });
};

/*
@api {GET} /coupons/all (get all coupons)
*/
//! ========================================== Get All Coupons ========================================== //
const getAllCoupons = async (req, res, next) => {
    //? destruct data from req.query
    const { isEnable } = req.query; //~ >>return strings<< ~//
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? get user to destruct userType
    const { userType } = await User.findById(userId);
    const queryFilters = {};
    if (isEnable) {
        queryFilters.isEnable = isEnable === "true" ? true : false;
    }
    //? get all coupons by admin
    if (userType == "Company_ADMIN") {
        //? get all coupons
        const coupons = await Coupon.find(queryFilters);
        //? check if coupons exist
        if (!coupons.length) {
            return next(
                new ErrorHandlerClass(
                    "No coupons found",
                    404,
                    "Error in getAllCoupons API",
                    "at coupon controller"
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Coupons fetched successfully",
            data: coupons,
        });
    }
    //? get all coupons by its user
    if (userType == "User") {
        //? get all coupons by its user
        const coupons = await Coupon.find({
            ...queryFilters,
            "couponAssignedToUsers.userId": userId,
        });
        //? check if coupons exist
        if (!coupons.length) {
            return next(
                new ErrorHandlerClass(
                    "No coupons found",
                    404,
                    "Error in getAllCoupons API",
                    "at coupon controller"
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Coupons fetched successfully",
            data: coupons,
        });
    }
};

/*
@api {GET} /coupons/details/:couponId (get coupon by id)
*/
//! ===================================== Get Specific Coupon By Id ===================================== //
const getSpecificCoupon = async (req, res, next) => {
    //? destruct data from req.params
    const { couponId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? get user to destruct userType
    const { userType } = await User.findById(userId);
    //? get specific coupon by admin
    if (userType == "Company_ADMIN") {
        const coupon = await Coupon.findById({ _id: couponId });
        //? check if coupon exist
        if (!coupon) {
            return next(
                new ErrorHandlerClass(
                    "Coupon not found",
                    404,
                    "Error in getSpecificCoupon API",
                    "at coupon controller",
                    { couponId }
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Coupon fetched successfully",
            data: coupon,
        });
    }
    //? get specific coupon by its user
    if (userType == "User") {
        //? get coupon by id
        const coupon = await Coupon.find({
            _id: couponId,
            "couponAssignedToUsers.userId": userId,
        });
        //? check if coupon exist
        if (!coupon.length) {
            return next(
                new ErrorHandlerClass(
                    "Coupon not found",
                    404,
                    "Error in getSpecificCoupon API",
                    "at coupon controller",
                    { couponId }
                )
            );
        }
        //? send response
        res.status(200).json({
            status: "success",
            message: "Coupon fetched successfully",
            data: coupon,
        });
    }
};

/*
@api {PUT} /coupons/update/:couponId (update coupon)
*/
//! ========================================== Update Coupon ========================================== //
const updateCoupon = async (req, res, next) => {
    //? destruct data from req.params
    const { couponId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.body
    const {
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
        couponAssignedToUsers,
    } = req.body;
    //? update coupon
    const coupon = await Coupon.findById(couponId);
    //? check if coupon exist
    if (!coupon) {
        return next(
            new ErrorHandlerClass(
                "Coupon not found",
                404,
                "Error in updateCoupon API",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? create log change object from updated coupons
    const logUpdatedCouponObject = { couponId, updatedBy: userId, changes: {} };
    //? if update couponCode
    if (couponCode) {
        coupon.couponCode = couponCode;
        logUpdatedCouponObject.changes.couponCode = couponCode;
    }
    //? if update couponAmount
    if (couponAmount) {
        coupon.couponAmount = couponAmount;
        logUpdatedCouponObject.changes.couponAmount = couponAmount;
    }
    //? if update couponType
    if (couponType) {
        coupon.couponType = couponType;
        logUpdatedCouponObject.changes.couponType = couponType;
    }
    //? if update from
    if (from) {
        coupon.from = from;
        logUpdatedCouponObject.changes.from = from;
    }
    //? if update till
    if (till) {
        coupon.till = till;
        logUpdatedCouponObject.changes.till = till;
    }
    //? if update couponAssignedToUsers
    if (couponAssignedToUsers) {
        //? check if userIds are exist in DB or not
        const userIds = couponAssignedToUsers.map((user) => user.userId);
        const validUsers = await User.find({ _id: { $in: userIds } });
        //? check if some userIds are not valid
        if (validUsers.length != userIds.length) {
            return next(
                new ErrorHandlerClass(
                    "some userIds are not valid",
                    400,
                    "Error in updateCoupon API",
                    "at coupon controller",
                    { couponAssignedToUsers }
                )
            );
        }
        coupon.couponAssignedToUsers = couponAssignedToUsers;
        logUpdatedCouponObject.changes.couponAssignedToUsers =
            couponAssignedToUsers;
    }
    //? update coupon
    const updatedCoupon = await coupon.save();
    //? check if coupon updated or not
    if (!updatedCoupon) {
        return next(
            new ErrorHandlerClass(
                "Coupon not updated",
                400,
                "Error in updateCoupon API at saving changed",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? create coupon change log
    const log = await CouponChangeLog.create(logUpdatedCouponObject);
    //? check if log created or not
    if (!log) {
        return next(
            new ErrorHandlerClass(
                "Coupon change log not created",
                400,
                "Error in updateCoupon API at creating of log changed coupon",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Coupon updated successfully",
        couponData: updatedCoupon,
        logCouponChangeData: log,
    });
};

/*
@api {PATCH} /coupons/disable-or-enable/:couponId (disable or enable coupon)
*/
//! ===================================== Disable or Enable Coupon ===================================== //
const disableOrEnableCoupon = async (req, res, next) => {
    //? destruct data from req.params
    const { couponId } = req.params;
    //? destruct data from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.body
    const { isEnable } = req.body;
    //? update coupon
    const coupon = await Coupon.findById(couponId);
    //? check if coupon exist
    if (!coupon) {
        return next(
            new ErrorHandlerClass(
                "Coupon not found",
                404,
                "Error in updateCoupon API",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? create log change object from updated coupons
    const logUpdatedCouponObject = { couponId, updatedBy: userId, changes: {} };
    //? check if isEnable === true
    if (isEnable === true) {
        coupon.isEnable = true;
        logUpdatedCouponObject.changes.isEnable = true;
    }
    //? check if isEnable === false
    if (isEnable === false) {
        coupon.isEnable = false;
        logUpdatedCouponObject.changes.isEnable = false;
    }
    //? update coupon
    const updatedCoupon = await coupon.save();
    //? check if coupon updated or not
    if (!updatedCoupon) {
        return next(
            new ErrorHandlerClass(
                "Coupon not updated",
                400,
                "Error in updateCoupon API at saving changed",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? update coupon change log
    const log = await new CouponChangeLog(logUpdatedCouponObject).save();
    //? check if log updated or not
    if (!log) {
        return next(
            new ErrorHandlerClass(
                "Coupon change log not updated",
                400,
                "Error in updateCoupon API at updating of log changed coupon",
                "at coupon controller",
                { couponId }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Coupon updated successfully",
        couponData: updatedCoupon,
        logCouponChangeData: log,
    });
};

export {
    createCoupon,
    getAllCoupons,
    getSpecificCoupon,
    updateCoupon,
    disableOrEnableCoupon,
};
