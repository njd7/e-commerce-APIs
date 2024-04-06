import { Catalog } from "../models/ecommerce/catalog.model.js";
import { CatalogProduct } from "../models/ecommerce/catalogProduct.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { OrderItem } from "../models/ecommerce/orderItem.model.js";
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
  let catalog = await Catalog.findOne({ owner: req?.user?._id });
  const catalogStatus = !catalog ? "created" : "updated";

  if (!catalog) {
    catalog = await Catalog.create({
      owner: req?.user?._id,
      count: products.length,
    });
    if (!catalog) {
      throw new ApiError(500, "Something went wrong while creating catalog");
    }
  } else {
    catalog.count += products.length;
    await catalog.save({ validateBeforeSave: false });
  }

  const productsToInsert = products.map((product) => {
    return { product, catalog: catalog._id };
  });

  const catalogProducts = await CatalogProduct.insertMany(productsToInsert);
  if (!catalogProducts) {
    throw new ApiError(
      500,
      "Something went wrong while creation catalogProducts"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Catalog ${catalogStatus} successfully`));
});

const getOrders = asyncHandler(async (req, res) => {
  const allOrders = [];
  const orders = await Order.find({ seller: req?.user?._id });

  for (let order of orders) {
    const orderObject = {
      buyer: order.buyer,
      seller: order.seller,
      orderPrice: order.orderPrice,
      orderStatus: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      isPaymentDone: order.isPaymentDone,
      items: [],
    };

    const ordersList = [];
    const orderItems = await OrderItem.find({ order: order._id }).select(
      "product units"
    );
    for (let item of orderItems) {
      const product = await Product.findById(item.product).select("name");
      ordersList.push({ product, units: item.units });
    }
    orderObject.items = ordersList;

    allOrders.push(orderObject);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allOrders, "Orders fetched"));
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    throw new ApiError(400, "Both name and price required!");
  }

  const product = await Product.create({
    name,
    price,
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating product");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product created succcessfully"));
});

export { createCatalog, getOrders, createProduct };
