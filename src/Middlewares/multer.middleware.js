//# dependencies
import multer from "multer";
import fs from "fs";
import path from "path";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

//# utils
import { extensions, ErrorHandlerClass } from "../Utils/index.js";

//! ========================================== Local Middleware ==========================================//
const multerLocalMiddleware = ({
    filePath = "general",
    allowedExtensions = extensions.IMAGE_EXTENSIONS,
}) => {
    //? disk storage engine
    const destinationPath = path.resolve(`src/uploads/${filePath}`);
    //? check if the folder exist
    if (!fs.existsSync(destinationPath)) {
        //? create the folder
        fs.mkdirSync(destinationPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        //? destination
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        //? filename
        filename: function (req, file, cb) {
            //? create a unique name
            const uniqueFileName =
                DateTime.now().toFormat("yyyy-MM-dd") +
                "_" +
                nanoid(4) +
                "_" +
                file.originalname;
            //? set the file name
            cb(null, uniqueFileName);
        },
    });
    //? file filter
    const fileFilter = (req, file, cb) => {
        //? check if the file has the allowed extensions
        if (allowedExtensions?.includes(file.mimetype)) {
            //?accept the file
            return cb(null, true);
        }
        //? reject the file
        cb(new ErrorHandlerClass("File type not allowed", 400), false);
    };
    return multer({ fileFilter, storage });
};

//! ========================================== Host Middleware ==========================================//
const multerHostMiddleware = ({
    allowedExtensions = extensions.IMAGE_EXTENSIONS,
}) => {
    const storage = multer.diskStorage({
        filename: function (req, file, cb) {
            //? create a unique name
            const uniqueFileName =
                DateTime.now().toFormat("yyyy-MM-dd") +
                "_" +
                nanoid(4) +
                "_" +
                file.originalname;
            //? set the file name
            cb(null, uniqueFileName);
        },
    });
    //? file filter
    const fileFilter = (req, file, cb) => {
        //? check if the file has the allowed extensions
        if (allowedExtensions?.includes(file.mimetype)) {
            //? accept the file
            return cb(null, true);
        }
        //? reject the file
        cb(new ErrorHandlerClass("File type not allowed", 400), false);
    };
    return multer({ fileFilter, storage });
};

export { multerLocalMiddleware, multerHostMiddleware };
