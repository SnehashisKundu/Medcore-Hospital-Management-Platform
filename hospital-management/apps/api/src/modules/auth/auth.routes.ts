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
  verifyEmailOtpController,
  resendEmailVerificationOtpController,
} from "./auth.controller";

import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/register", registerController);

router.post("/verify-email", verifyEmailOtpController);

router.post(
  "/resend-verification-otp",
  resendEmailVerificationOtpController
);

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