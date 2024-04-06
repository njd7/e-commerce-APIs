/**
 * @swagger
 * tags:
 *   name: Buyer
 *   description: Buyer endpoints
 */

import { Router } from "express";
import {
  createOrder,
  getSellerCatalog,
  getSellers,
} from "../controllers/buyer.controller.js";
import { isBuyer, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/buyer/list-of-sellers:
 *   get:
 *     summary: Get list of sellers
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sellers fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/list-of-sellers").get(verifyJWT, isBuyer, getSellers);

/**
 * @swagger
 * /api/buyer/seller-catalog/{seller_id}:
 *   get:
 *     summary: Get seller catalog
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seller_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller catalog fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller not found
 */
router
  .route("/seller-catalog/:seller_id")
  .get(verifyJWT, isBuyer, getSellerCatalog);

/**
 * @swagger
 * /api/buyer/create-order/{seller_id}:
 *   post:
 *     summary: Create order
 *     tags: [Buyer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: seller_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemsList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     units:
 *                       type: number
 *                       default: 1
 *                     product:
 *                       type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.route("/create-order/:seller_id").post(verifyJWT, isBuyer, createOrder);

export default router;
