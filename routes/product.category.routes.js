import { Router } from "express";
import authentication from "../middlewares/auth.middleware.js";
import {
  addProductCategory,
  deleteProductCategory,
  getProductCategory,
} from "../controllers/product.category.controller.js";

const router = Router();

router.use(authentication);

router.route("/").post(addProductCategory);
router.route("/").get(getProductCategory);
router.route("/:id").delete(deleteProductCategory);

export default router;
