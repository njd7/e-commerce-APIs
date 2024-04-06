import { Catalog } from "../models/ecommerce/catalog.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { Product } from "../models/ecommerce/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createCatalog = asyncHandler(async (req, res) => {
  // seller_id retrieved from auth middleware verifyJWT
  // create catalog
  const { products } = req.body;
  if (!products) {
    throw new ApiError(400, "Products required");
  }

  // check if Catalog is already created
  const prevCatalog = await Catalog.findOne({ owner: req?.user?._id });

  if (!prevCatalog) {
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
    console.log("Catalog: ", catalog);
    return res
      .status(200)
      .json(new ApiResponse(200, catalog, "Catalog created successfully"));
  }

  prevCatalog.products = [...prevCatalog.products, products];

  const newCatalog = await prevCatalog.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, newCatalog, "Catalog updated successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ seller: req?.user?._id });
  return res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    throw new ApiError(400, "Both name and price required!");
  }

  const product = await Product.create({
    name,
    price,
    owner: req?.user?._id,
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product created succcessfully"));
});

export { createCatalog, getOrders, createProduct };
