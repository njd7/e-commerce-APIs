import { User } from "../models/auth/user.model.js";
import { Catalog } from "../models/ecommerce/catalog.model.js";
import { CatalogProduct } from "../models/ecommerce/catalogProduct.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { OrderItem } from "../models/ecommerce/orderItem.model.js";
import { Product } from "../models/ecommerce/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getSellers = asyncHandler(async (req, res) => {
  const allSellers = [];

  const sellers = await User.find({ userType: "SELLER" });
  for (let seller of sellers) {
    const sellerObject = {
      username: "",
      fullName: "",
      email: "",
      seller_id: "",
      catalog: [],
    };
    sellerObject.username = seller.username;
    sellerObject.fullName = seller.fullName;
    sellerObject.email = seller.email;
    sellerObject.seller_id = seller._id;

    const productList = [];

    const catalog = await Catalog.findOne({ owner: seller._id });

    if (catalog) {
      const catalogId = catalog._id;

      const catalogProducts = await CatalogProduct.find({ catalog: catalogId });

      for (let item of catalogProducts) {
        const product = await Product.findById(item.product).select(
          "name price"
        );

        productList.push(product);
      }
    }
    sellerObject.catalog = productList;

    allSellers.push(sellerObject);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allSellers, "List of sellers fetched"));
});

const getSellerCatalog = asyncHandler(async (req, res) => {
  const { seller_id } = req.params;
  const seller = await User.findById(seller_id);
  if (!seller) {
    throw new ApiError(404, "Invalid id");
  }
  if (seller.userType !== "SELLER") {
    throw new ApiError(400, "Provided ID does not correspond to a seller");
  }
  const catalogObject = { seller_id, count: 0, catalog: [] };
  const productList = [];

  const catalog = await Catalog.findOne({ owner: seller_id });

  if (catalog) {
    const catalogId = catalog._id;
    catalogObject.count = catalog.count;

    const catalogProducts = await CatalogProduct.find({ catalog: catalogId });

    for (let item of catalogProducts) {
      const product = await Product.findById(item.product).select("name price");

      productList.push(product);
    }
  }

  catalogObject.catalog = productList;

  return res
    .status(200)
    .json(new ApiResponse(200, catalogObject, "Seller catalog fetched"));
});

const createOrder = asyncHandler(async (req, res) => {
  const { seller_id } = req.params;
  const { itemsList } = req.body;

  if (!itemsList) {
    throw new ApiError(400, "Please provide itemsList");
  }

  // Check if all the item has both units and product properties
  for (let item of itemsList) {
    if (!item.hasOwnProperty("units") || !item.hasOwnProperty("product")) {
      throw new ApiError(
        400,
        "Please provide units and product for each order item"
      );
    }
  }

  const order = await Order.create({
    buyer: req?.user?._id,
    seller: seller_id,
  });

  if (!order) {
    throw new ApiError(500, "Something went wrong while creating order");
  }

  const orderItemsToInsert = itemsList.map((item) => {
    return { ...item, order: order._id };
  });

  const orderItems = await OrderItem.insertMany(orderItemsToInsert);
  if (!orderItems) {
    throw new ApiError(500, "Something went wrong while creating OrderItems");
  }

  let total = 0;
  for (let item of orderItems) {
    total += (await Product.findById(item.product)).price * item.units;
  }

  order.orderPrice = total;
  await order.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order created successfully"));
});
export { getSellers, getSellerCatalog, createOrder };
