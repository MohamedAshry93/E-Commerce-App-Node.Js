import axios from "axios";

//# utils
import { ErrorHandlerClass } from "../../Utils/index.js";

//# models
import { Address } from "../../../database/Models/index.js";

//# APIS
/*
@api {POST} /addresses/add-address (add new address)
*/
//! ========================================== Add Address ========================================== //
const addAddress = async (req, res, next) => {
    //? destruct data from req.body
    const {
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        setAsDefault,
    } = req.body;
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
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
        userId,
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
    });
    //? check if address is default
    if (setAsDefault) {
        //? update all default addresses
        await Address.updateOne(
            { userId, isDefault: true },
            { $set: { isDefault: false } }
        );
    }
    //? save address
    const newAddress = await addressInstance.save();
    //? check if new address saved in DB or not
    if (!newAddress) {
        return next(
            new ErrorHandlerClass(
                "Address not saved, please try again",
                500,
                "Error in addAddress API",
                "at Address controller",
                { addressInstance }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Address added successfully",
        data: newAddress,
    });
};

/*
@api {PUT} /addresses/edit/:addressId (edit address by id)
*/
//! ========================================== Edit Address ==========================================//
const editAddress = async (req, res, next) => {
    //? destruct id from req.params
    const { addressId } = req.params;
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? destruct data from req.body
    const {
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        setAsDefault,
    } = req.body;
    //? check if address exists in DB or not
    const address = await Address.findOne({
        _id: addressId,
        userId,
        isMarkedAsDeleted: false,
    });
    if (!address) {
        return next(
            new ErrorHandlerClass(
                "Address not found",
                404,
                "Error in editAddress API",
                "at Address controller",
                { addressId }
            )
        );
    }
    //? if updated country
    if (country) {
        //? create cities and countries validation api
        const region = await axios.get(
            `https://api.api-ninjas.com/v1/city?country=${country}`,
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
                    "Country not found please check your region and enter a valid country name (country must be an ISO-3166 alpha-2 country code (e.g. US))",
                    404,
                    "Error in addAddress API",
                    "at Address controller",
                    { country }
                )
            );
        }
        address.country = country;
    }
    //? if updated city
    if (city) {
        //? create cities and countries validation api
        const region = await axios.get(
            `https://api.api-ninjas.com/v1/city?name=${city}`,
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
                    "City not found please check your region and enter a valid city name",
                    404,
                    "Error in addAddress API",
                    "at Address controller",
                    { city }
                )
            );
        }
        address.city = city;
    }
    //? if updated postalCode
    if (postalCode) address.postalCode = postalCode;
    //? if updated buildingNumber
    if (buildingNumber) address.buildingNumber = buildingNumber;
    //? if updated floorNumber
    if (floorNumber) address.floorNumber = floorNumber;
    //? if updated addressLabel
    if (addressLabel) address.addressLabel = addressLabel;
    //? check if updated address is default
    const checkIsDefaultBoolean = [true, false].includes(setAsDefault);
    if (checkIsDefaultBoolean) {
        address.isDefault = checkIsDefaultBoolean ? setAsDefault : false;
        //? if change address to default change other default addresses
        await Address.updateOne(
            { userId, isDefault: true },
            { $set: { isDefault: false } }
        );
    }
    //? save address
    const updatedAddress = await address.save();
    //? check if updated address saved in DB or not
    if (!updatedAddress) {
        return next(
            new ErrorHandlerClass(
                "Address not updated, please try again",
                500,
                "Error in editAddress API",
                "at Address controller",
                { updatedAddress }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Address updated successfully",
        data: updatedAddress,
    });
};

/*
@api {PUT} /addresses/soft-delete/:addressId (soft delete address by id)
*/
//! ========================================== Soft Delete Address ==========================================//
const removeAddress = async (req, res, next) => {
    //? destruct id from req.params
    const { addressId } = req.params;
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? check if address exists in DB or not
    const address = await Address.findOne({
        _id: addressId,
        userId,
        isMarkedAsDeleted: false,
    });
    if (!address) {
        return next(
            new ErrorHandlerClass(
                "Address not found",
                404,
                "Error in removeAddress API",
                "at Address controller",
                { addressId }
            )
        );
    }
    //? update isMarkedAsDeleted to true
    address.isMarkedAsDeleted = true;
    //? update is default to false
    address.isDefault = false;
    //? update deletedAt after 30 days
    address.deletedAt = Date.now() + 2592000000;
    //? save address
    const savedAddress = await address.save();
    //? check if address saved in DB or not
    if (!savedAddress) {
        return next(
            new ErrorHandlerClass(
                "Address not removed, please try again",
                400,
                "Error in removeAddress API",
                "at Address controller",
                { address }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message:
            "Address removed successfully, you can recover your address within 30 days",
        data: savedAddress,
    });
};

/*
@api {PUT} /addresses/recover-address/:addressId (recovering address by id)
*/
//! ========================================== Recovering Address ==========================================//
const recoverAddress = async (req, res, next) => {
    //? destruct id from req.params
    const { addressId } = req.params;
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? check if address exists in DB or not
    const address = await Address.findOne({
        _id: addressId,
        userId,
        isMarkedAsDeleted: true,
        deletedAt: { $gt: Date.now() },
    });
    if (!address) {
        return next(
            new ErrorHandlerClass(
                "Address not found",
                404,
                "Error in recoverAddress API",
                "at Address controller",
                { addressId }
            )
        );
    }
    //? update isMarkedAsDeleted to false
    address.isMarkedAsDeleted = false;
    //? remove deletedAt
    address.deletedAt = undefined;
    //? save address
    const savedAddress = await address.save();
    //? check if address saved in DB or not
    if (!savedAddress) {
        return next(
            new ErrorHandlerClass(
                "Address not recovered, please try again",
                400,
                "Error in recoverAddress API",
                "at Address controller",
                { address }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Address recovered successfully",
        data: savedAddress,
    });
};

/*
@api {GET} /addresses/user-addresses
*/
//! ========================================== Get all User addresses ========================================== //
const getAllUserAddresses = async (req, res, next) => {
    //? destruct userId from req.authUser
    const userId = req.authUser._id;
    //? find all addresses
    const addresses = await Address.find({ userId, isMarkedAsDeleted: false });
    //? check if addresses exists
    if (!addresses.length) {
        return next(
            new ErrorHandlerClass(
                "Addresses not found",
                404,
                "Error in getAllUserAddresses API",
                "at Address controller",
                { addresses }
            )
        );
    }
    //? send response
    res.status(200).json({
        status: "success",
        message: "Addresses found successfully",
        data: addresses,
    });
};

export {
    addAddress,
    editAddress,
    removeAddress,
    recoverAddress,
    getAllUserAddresses,
};
