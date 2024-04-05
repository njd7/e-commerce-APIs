import { Catalog } from "../models/ecommerce/catalog.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createCatalog = asyncHandler(async (req, res) => {
  // seller_id retrieved from auth middleware verifyJWT
  // create catalog
  const { products } = req.body;
  const catalog = await Catalog.create({
    owner: req?.user?._id,
    products,
  });

  if (!catalog) {
    throw new ApiError(500, "Something went wrong while creating catalog");
  }

  //   const data = await Catalog.aggregate([
  //     {
  //       $match: {
  //         owner: new mongoose.Types.ObjectId(req?.user?._id),
  //       },
  //     },
  //     {
  //       $lookup: {},
  //     },
  //   ]);

  return res
    .status(200)
    .json(new ApiResponse(200, catalog, "Catalog successfully created"));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req?.user?._id });
  return res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});

export { createCatalog, getOrders };
