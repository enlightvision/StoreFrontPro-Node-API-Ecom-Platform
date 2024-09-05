import Joi from "joi";

const makePaymentValidation = Joi.object({
  data: Joi.array().required(),
});

export { makePaymentValidation };
