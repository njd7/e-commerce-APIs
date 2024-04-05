import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// additional useful routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").patch(verifyJWT, updatePassword);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
