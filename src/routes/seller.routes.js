import { Router } from "express";
import { isSeller, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCatalog,
  createProduct,
  getOrders,
} from "../controllers/seller.controller.js";

const router = Router();

router.route("/create-catalog").post(verifyJWT, isSeller, createCatalog);
router.route("/orders").get(verifyJWT, isSeller, getOrders);

router.route("/create-product").post(verifyJWT, createProduct);

export default router;
