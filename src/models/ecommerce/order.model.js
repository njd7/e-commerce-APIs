import mongoose, { Schema } from "mongoose";
import {
  AVAILABLE_ORDER_STATUS_ENUM,
  ORDER_STATUS_ENUM,
} from "../../constants.js";

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    orderPrice: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: AVAILABLE_ORDER_STATUS_ENUM,
      default: ORDER_STATUS_ENUM.PENDING,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
