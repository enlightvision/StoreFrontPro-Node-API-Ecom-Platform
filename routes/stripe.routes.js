import { Router } from "express";
import { fulfillCheckout, Payment } from "../controllers/stripe.controller.js";

const router = Router();

router.route("/create-checkout-session").post(Payment);
router.route("/verify").post(fulfillCheckout);

export default router;
