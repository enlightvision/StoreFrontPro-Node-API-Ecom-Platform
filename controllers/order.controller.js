import {
  INTERNAL_SERVER_ERROR,
  SOMTHING_WENT_WRONG,
  SUCCESS,
} from "../constant.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BAD_REQUEST, INTERNAL_SERVER, OK } from "../utils/httpStatusCode.js";
import { addOrderValidation } from "../validation/order.validation.js";
import couponModel from "../models/coupon.model.js";

const addOrder = asyncHandler(async (req, res) => {
  try {
    const validate = addOrderValidation.validate(req.body);

    if (validate.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validate.error.message));
    }

    const { products, couponId } = req.body;

    const productIds = products.map((x) => x.productId);

    const productsPrices = await productModel
      .find({ _id: { $in: productIds } })
      .select("price");

    let totalAmount = 0;

    products.forEach((x) => {
      const product = productsPrices.find((y) => x.productId == y._id);
      if (product) {
        totalAmount += x.quantity * product.price;
      }
    });

    if (couponId) {
      const expireCoupon = await couponModel.findOneAndUpdate(
        {
          _id: couponId,
        },
        { isActive: false, isExpire: true }
      );

      if (!expireCoupon || !expireCoupon.isActive) {
        return res
          .status(BAD_REQUEST)
          .json(new ApiResponse(BAD_REQUEST, "Invalid Coupon"));
      }

      if (expireCoupon.discountType == "amount") {
        totalAmount -= expireCoupon.discount;
      } else {
        totalAmount = (totalAmount * (100 - expireCoupon.discount)) / 100;
      }
    }

    const result = couponId
      ? await orderModel.create({ ...req.body, totalAmount, couponId })
      : await orderModel.create({ ...req.body, totalAmount });

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
});

const getOrderbyUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "User id is required"));
    }

    const result = await orderModel
      .find({ userId })
      .populate("products.productId");

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

export { addOrder, getOrderbyUserId };
