import Joi from "joi";

const validator = (schema) => (payload) =>
  // schema.tailor('put').validate(payload)
  schema.tailor("put").validate(payload, { abortEarly: false });
const userSchema = Joi.object({
  type: Joi.string()
    .valid("Login", "Register")
    .alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.optional(),
    }),
  email: Joi.string()
    .when("type", {
      is: "Login",
      then: Joi.required(),
      otherwise: Joi.required(),
    })
    .email()
    .alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.optional(),
    }),
  password: Joi.string()
    .when("type", {
      is: "Login",
      then: Joi.required(),
      otherwise: Joi.required(),
    })
    .alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.optional(),
    }),
  firstName: Joi.string()
    .when("type", {
      is: "Register",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.optional(),
    }),
  lastName: Joi.string()
    .when("type", {
      is: "Register",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .alter({
      post: (schema) => schema.required(),
      put: (schema) => schema.optional(),
    }),
});

const updateUserSchema = Joi.object({
  _id: Joi.string().required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  address: Joi.string(),
});

const upadateWhishlistSchmea = Joi.object({
  userId: Joi.string().required(),
  productId: Joi.string().required(),
});

export const validateUser = validator(userSchema);
export const validateUpdateUser = validator(updateUserSchema);
export const validateWhishlistData = validator(upadateWhishlistSchmea);

// export const validateUser = Joi.object({
//     type: Joi.string().valid('Login', 'Register').required(),
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     firstName: Joi.alternatives().conditional('type', {
//         is: 'Register',
//         then: Joi.string().required(),
//         otherwise: Joi.forbidden()
//     }),
//     lastName: Joi.alternatives().conditional('type', {
//         is: 'Register',
//         then: Joi.string().required(),
//         otherwise: Joi.forbidden()
//     }),
// });
