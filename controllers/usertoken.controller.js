import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { BAD_REQUEST, INTERNAL_SERVER, OK } from "../utils/httpStatusCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { INTERNAL_SERVER_ERROR, USER_DOES_NOT_EXIST } from "../constant.js";

export const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const accessToken = await generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);

    await userModel.updateOne({ _id: userId }, { refreshToken: refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      INTERNAL_SERVER,
      "Something went wrong while generating referesh and access token",
      {},
      error.message
    );
  }
};
const generateAccessToken = async (userId) => {
  return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = async (userId) => {
  return jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    let token = req.cookie?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "refresh token is not provided"));
    }

    token = token.split(" ")[1];

    const decodeToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (!decodeToken) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, "invalid token"));
    }

    const user = await userModel.findOne({ _id: decodeToken.userId });

    if (!user) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, USER_DOES_NOT_EXIST));
    }

    // if (token !== user?.refreshToken) return res.status(400).json({ message: "refresh token is expired" })

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(decodeToken.userId);
    return res
      .status(OK)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(OK, "Access token refreshed", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    console.log(error);

    return res.status(
      INTERNAL_SERVER,
      INTERNAL_SERVER_ERROR,
      {},
      error.message
    );
  }
});
