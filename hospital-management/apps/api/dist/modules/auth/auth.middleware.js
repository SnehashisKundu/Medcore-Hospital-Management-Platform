"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    try {
        // Authorization
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const [type, token] = authorization.split(" ");
        if (type !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded.sub) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        req.user = {
            id: decoded.sub,
            roles: decoded.roles ?? [],
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
        console.error("Authentication error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
