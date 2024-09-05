import { model, Schema } from "mongoose";

const schema = new Schema({
  category: { type: String, required: true },
});
const productCategoryModel = model("tbl_productcategory", schema);
export default productCategoryModel;
