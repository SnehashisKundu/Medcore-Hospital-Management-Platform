"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = sendSms;
const twilio_1 = __importDefault(require("twilio"));
function getTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
        throw new Error("Twilio is not configured. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required.");
    }
    return (0, twilio_1.default)(accountSid, authToken);
}
async function sendSms({ to, message, }) {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
        throw new Error("Twilio is not configured. TWILIO_PHONE_NUMBER is required.");
    }
    const client = getTwilioClient();
    await client.messages.create({
        body: message,
        from,
        to,
    });
}
