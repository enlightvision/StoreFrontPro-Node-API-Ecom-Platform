import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // firstName: { type: String, required: [true, "firstName is required"] },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    // password: { type: String, require: true, select: false },
    avatar: { type: String, default: "" },
    address: { type: String, default: "" },
    wishlist: { type: Array, default: [] },
    provider: { type: String, default: "" },
    refreshToken: { type: String, require: true },
    facebookProvider: { type: { id: String, token: String }, select: false },
    googleProvider: { type: { id: String, token: String }, select: false },
    isAdmin: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

const userModel = mongoose.model("tbl_users", userSchema);
export default userModel;
