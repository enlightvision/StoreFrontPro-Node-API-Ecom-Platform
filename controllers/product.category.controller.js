import {
  INTERNAL_SERVER_ERROR,
  SOMTHING_WENT_WRONG,
  SUCCESS,
} from "../constant.js";
import productCategoryModel from "../models/product.category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BAD_REQUEST, INTERNAL_SERVER, OK } from "../utils/httpStatusCode.js";
import { productCategoryValidation } from "../validation/product.category.validation.js";

export const addProductCategory = async (req, res) => {
  try {
    const validation = productCategoryValidation.validate(req.body);

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const result = await productCategoryModel.create(req.body);

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res.status(OK).json(new ApiResponse(OK, SUCCESS));
  } catch (error) {
    console.log(error);

    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
};

export const getProductCategory = async (req, res) => {
  try {
    const result = await productCategoryModel.find();

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res.status(OK).json(new ApiResponse(OK, SUCCESS, result));
  } catch (error) {
    console.log(error);

    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
};

export const deleteProductCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Id is required"));
    }

    const result = await productCategoryModel.deleteOne({ _id: id });

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res.status(OK).json(new ApiResponse(OK, SUCCESS));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
};
