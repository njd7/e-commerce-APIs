import { Router } from "express";

const router = Router();

router.route("/list-of-sellers").get();
router.route("/seller-catalog/:seller_id").get();
router.route("/create-order/:seller_id").post();

export default router;
