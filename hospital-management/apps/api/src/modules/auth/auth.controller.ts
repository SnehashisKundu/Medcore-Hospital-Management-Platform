import { Request, Response } from "express";

import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  verifyEmailOtp,
  resendEmailVerificationOtp,
} from "./auth.service";

import { AuthRequest } from "./auth.middleware";
import { prisma } from "../../config/prisma";

export async function loginController(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }

      if (error.message === "EMAIL_NOT_VERIFIED") {
        return res.status(403).json({
          success: false,
          message:
            "Email is not verified. Please verify your email first.",
        });
      }
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function meController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isEmailVerified: true,
        roles: {
          select: {
            hospitalId: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not available",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function logoutController(
  req: Request,
  res: Response
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    await logoutUser(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function changePasswordController(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    await changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again.",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CURRENT_PASSWORD") {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }
    }

    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPassword({ email });

    return res.status(200).json({
      success: true,
      message:
        "If an active account exists with this email, a password reset token has been generated.",
      data: result,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response
) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required",
      });
    }

    await resetPassword({
      token,
      newPassword,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login again.",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "INVALID_RESET_TOKEN" ||
        error.message === "RESET_TOKEN_USED" ||
        error.message === "RESET_TOKEN_EXPIRED"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid, expired, or already used reset token",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }
    }

    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function refreshTokenController(
  req: Request,
  res: Response
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await refreshAccessToken({
      refreshToken,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "INVALID_REFRESH_TOKEN" ||
        error.message === "REFRESH_TOKEN_REVOKED" ||
        error.message === "REFRESH_TOKEN_EXPIRED"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }

      if (error.message === "EMAIL_NOT_VERIFIED") {
        return res.status(403).json({
          success: false,
          message:
            "Email is not verified. Please verify your email first.",
        });
      }
    }

    console.error("Refresh token error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function registerController(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, and firstName are required",
      });
    }

    const user = await registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email.",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function verifyEmailOtpController(
  req: Request,
  res: Response
) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const result = await verifyEmailOtp({
      email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }

      if (error.message === "EMAIL_ALREADY_VERIFIED") {
        return res.status(409).json({
          success: false,
          message: "Email is already verified",
        });
      }

      if (
        error.message === "OTP_NOT_FOUND" ||
        error.message === "INVALID_OTP"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      if (error.message === "OTP_EXPIRED") {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        });
      }
    }

    console.error("Verify email OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function resendEmailVerificationOtpController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result =
      await resendEmailVerificationOtp({
        email,
      });

    return res.status(200).json({
      success: true,
      message:
        "A new email verification OTP has been generated",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message === "ACCOUNT_INACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }

      if (error.message === "EMAIL_ALREADY_VERIFIED") {
        return res.status(409).json({
          success: false,
          message: "Email is already verified",
        });
      }
    }

    console.error(
      "Resend email verification OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}