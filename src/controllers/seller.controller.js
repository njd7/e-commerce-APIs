import { Catalog } from "../models/ecommerce/catalog.model.js";
import { CatalogProduct } from "../models/ecommerce/catalogProduct.model.js";
import { Order } from "../models/ecommerce/order.model.js";
import { OrderItem } from "../models/ecommerce/orderItem.model.js";
import { Product } from "../models/ecommerce/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCatalog = asyncHandler(async (req, res) => {
  // seller_id retrieved from auth middleware verifyJWT

  try {
    const { products } = req.body;

    const uniqueProducts = [...new Set(products)];

    if (!products) {
      throw new ApiError(400, "Products required");
    }

    // Check if Catalog is already created
    let catalog = await Catalog.findOne({ owner: req?.user?._id });
    const catalogStatus = !catalog ? "created" : "updated";

    // Create or update catalog
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

    const existingProducts = await CatalogProduct.find({
      catalog: catalog._id,
    }).select("product");

    // console.log("existingProducts ", existingProducts.length, existingProducts);

    const existingProductIds = existingProducts.map((item) =>
      item.product.toString()
    );

    // console.log("existingProductIds ", existingProductIds);

    const newProductIds = uniqueProducts.filter(
      (item) => !existingProductIds.includes(item)
    );

    if (newProductIds.length === 0) {
      throw new ApiError(400, "All products already exist");
    }

    const productsToInsert = newProductIds.map((product) => {
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
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      throw new ApiError(
        400,
        "Product with this name already exists in Catalog"
      );
    }
    throw new ApiError(500, "Internal Server Error");
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
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

      // const orderItems = await OrderItem.find({ order: order._id }).select(
      //   "product units"
      // );
      // // .populate("product", "name");
      // // orderObject.items = orderItems;

      // for (let item of orderItems) {
      //   const product = await Product.findById(item.product).select("name");
      //   orderObject.items.push({
      //     productId: product._id,
      //     name: product.name,
      //     units: item.units,
      //   });
      // }

      const orderItemsList = await OrderItem.aggregate([
        {
          $match: {
            order: order._id,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $addFields: {
            name: {
              $first: "$product.name",
            },
            productId: {
              $first: "$product._id",
            },
          },
        },
        {
          $project: {
            name: 1,
            units: 1,
            productId: 1,
            _id: 0,
          },
        },
      ]);
      orderObject.items = orderItemsList;

      allOrders.push(orderObject);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, allOrders, "Orders fetched"));
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price } = req.body;

    // Validate name and price
    if (!name || !price) {
      throw new ApiError(400, "Both name and price required!");
    }

    // Create product
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
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
});

export { createCatalog, getOrders, createProduct };
