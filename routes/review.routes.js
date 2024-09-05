import { Router } from "express";
import {
  addReview,
  getReviewByProductId,
} from "../controllers/review.controller.js";

const router = Router();

router.route("/").post(addReview);
router.route("/:productId").get(getReviewByProductId);

export default router;
