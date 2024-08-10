//# utils
import { ErrorHandlerClass } from "../Utils/index.js";

//! ===================================== Check Model by Name ===================================== //
const modelNameExist = (model) => {
    return async (req, res, next) => {
        //? destruct data from req.body
        const { name } = req.body;
        if (name) {
            //? find model by name
            const data = await model.findOne({ name });
            //? check if name exists in database
            if (data) {
                return next(
                    new ErrorHandlerClass(
                        `${model.modelName} name already exist`,
                        400,
                        "Error in modelNameExist API",
                        "at checkData middleware",
                        { name }
                    )
                );
            }
        }
        next();
    };
};

//! ===================================== Check Model by Ids ===================================== //
const checkIdsExist = (model) => {
    return async (req, res, next) => {
        //? destruct categoryId, subCategoryId and brandId from req.query
        const { categoryId, subCategoryId, brandId } = req.query;
        //? check Ids
        const brandDocument = await model
            .findOne({
                _id: brandId,
                categoryId,
                subCategoryId,
            })
            .populate([
                { path: "categoryId", select: "customId" },
                { path: "subCategoryId", select: "customId" },
            ]);
        //? check if brandDocument exists in database
        if (!brandDocument) {
            return next(
                new ErrorHandlerClass(
                    `${model.modelName} not found`,
                    404,
                    "Error in checkIdsExist API",
                    "at checkData middleware",
                    { categoryId, subCategoryId, brandId }
                )
            );
        }
        req.document = brandDocument;
        next();
    };
};

export { modelNameExist, checkIdsExist };
