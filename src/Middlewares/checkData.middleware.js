import { ErrorHandlerClass } from "../Utils/error-class.utils.js";

//! ===================================== Check Model by Name ===================================== //
const modelNameExist = (model) => {
    return async (req, res, next) => {
        //? find model by name
        const { name } = req.body;
        if (name) {
            const data = await model.findOne({ name });
            //? check if name exists in database
            if (data) {
                return next(
                    new ErrorHandlerClass(
                        `${model.modelName} name already exist`,
                        400,
                        "Error in modelNameExist API",
                        "at modelNameExist middleware",
                        { name }
                    )
                );
            }
        }
        next();
    };
};

export { modelNameExist };
