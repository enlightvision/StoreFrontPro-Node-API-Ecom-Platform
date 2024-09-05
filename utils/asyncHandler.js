const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export { asyncHandler };








// import { INTERNAL_SERVER } from "./httpStatusCode.js";
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     return res
//       .status(error.code || INTERNAL_SERVER)
//       .json({ status: false, message: INTERNAL_SERVER, error: error.message });
//   }
// };
