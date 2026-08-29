"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateRefreshToken = generateRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
exports.generateSecureToken = generateSecureToken;
exports.hashToken = hashToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, passwordHash) {
    return bcrypt_1.default.compare(password, passwordHash);
}
function generateRefreshToken() {
    return node_crypto_1.default.randomBytes(64).toString("hex");
}
function hashRefreshToken(token) {
    return node_crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
}
function generateSecureToken() {
    return node_crypto_1.default.randomBytes(64).toString("hex");
}
function hashToken(token) {
    return hashRefreshToken(token);
}
