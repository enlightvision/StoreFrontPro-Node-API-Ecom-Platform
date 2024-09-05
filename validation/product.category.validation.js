import Joi from "joi";
export const productCategoryValidation = Joi.object({
    category: Joi.string().required()
})