import Joi from "joi";

export const productValidation = Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  stoke: Joi.string().required(),
  // images: Joi.object(),
  descriptions: Joi.string(),
  brand: Joi.string(),
});

export const getproductSchema = Joi.object({
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().optional(),
  sort: Joi.string().optional(),
  fields: Joi.string().optional(),
  search: Joi.string().optional(),
  category: Joi.array().items(Joi.string()).optional(),
  brands: Joi.array().items(Joi.string()).optional(),
  price: Joi.string()
    // .pattern(/^\d+-\d+$/)
    .optional(), // Pattern for price range "min-max"
  rating: Joi.number().optional(),
});

export const getCartsProductsSchema = Joi.object({
  productsIds: Joi.array().min(1),
});
