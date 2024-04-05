import { User } from "../models/auth/user.model.js";
import { Catalog } from "../models/ecommerce/catalog.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ userType: "SELLER" });
  return res
    .status(200)
    .json(new ApiResponse(200, sellers, "List of sellers fetched"));
});

const getSellerCatalog = asyncHandler(async (req, res) => {
  const { seller_id } = req.params;
  const sellerCatalog = await Catalog.find({ owner: seller_id });
  return res
    .status(200)
    .json(new ApiResponse(200, sellerCatalog, "Seller catalog fetched"));
});

const createOrder = asyncHandler(async (req, res) => {
  const { seller_id } = req.params;
  const { products } = req.body;
  const order = await Order.create({
    buyer: req?.user?._id,
    seller: seller_id,
    products,
  });

  if (!order) {
    throw new ApiError(500, "Something went wrong while creating order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created successfully"));
});
export { getSellers, getSellerCatalog, createOrder };
