/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller endpoints
 */

import { Router } from "express";
import { isSeller, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCatalog,
  createProduct,
  getOrders,
} from "../controllers/seller.controller.js";

const router = Router();

/**
 * @swagger
 * /api/seller/create-catalog:
 *   post:
 *     summary: Create catalog
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Catalog created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.route("/create-catalog").post(verifyJWT, isSeller, createCatalog);

/**
 * @swagger
 * /api/seller/orders:
 *   get:
 *     summary: Get orders
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/orders").get(verifyJWT, isSeller, getOrders);

/**
 * @swagger
 * /api/seller/create-product:
 *   post:
 *     summary: Create product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.route("/create-product").post(verifyJWT, isSeller, createProduct);

export default router;
