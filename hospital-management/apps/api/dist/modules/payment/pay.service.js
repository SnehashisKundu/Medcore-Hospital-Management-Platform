"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.getPayments = getPayments;
exports.getPaymentById = getPaymentById;
exports.updatePayment = updatePayment;
const node_crypto_1 = __importDefault(require("node:crypto"));
const prisma_1 = require("../../config/prisma");
const blockchain_service_1 = require("../../services/blockchain.service");
function generatePaymentHash(data) {
    const payload = JSON.stringify({
        paymentId: data.paymentId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        method: data.method,
        status: data.status,
        transactionReference: data.transactionReference ?? null,
        paidAt: data.paidAt.toISOString(),
    });
    return node_crypto_1.default
        .createHash("sha256")
        .update(payload)
        .digest("hex");
}
async function createPayment(input) {
    if (input.amount <= 0) {
        throw new Error("INVALID_AMOUNT");
    }
    const invoice = await prisma_1.prisma.invoice.findUnique({
        where: {
            id: input.invoiceId,
        },
    });
    if (!invoice) {
        throw new Error("INVOICE_NOT_FOUND");
    }
    if (invoice.status === "DRAFT" ||
        invoice.status === "CANCELLED") {
        throw new Error("INVOICE_NOT_PAYABLE");
    }
    if (invoice.status === "PAID") {
        throw new Error("INVOICE_ALREADY_PAID");
    }
    /*
     * First complete the database operation.
     * We intentionally DO NOT call blockchain
     * inside Prisma transaction.
     */
    const payment = await prisma_1.prisma.$transaction(async (tx) => {
        const successfulPayments = await tx.payment.findMany({
            where: {
                invoiceId: input.invoiceId,
                status: "SUCCESS",
            },
        });
        const alreadyPaid = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const totalAmount = Number(invoice.totalAmount);
        const remainingAmount = totalAmount - alreadyPaid;
        if (input.amount > remainingAmount) {
            throw new Error("PAYMENT_EXCEEDS_DUE");
        }
        const paymentStatus = input.status ?? "SUCCESS";
        const paidAt = paymentStatus === "SUCCESS"
            ? new Date()
            : undefined;
        const createdPayment = await tx.payment.create({
            data: {
                invoiceId: input.invoiceId,
                amount: input.amount,
                method: input.method,
                status: paymentStatus,
                transactionReference: input.transactionReference?.trim(),
                paidAt,
            },
        });
        if (paymentStatus === "SUCCESS") {
            const newPaidAmount = alreadyPaid + input.amount;
            const newInvoiceStatus = newPaidAmount >= totalAmount
                ? "PAID"
                : "PARTIALLY_PAID";
            await tx.invoice.update({
                where: {
                    id: input.invoiceId,
                },
                data: {
                    status: newInvoiceStatus,
                },
            });
        }
        return createdPayment;
    });
    /*
     * Blockchain only for successful payments.
     */
    if (payment.status === "SUCCESS" &&
        payment.paidAt) {
        const blockchainHash = generatePaymentHash({
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            amount: payment.amount.toString(),
            method: payment.method,
            status: payment.status,
            transactionReference: payment.transactionReference ??
                undefined,
            paidAt: payment.paidAt,
        });
        /*
         * Store SHA-256 hash first.
         */
        await prisma_1.prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                blockchainHash,
            },
        });
        /*
         * Anchor hash on Sepolia.
         */
        const blockchainTxId = await (0, blockchain_service_1.anchorPaymentHash)(blockchainHash);
        /*
         * Save confirmed blockchain transaction ID.
         */
        await prisma_1.prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                blockchainTxId,
            },
        });
    }
    /*
     * Return fresh payment with blockchain data.
     */
    return prisma_1.prisma.payment.findUnique({
        where: {
            id: payment.id,
        },
        include: {
            invoice: true,
        },
    });
}
async function getPayments() {
    return prisma_1.prisma.payment.findMany({
        include: {
            invoice: {
                include: {
                    patient: true,
                    hospital: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getPaymentById(id) {
    const payment = await prisma_1.prisma.payment.findUnique({
        where: {
            id,
        },
        include: {
            invoice: {
                include: {
                    patient: true,
                    hospital: true,
                    items: {
                        include: {
                            charge: true,
                        },
                    },
                },
            },
        },
    });
    if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }
    return payment;
}
async function updatePayment(id, input) {
    const payment = await prisma_1.prisma.payment.findUnique({
        where: {
            id,
        },
    });
    if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }
    if (payment.status === "REFUNDED") {
        throw new Error("PAYMENT_ALREADY_REFUNDED");
    }
    return prisma_1.prisma.payment.update({
        where: {
            id,
        },
        data: {
            status: input.status,
            transactionReference: input.transactionReference?.trim(),
            paidAt: input.paidAt
                ? new Date(input.paidAt)
                : input.status === "SUCCESS"
                    ? new Date()
                    : undefined,
        },
        include: {
            invoice: true,
        },
    });
}
