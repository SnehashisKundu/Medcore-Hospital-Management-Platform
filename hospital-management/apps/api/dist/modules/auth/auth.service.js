"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
exports.refreshAccessToken = refreshAccessToken;
exports.logoutUser = logoutUser;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.registerUser = registerUser;
exports.verifyEmailOtp = verifyEmailOtp;
exports.resendEmailVerificationOtp = resendEmailVerificationOtp;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const auth_utils_1 = require("./auth.utils");
const aud_service_1 = require("../audit-log/aud.service");
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;
const EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES = 10;
function generateEmailVerificationOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function loginUser(input) {
    const email = input.email.trim().toLowerCase();
    // 1. Find user
    const user = await prisma_1.prisma.user.findUnique({
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
    const passwordMatches = await (0, auth_utils_1.comparePassword)(input.password, user.passwordHash);
    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // 4. Block unverified email users
    if (!user.isEmailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
    }
    // 5. Build role information
    const roles = user.roles.map((userRole) => ({
        role: userRole.role.name,
        hospitalId: userRole.hospitalId,
    }));
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    // 6. Generate Access Token
    const accessToken = jsonwebtoken_1.default.sign({
        sub: user.id,
        roles,
    }, secret, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    // 7. Generate Refresh Token
    const refreshToken = (0, auth_utils_1.generateRefreshToken)();
    const tokenHash = (0, auth_utils_1.hashRefreshToken)(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    // 8. Store only hashed refresh token
    await prisma_1.prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    // 9. Create LOGIN audit log
    const hospitalId = roles.length === 1 ? roles[0].hospitalId ?? undefined : undefined;
    await (0, aud_service_1.createAuditLog)({
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
    // 10. Return tokens and user
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
async function refreshAccessToken(input) {
    const tokenHash = (0, auth_utils_1.hashRefreshToken)(input.refreshToken);
    // 1. Find the refresh token
    const existingToken = await prisma_1.prisma.refreshToken.findUnique({
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
    if (!user.isEmailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
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
    const accessToken = jsonwebtoken_1.default.sign({
        sub: user.id,
        roles,
    }, secret, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    // 7. Generate new refresh token
    const newRefreshToken = (0, auth_utils_1.generateRefreshToken)();
    const newTokenHash = (0, auth_utils_1.hashRefreshToken)(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    // 8. Rotate token
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.refreshToken.update({
            where: {
                id: existingToken.id,
            },
            data: {
                revokedAt: new Date(),
            },
        }),
        prisma_1.prisma.refreshToken.create({
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
async function logoutUser(refreshToken) {
    const tokenHash = (0, auth_utils_1.hashRefreshToken)(refreshToken);
    const existingToken = await prisma_1.prisma.refreshToken.findUnique({
        where: {
            tokenHash,
        },
    });
    // Security reason: even invalid token par generic success
    if (!existingToken || existingToken.revokedAt) {
        return;
    }
    await prisma_1.prisma.refreshToken.update({
        where: {
            id: existingToken.id,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}
async function changePassword(input) {
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: input.userId,
        },
    });
    if (!user || !user.isActive || user.deletedAt) {
        throw new Error("ACCOUNT_INACTIVE");
    }
    const passwordMatches = await (0, auth_utils_1.comparePassword)(input.currentPassword, user.passwordHash);
    if (!passwordMatches) {
        throw new Error("INVALID_CURRENT_PASSWORD");
    }
    const passwordHash = await (0, auth_utils_1.hashPassword)(input.newPassword);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                passwordHash,
            },
        }),
        prisma_1.prisma.refreshToken.updateMany({
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
async function forgotPassword(input) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user || !user.isActive || user.deletedAt) {
        return { resetToken: null };
    }
    const resetToken = (0, auth_utils_1.generateSecureToken)();
    const tokenHash = (0, auth_utils_1.hashToken)(resetToken);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() +
        PASSWORD_RESET_TOKEN_EXPIRY_MINUTES);
    const now = new Date();
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
            data: { usedAt: now },
        }),
        prisma_1.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        }),
    ]);
    return { resetToken };
}
async function resetPassword(input) {
    const tokenHash = (0, auth_utils_1.hashToken)(input.token);
    const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
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
    if (!resetToken.user.isActive ||
        resetToken.user.deletedAt) {
        throw new Error("ACCOUNT_INACTIVE");
    }
    const passwordHash = await (0, auth_utils_1.hashPassword)(input.newPassword);
    const now = new Date();
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        }),
        prisma_1.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { usedAt: now },
        }),
        prisma_1.prisma.refreshToken.updateMany({
            where: {
                userId: resetToken.userId,
                revokedAt: null,
            },
            data: { revokedAt: now },
        }),
    ]);
}
async function registerUser(input) {
    const email = input.email.trim().toLowerCase();
    // 1. Check if user already exists
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }
    // 2. Hash password
    const passwordHash = await (0, auth_utils_1.hashPassword)(input.password);
    // 3. Generate OTP
    const otp = generateEmailVerificationOtp();
    const otpHash = (0, auth_utils_1.hashToken)(otp);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() +
        EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES);
    // 4. Create user and OTP together
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                isActive: true,
                isEmailVerified: false,
            },
        });
        await tx.emailVerificationOtp.create({
            data: {
                userId: user.id,
                otpHash: otpHash,
                expiresAt,
            },
        });
        return user;
    });
    // Development/testing response.
    // Later email service integration will send this OTP via email.
    return {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        otp,
    };
}
async function verifyEmailOtp(input) {
    const email = input.email.trim().toLowerCase();
    // 1. Find user
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    if (!user.isActive || user.deletedAt) {
        throw new Error("ACCOUNT_INACTIVE");
    }
    if (user.isEmailVerified) {
        throw new Error("EMAIL_ALREADY_VERIFIED");
    }
    // 2. Find latest valid OTP
    const verificationOtp = await prisma_1.prisma.emailVerificationOtp.findFirst({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (!verificationOtp) {
        throw new Error("OTP_NOT_FOUND");
    }
    // 3. Check expiry
    if (verificationOtp.expiresAt <= new Date()) {
        await prisma_1.prisma.emailVerificationOtp.delete({
            where: {
                id: verificationOtp.id,
            },
        });
        throw new Error("OTP_EXPIRED");
    }
    // 4. Verify OTP
    const otpHash = (0, auth_utils_1.hashToken)(input.otp);
    if (otpHash !== verificationOtp.otpHash) {
        throw new Error("INVALID_OTP");
    }
    // 5. Verify email and remove OTP
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                isEmailVerified: true,
            },
        }),
        prisma_1.prisma.emailVerificationOtp.deleteMany({
            where: {
                userId: user.id,
            },
        }),
    ]);
    return {
        email: user.email,
        isEmailVerified: true,
    };
}
async function resendEmailVerificationOtp(input) {
    const email = input.email.trim().toLowerCase();
    // 1. Find user
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    if (!user.isActive || user.deletedAt) {
        throw new Error("ACCOUNT_INACTIVE");
    }
    if (user.isEmailVerified) {
        throw new Error("EMAIL_ALREADY_VERIFIED");
    }
    // 2. Generate new OTP
    const otp = generateEmailVerificationOtp();
    const otpHash = (0, auth_utils_1.hashToken)(otp);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() +
        EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES);
    // 3. Delete previous OTPs and create fresh one
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.emailVerificationOtp.deleteMany({
            where: {
                userId: user.id,
            },
        }),
        prisma_1.prisma.emailVerificationOtp.create({
            data: {
                userId: user.id,
                otpHash: otpHash,
                expiresAt,
            },
        }),
    ]);
    // Development/testing response.
    // Later email service integration will send this OTP via email.
    return {
        email: user.email,
        otp,
    };
}
