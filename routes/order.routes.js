import { Router } from "express";
import { addOrder, getOrderbyUserId } from "../controllers/order.controller.js";

const router = Router();

router.route("/").post(addOrder);
router.route("/user/:userId").get(getOrderbyUserId);

export default router;
