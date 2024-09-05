import { INTERNAL_SERVER_ERROR } from "../constant.js";
import { ApiResponse } from "./ApiResponse.js";
import { INTERNAL_SERVER } from "./httpStatusCode.js";

const errorHandler = (err, req, res, next) => {
  res
    .status(err.status || INTERNAL_SERVER)
    .json(
      new ApiResponse(INTERNAL_SERVER, INTERNAL_SERVER_ERROR, {}, err.message)
    );
};

export { errorHandler };
