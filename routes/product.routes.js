import { Router } from "express";
import fileUpload from "express-fileupload";
import authentication from "../middlewares/auth.middleware.js";
import {
  addProduct,
  getBrandAndCategoryFilter,
  getCartProducts,
  getProductById,
  getProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.use(fileUpload({ limits: { fileSize: 50 * 1024 } }));

router.use(authentication);
router.route("/all").post(getProducts);
router.route("/product-brands-category").get(getBrandAndCategoryFilter);
router.route("/:_id").get(getProductById);
router.route("/cartproducts").post(getCartProducts);
router.route("/").post(addProduct);

export default router;
