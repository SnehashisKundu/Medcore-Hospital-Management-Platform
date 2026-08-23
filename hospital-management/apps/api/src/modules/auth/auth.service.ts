import jwt from "jsonwebtoken";

import { prisma } from "../../config/prisma";
import {
  comparePassword,
  generateRefreshToken,
  generateSecureToken,
  hashPassword,
  hashRefreshToken,
  hashToken,
} from "./auth.utils";
import { createAuditLog } from "../audit-log/aud.service";

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

export async function loginUser(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 2. Block inactive/deleted users
  if (!user.isActive || user.deletedAt) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // 3. Verify password
  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 4. Build role information
  const roles = user.roles.map((userRole) => ({
    role: userRole.role.name,
    hospitalId: userRole.hospitalId,
  }));

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  // 5. Generate Access Token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      roles,
    },
    secret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );

  // 6. Generate Refresh Token
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS
  );

  // 7. Store only hashed refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  // 8. Create LOGIN audit log
  const hospitalId =
    roles.length === 1 ? roles[0].hospitalId ?? undefined : undefined;

  await createAuditLog({
    userId: user.id,
    hospitalId,
    action: "LOGIN",
    entityType: "AUTH",
    entityId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: {
      email: user.email,
      roles: roles.map((role) => role.role),
    },
  });

  // 9. Return tokens and user
  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    },
  };
}

interface RefreshTokenInput {
  refreshToken: string;
}

export async function refreshAccessToken(
  input: RefreshTokenInput
) {
  const tokenHash = hashRefreshToken(input.refreshToken);

  // 1. Find the refresh token
  const existingToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!existingToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // 2. Check if already revoked
  if (existingToken.revokedAt) {
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  // 3. Check expiry
  if (existingToken.expiresAt <= new Date()) {
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }

  // 4. Check user status
  const user = existingToken.user;

  if (!user.isActive || user.deletedAt) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // 5. Build latest roles
  const roles = user.roles.map((userRole) => ({
    role: userRole.role.name,
    hospitalId: userRole.hospitalId,
  }));

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  // 6. Generate new access token
  const accessToken = jwt.sign(
    {
      sub: user.id,
      roles,
    },
    secret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );

  // 7. Generate new refresh token
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS
  );

  // 8. Rotate token:
  // revoke old + create new
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: existingToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  const existingToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  // Security reason: even invalid token par generic success
  if (!existingToken || existingToken.revokedAt) {
    return;
  }

  await prisma.refreshToken.update({
    where: {
      id: existingToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function changePassword(
  input: ChangePasswordInput
) {
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user || !user.isActive || user.deletedAt) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const passwordMatches = await comparePassword(
    input.currentPassword,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await hashPassword(
    input.newPassword
  );

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    }),

    prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);
}

export async function forgotPassword(
  input: ForgotPasswordInput
) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || user.deletedAt) {
    return { resetToken: null };
  }

  const resetToken = generateSecureToken();
  const tokenHash = hashToken(resetToken);

  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() +
      PASSWORD_RESET_TOKEN_EXPIRY_MINUTES
  );

  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  return { resetToken };
}

export async function resetPassword(
  input: ResetPasswordInput
) {
  const tokenHash = hashToken(input.token);

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

  if (!resetToken) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  if (resetToken.usedAt) {
    throw new Error("RESET_TOKEN_USED");
  }

  if (resetToken.expiresAt <= new Date()) {
    throw new Error("RESET_TOKEN_EXPIRED");
  }

  if (
    !resetToken.user.isActive ||
    resetToken.user.deletedAt
  ) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const passwordHash = await hashPassword(
    input.newPassword
  );

  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    }),
  ]);
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // 2. Hash password
  const passwordHash = await hashPassword(input.password);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}