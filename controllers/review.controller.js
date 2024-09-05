import {
  SOMTHING_WENT_WRONG,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
} from "../constant.js";
import productModel from "../models/product.model.js";
import reviewModel from "../models/reviews.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  BAD_REQUEST,
  OK,
  INTERNAL_SERVER,
  NOT_FOUND,
} from "../utils/httpStatusCode.js";
import { reviewValidation } from "../validation/review.validation.js";

const addReview = async (req, res) => {
  try {
    const validation = reviewValidation.validate(req.body);

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const { userId, productId } = req.body;

    const isReview = await reviewModel.findOne({ userId, productId });

    if (isReview) {
      return res
        .status(BAD_REQUEST)
        .json(
          new ApiResponse(
            BAD_REQUEST,
            "User Already share review on this product"
          )
        );
    }

    const result = await reviewModel.create(req.body);

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    const ratings = await reviewModel.find({ productId }).select("rating");

    let tmp = 0;
    ratings.forEach((x) => {
      tmp += x.rating;
    });

    let calculateRating = Math.round(tmp / ratings.length);

    await productModel.updateOne(
      { _id: productId },
      { rating: calculateRating }
    );

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

const getReviewByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "productId is not provider"));
    }

    const result = await reviewModel.find({ productId }).populate([
      {
        path: "userId",
        select: ["firstName", "lastName", "avatar"],
      },
    ]);

    if (!result) {
      return res
        .status(NOT_FOUND)
        .json(new ApiResponse(NOT_FOUND, "No review exist"));
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

export { addReview, getReviewByProductId };
