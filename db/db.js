import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI)
    console.log("Db is connected HOST : " + db.connection.host);
  } catch (error) {
    console.log(error);
    console.log("Db is Disconnected");
  }
};
export default connectDB;
