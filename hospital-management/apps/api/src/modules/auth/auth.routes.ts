import { Router } from "express";

import {
  loginController,
  meController,
  logoutController,
  refreshTokenController,
  registerController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller";

import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh", refreshTokenController);

router.post("/logout", logoutController);

router.post(
  "/change-password",
  authenticate,
  changePasswordController
);

router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

router.get(
  "/me",
  authenticate,
  meController
);

export default router;