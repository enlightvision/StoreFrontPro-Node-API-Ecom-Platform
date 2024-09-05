import Joi from "joi";

export const reviewValidation = Joi.object({
  userId: Joi.string().required(),
  productId: Joi.string().required(),
  review: Joi.string().required(),
  rating: Joi.number().required(),
});
