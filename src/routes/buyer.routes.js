import { Router } from "express";
import {
  createOrder,
  getSellerCatalog,
  getSellers,
} from "../controllers/buyer.controller.js";
import { isBuyer, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/list-of-sellers").get(verifyJWT, isBuyer, getSellers);
router
  .route("/seller-catalog/:seller_id")
  .get(verifyJWT, isBuyer, getSellerCatalog);
router.route("/create-order/:seller_id").post(verifyJWT, isBuyer, createOrder);

export default router;
