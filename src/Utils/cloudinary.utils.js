import { v2 as cloudinary } from "cloudinary";

//# utils
import { ErrorHandlerClass } from "./index.js";

//! ================================ Cloudinary Config ================================ //
const cloudinaryConfig = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    return cloudinary;
};

/*
@param {file, use_filename, resource_type, tags}
@param {String} folder
@returns {Object}
@description Uploads a file to cloudinary
*/
//! ================================ Upload New File to Cloudinary ================================ //
const uploadNewFile = async ({
    file,
    folder = "General",
    use_filename,
    resource_type,
    tags,
    next,
}) => {
    if (!file) {
        return next(
            new ErrorHandlerClass(
                "Please upload an image",
                400,
                "Error in uploadFile API",
                "at uploadFile utils",
                { file }
            )
        );
    }
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        file,
        {
            folder,
            use_filename,
            resource_type,
            tags,
        }
    );
    return { secure_url, public_id };
};

/*
@param {old_public_id, file, use_filename, resource_type, tags}
@param {String} folder
@returns {Object}
@description Uploads a file to cloudinary
*/
//! ================================ Update Exist File on Cloudinary ================================ //
const uploadUpdatedFile = async ({
    old_public_id,
    file,
    folder = "General",
    use_filename,
    resource_type,
    tags,
    next,
}) => {
    if (!file) {
        return next(
            new ErrorHandlerClass(
                "Please upload an image",
                400,
                "Error in uploadUpdatedFile API",
                "at uploadUpdatedFile utils",
                { file }
            )
        );
    }
    if (!old_public_id) {
        return next(
            new ErrorHandlerClass(
                "Please provide old_public_id",
                400,
                "Error in uploadUpdatedFile API",
                "at uploadUpdatedFile utils",
                { old_public_id }
            )
        );
    }
    //? delete old image on cloudinary
    const deletedImage = await cloudinaryConfig().uploader.destroy(old_public_id);
    if (deletedImage.result == "not found") {
        return next(
            new ErrorHandlerClass(
                "Old image not found",
                400,
                "Error in uploadUpdatedFile API",
                "at uploadUpdatedFile utils",
                { old_public_id }
            )
        );
    }
    //? upload new image on cloudinary
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        file,
        {
            folder,
            use_filename,
            resource_type,
            tags,
        }
    );
    return { secure_url, public_id };
};

export { cloudinaryConfig, uploadNewFile, uploadUpdatedFile };
