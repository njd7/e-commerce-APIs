import { Router } from "express";

const router = Router();

router.route("/create-catalog").post();
router.route("/orders").get();

export default router;
