import Joi from "joi";

export const addOrderValidation = Joi.object({
  userId: Joi.string(),
  products: Joi.array(),
  orderStatus: Joi.string().optional(),
  address: Joi.string().optional(),
  pincode: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
  couponId: Joi.string().optional(),
});
