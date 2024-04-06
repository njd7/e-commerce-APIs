import mongoose, { Schema } from "mongoose";

const catalogProductSchema = new Schema(
  {
    catalog: {
      type: Schema.Types.ObjectId,
      ref: "Catalog",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

export const CatalogProduct = mongoose.model(
  "CatalogProduct",
  catalogProductSchema
);
