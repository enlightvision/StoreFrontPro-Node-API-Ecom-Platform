import express from "express";
import passport from "passport";
import {
  deleteProductInWishlist,
  loginUser,
  registerUser,
  updatedWhishlist,
  updateUserProfile,
} from "../controllers/user.controller.js";
import {
  generateAccessTokenAndRefreshToken,
  refreshAccessToken,
} from "../controllers/usertoken.controller.js";
import fileUpload from "express-fileupload";
import authentication from "../middlewares/auth.middleware.js";
import { OK, UNAUTHORIZED } from "../utils/httpStatusCode.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SUCCESS } from "../constant.js";
import userModel from "../models/user.model.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Google Auth Routes
router
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["email", "profile"] }));

router.route("/auth/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/api/v1/user/login/failed",
  }),
  async (req, res) => {
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(req.user._id);
    await userModel.updateOne({ _id: req.user._id }, { refreshToken });

    res.redirect(
      `${process.env.APP_URL}?user=${encodeURIComponent(JSON.stringify(req.user))}&accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

router.route("/login/failed").get((req, res) => {
  console.log("Login Faild");
  res
    .status(UNAUTHORIZED)
    .json(new ApiResponse(UNAUTHORIZED, "Log in failure"));
});

router.route("/login/success").get((req, res) => {
  console.log("Login SUCCESS");
  res.status(OK).json(new ApiResponse(OK, SUCCESS));
});

router.route("/logout").get((req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(process.env.APP_URL);
  });
});

// Facebook Authentication Route
router.route("/auth/facebook").get(
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"], // Request email permission
  })
);

// Facebook Callback Route
router.route("/auth/facebook/callback").get(
  passport.authenticate("facebook", {
    failureRedirect: "/api/v1/user/login/failed",
  }),
  async (req, res) => {
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(req.user._id);
    await userModel.updateOne({ _id: req.user._id }, { refreshToken });
    res.redirect(
      `${process.env.APP_URL}?user=${encodeURIComponent(JSON.stringify(req.user))}&accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);
router.use(fileUpload());
router.route("/").patch(authentication, updateUserProfile);
router.route("/whishlist").put(authentication, updatedWhishlist);
router.route("/whishlist").delete(authentication, deleteProductInWishlist);

export default router;
