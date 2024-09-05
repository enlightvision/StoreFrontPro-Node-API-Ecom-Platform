import express from "express";
import connectDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRouter from "./routes/product.routes.js";
import productCategoryRouter from "./routes/product.category.routes.js";
import userRouter from "./routes/user.routes.js";
import orderRouter from "./routes/order.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import paymentRouter from "./routes/stripe.routes.js";
import reviewRouter from "./routes/review.routes.js";
import { errorHandler } from "./utils/errorHandler.js";
import passport from "passport";
import session from "express-session";
import "./utils/passportConfig.js";
import "newrelic";
// import RedisStore from "connect-redis";
// import redis from "redis";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// // Connect to MongoDB
import MongoStore from "connect-mongo";
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    secret: process.env.SESSION_SECRET || "your-default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379",
// });
// redisClient.on("error", (err) => console.error("Redis error:", err));
// app.use(
//   session({
//     store: new RedisStore({ client: redisClient }),
//     secret: process.env.SESSION_SECRET || "your-default-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       sameSite: "lax",
//     },
//   })
// );

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/uploads", express.static("./uploads"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/product-category", productCategoryRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `⚙️  Server is running at port : ${process.env.PORT || 8000}`
      );
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
