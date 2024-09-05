import { INTERNAL_SERVER_ERROR, SUCCESS } from "../constant.js";
import couponModel from "../models/coupon.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  BAD_REQUEST,
  INTERNAL_SERVER,
  NOT_FOUND,
  OK,
} from "../utils/httpStatusCode.js";

function coupongenerator() {
  var coupon = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    coupon += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return coupon.toUpperCase();
}

const addCoupons = asyncHandler(async (req, res) => {
  try {
    const code = coupongenerator();
    let date = new Date();
    var newDate = new Date(date.setMonth(date.getMonth() + 2));
    const result = await couponModel.create({
      code,
      discount: 90,
      expiryDate: newDate,
      discountType: "percent",
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
});

const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Id is not provided!"));
    }

    const result = await couponModel.findOne({ _id: id });

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(NOT_FOUND, "Invalid Coupon id"));
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

const verifyCoupon = asyncHandler(async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Code Is required"));
    }

    const result = await couponModel.findOne({ code });

    if (!result || !result.isActive) {
      return res
        .status(NOT_FOUND)
        .json(new ApiResponse(NOT_FOUND, "Invalid Coupon"));
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
});

export { addCoupons, verifyCoupon, getCouponById };
