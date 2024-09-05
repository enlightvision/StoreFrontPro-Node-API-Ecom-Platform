import { model, Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, requried: true, unique: true },
    discount: { type: Number, requried: true },
    discountType: { type: String, requried: true },
    isActive: { type: Boolean, default: true },
    isExpire: { type: Boolean, default: false },
    // isOneTime: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const couponModel = model("tbl_coupons", couponSchema);
export default couponModel;
