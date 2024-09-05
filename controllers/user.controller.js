import bcrypt from "bcrypt";
import { generateAccessTokenAndRefreshToken } from "./usertoken.controller.js";
import {
  EMAIL_ALREADY_EXIST,
  fileUpload,
  INTERNAL_SERVER_ERROR,
  PASSWORD_NOT_MATCH,
  SOMTHING_WENT_WRONG,
  SUCCESS,
  USER_DOES_NOT_EXIST,
  USER_REGISTERED_SUCCESSFULLY,
} from "../constant.js";
import {
  validateUpdateUser,
  validateUser,
  validateWhishlistData,
} from "../validation/user.validation.js";
import userModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BAD_REQUEST, INTERNAL_SERVER, OK } from "../utils/httpStatusCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { password, email } = req.body;
    const validation = await validateUser({ ...req.body, type: "Register" });

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const existedUser = await userModel.findOne({ email });
    if (existedUser) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, EMAIL_ALREADY_EXIST));
    }

    const EncodePassword = await bcrypt.hash(password, 8);
    let result = await userModel.create({
      ...req.body,
      password: EncodePassword,
    });

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
    }

    return res
      .status(OK)
      .json(new ApiResponse(OK, USER_REGISTERED_SUCCESSFULLY, result));
  } catch (error) {
    console.log(error);
    return res
      .status(INTERNAL_SERVER)
      .json(new ApiResponse(INTERNAL_SERVER, INTERNAL_SERVER_ERROR, {}, error));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = validateUser({ ...req.body, type: "Login" });

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    let result;

    if (req.query.role === "admin") {
      result = await userModel
        .findOne({ email: email, isAdmin: true })
        .select([
          "isAdmin",
          "firstName",
          "lastName",
          "email",
          "password",
          "avatar",
          "address",
        ]);
    } else {
      result = await userModel.findOne({ email: email, isAdmin: false });
    }

    if (!result) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, USER_DOES_NOT_EXIST));
    }
    const verify = await bcrypt.compare(password, result.password);

    if (!verify) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, PASSWORD_NOT_MATCH));
    }

    result = result.toObject();
    delete result.password;
    delete result.refreshToken;

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(result._id);

    return res
      .status(OK)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(OK, SUCCESS, { result, accessToken, refreshToken })
      );
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

const loginWithGoogle = asyncHandler(async (req, res) => {
  try {
  } catch (error) {}
});

const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.body;

    const avatar = req.files?.avatar;

    const validatation = validateUpdateUser(req.body);

    if (validatation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validatation.error.message));
    }

    if (!avatar) {
      const result = await userModel.findOneAndUpdate({ _id }, req.body, {
        new: true,
      });

      if (!result) {
        return res
          .status(BAD_REQUEST)
          .json(new ApiResponse(BAD_REQUEST, SOMTHING_WENT_WRONG));
      }

      return res.status(OK).json(new ApiResponse(OK, SUCCESS, result));
    }

    if (!avatar.mimetype.includes("image")) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Only Image Format Is Allowed"));
    }

    const avatarUrl = await fileUpload(avatar, "UsersProfile");
    let id = _id;
    delete req.body._id;

    const result = await userModel
      .findOneAndUpdate(
        { _id: id },
        { ...req.body, avatar: avatarUrl[0] },
        { upsert: true, new: true }
      )
      .select(["-password", "-isAdmin"]);

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

const updatedWhishlist = asyncHandler(async (req, res) => {
  try {
    const validate = validateWhishlistData(req.body);

    if (validate.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validate.error.message));
    }

    const { userId, productId } = req.body;

    const result = await userModel
      .findOneAndUpdate(
        { _id: userId },
        { $addToSet: { wishlist: productId } },
        { new: true }
      )
      .select(["-password", "-isAdmin"]);

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

const deleteProductInWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId, userId } = req.query;
    if (!productId || !userId) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "Ids is required"));
    }

    const result = await userModel
      .findOneAndUpdate(
        { _id: userId },
        { $pull: { wishlist: productId } },
        { new: true }
      )
      .select(["-password", "-isAdmin"]);

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

export {
  registerUser,
  loginUser,
  updateUserProfile,
  updatedWhishlist,
  deleteProductInWishlist,
  loginWithGoogle,
};
