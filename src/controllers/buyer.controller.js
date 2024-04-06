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
  try {
    const allSellers = [];

    const sellers = await User.find({ userType: "SELLER" });

    for (let seller of sellers) {
      const sellerObject = {
        username: seller.username,
        fullName: seller.fullName,
        email: seller.email,
        seller_id: seller._id,
        catalog: [],
      };
      const sellerProducts = await Catalog.aggregate([
        { $match: { owner: seller._id } },
        {
          $lookup: {
            from: "catalogproducts",
            localField: "_id",
            foreignField: "catalog",
            as: "catalogProducts",
          },
        },
        {
          $unwind: "$catalogProducts",
        },
        {
          $lookup: {
            from: "products",
            localField: "catalogProducts.product",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ]);

      sellerObject.catalog = sellerProducts.map(({ product }) => ({
        name: product.name,
        price: product.price,
      }));

      allSellers.push(sellerObject);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, allSellers, "List of sellers fetched"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

const getSellerCatalog = asyncHandler(async (req, res) => {
  try {
    const { seller_id } = req.params;

    const seller = await User.findOne({ _id: seller_id, userType: "SELLER" });
    if (!seller) {
      throw new ApiError(404, "Seller not found");
    }

    const catalog = await Catalog.findOne({ owner: seller_id }).select("count");
    const catalogObject = { seller_id, count: 0, catalog: [] };

    if (catalog) {
      catalogObject.count = catalog.count;

      const catalogProducts = await CatalogProduct.find({
        catalog: catalog._id,
      })
        .select("product")
        .populate("product", "name price");

      catalogObject.catalog = catalogProducts.map(({ product }) => product);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, catalogObject, "Seller catalog fetched"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { seller_id } = req.params;
    const { itemsList } = req.body;

    // validate itemsList
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

    // create order
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

    // Calculate total order price
    let total = 0;
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      total += product.price * item.units;
    }

    // Update order price
    order.orderPrice = total;
    await order.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Order created successfully"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});
export { getSellers, getSellerCatalog, createOrder };
