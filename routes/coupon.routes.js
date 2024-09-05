import { Router } from "express";
import {
  getCouponById,
  verifyCoupon,
} from "../controllers/coupon.controller.js";
import authentication from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authentication);

router.route("/apply/:code").get(verifyCoupon);
router.route("/:id").get(getCouponById);

export default router;
