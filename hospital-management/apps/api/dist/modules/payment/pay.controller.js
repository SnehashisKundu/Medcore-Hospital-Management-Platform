"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentController = createPaymentController;
exports.getPaymentsController = getPaymentsController;
exports.getPaymentByIdController = getPaymentByIdController;
exports.updatePaymentController = updatePaymentController;
const pay_service_1 = require("./pay.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createPaymentController(req, res) {
    try {
        const body = req.body ?? {};
        const { invoiceId, amount, method, } = body;
        if (!invoiceId ||
            amount === undefined ||
            !method) {
            return res.status(400).json({
                success: false,
                message: "Invoice ID, amount and payment method are required",
            });
        }
        const payment = await (0, pay_service_1.createPayment)(body);
        if (!payment) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: payment?.invoice?.hospitalId,
            action: "CREATE",
            entityType: "PAYMENT",
            entityId: payment.id,
            metadata: {
                invoiceId: payment.invoiceId,
                amount: payment.amount.toString(),
                method: payment.method,
                status: payment.status,
                blockchainTxId: payment.blockchainTxId,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                INVALID_AMOUNT: [
                    400,
                    "Payment amount must be greater than zero",
                ],
                INVOICE_NOT_FOUND: [
                    404,
                    "Invoice not found",
                ],
                INVOICE_NOT_PAYABLE: [
                    400,
                    "Invoice is not available for payment",
                ],
                INVOICE_ALREADY_PAID: [
                    400,
                    "Invoice is already fully paid",
                ],
                PAYMENT_EXCEEDS_DUE: [
                    400,
                    "Payment amount exceeds remaining invoice amount",
                ],
            };
            const response = map[error.message];
            if (response) {
                return res.status(response[0]).json({
                    success: false,
                    message: response[1],
                });
            }
        }
        console.error("Create payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPaymentsController(_req, res) {
    try {
        const payments = await (0, pay_service_1.getPayments)();
        return res.status(200).json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        console.error("Get payments error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getPaymentByIdController(req, res) {
    try {
        const payment = await (0, pay_service_1.getPaymentById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "PAYMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }
        console.error("Get payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updatePaymentController(req, res) {
    try {
        const payment = await (0, pay_service_1.updatePayment)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: payment.invoice?.hospitalId,
            action: "UPDATE",
            entityType: "PAYMENT",
            entityId: payment.id,
            metadata: {
                invoiceId: payment.invoiceId,
                amount: payment.amount.toString(),
                status: payment.status,
                transactionReference: payment.transactionReference,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            data: payment,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message ===
                "PAYMENT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Payment not found",
                });
            }
            if (error.message ===
                "PAYMENT_ALREADY_REFUNDED") {
                return res.status(400).json({
                    success: false,
                    message: "Refunded payment cannot be modified",
                });
            }
        }
        console.error("Update payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
