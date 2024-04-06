import mongoose, { Schema } from "mongoose";

const catalogSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Catalog = mongoose.model("Catalog", catalogSchema);
