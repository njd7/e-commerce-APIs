import { Router } from "express";
import { isSeller, verifyJWT } from "../middlewares/auth.middleware.js";
import { createCatalog, getOrders } from "../controllers/seller.controller.js";

const router = Router();

router.route("/create-catalog").post(verifyJWT, isSeller, createCatalog);
router.route("/orders").get(verifyJWT, isSeller, getOrders);

export default router;
