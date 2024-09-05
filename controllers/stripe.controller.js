import Stripe from "stripe";
import {
  BAD_REQUEST,
  INTERNAL_SERVER,
  NOT_FOUND,
  OK,
} from "../utils/httpStatusCode.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import productModel from "../models/product.model.js";
import { makePaymentValidation } from "../validation/stripe.validation.js";
import orderModel from "../models/order.model.js";
import { INTERNAL_SERVER_ERROR, SUCCESS } from "../constant.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Payment = async (req, res) => {
  try {
    const { data } = req.body;

    const validation = makePaymentValidation.validate(req.body);

    if (validation.error) {
      return res
        .status(BAD_REQUEST)
        .json(new ApiResponse(BAD_REQUEST, validation.error.message));
    }

    const productIds = data.map((x) => x.productId);

    const products = await productModel
      .find({ _id: { $in: productIds } })
      .lean();

    const lineItems = products.map((x) => {
      const product = data.find((y) => y.productId == x._id);
      if (product) {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: x.title,
              // images: [`${process.env.SERVER_URL + x.images[0]}`],
            },
            unit_amount: Math.round(x.price * 100),
          },
          quantity: product.quantity,
        };
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.APP_URL}/order-placed-success?success=true`,
      cancel_url: `${process.env.APP_URL}/payment?canceled=true`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error processing payment:", error);

    let message = "An error occurred while processing your payment.";

    if (error.type === "StripeCardError") {
      message = error.message;
    }

    res.status(INTERNAL_SERVER).json(new ApiResponse(INTERNAL_SERVER, message));
  }
};
const fulfillCheckout = async (req, res) => {
  const { sessionId, orderId } = req.body;

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (checkoutSession.payment_status === "paid") {
      const order = await orderModel.findOneAndUpdate(
        { _id: orderId },
        {
          paymentStatus: "paid",
          paymentMethods: "stripe",
        }
      );

      if (!order) {
        return res
          .status(NOT_FOUND)
          .json(new ApiResponse(NOT_FOUND, "Order is not found"));
      }
      // const updateProduct = order.products.map(
      //   async (x) =>
      //     await productModel.updateOne(
      //       { _id: x.productId },
      //       { $inc: { stoke: -x.quantity } }
      //     )
      // );
      const productUpdates = order.products.map((product) => ({
        updateOne: {
          filter: { _id: product.productId },
          update: { stock: -product.quantity },
        },
      }));
      const products = await productModel.bulkWrite(productUpdates);
      return res.json(new ApiResponse(OK, SUCCESS));
    } else {
      return res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error fulfilling checkout:", error);
    return res
      .status(INTERNAL_SERVER)
      .json(
        new ApiResponse(
          INTERNAL_SERVER,
          INTERNAL_SERVER_ERROR,
          {},
          error.message
        )
      );
  }
};

export { Payment, fulfillCheckout };
