import mongoose, { model, Schema } from "mongoose";

const schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "tbl_users" },
    productId: { type: mongoose.Types.ObjectId, required: true },
    review: { type: String, required: true, default: "" },
    rating: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const reviewModel = model("tbl_reviews", schema);
export default reviewModel;
