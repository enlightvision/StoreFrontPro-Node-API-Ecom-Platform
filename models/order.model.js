import mongoose, { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    products: {
      type: [
        {
          productId: { type: mongoose.Types.ObjectId, ref: "tbl_products" },
          quantity: Number,
        },
      ],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    state: { type: String },
    couponId: { type: mongoose.Types.ObjectId },
    orderStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "shipped", "order-in-route", "order-delivered"],
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["paid", "unpaid", "pending"],
    },
    paymentMethods: {
      type: String,
      default: "cod",
      enum: ["stripe", "cod"],
    },
  },
  { timestamps: true }
);

const orderModel = model("tbl_orders", orderSchema);
export default orderModel;
