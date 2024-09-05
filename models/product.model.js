import mongoose from "mongoose";

const Schema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    title: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    // category: { type: mongoose.Types.ObjectId, required: true, ref: "tbl_productcategory" },
    category: { type: String, required: true },
    stoke: { type: Number, required: true },
    images: { type: Array, required: true },
    descriptions: { type: String },
    rating: { type: String, default: 0 },
  },
  { timestamps: true }
);
const productModel = mongoose.model("tbl_products", Schema);
export default productModel;
