"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChargeController = createChargeController;
exports.getChargesController = getChargesController;
exports.getChargeByIdController = getChargeByIdController;
exports.createInvoiceController = createInvoiceController;
exports.getInvoicesController = getInvoicesController;
exports.getInvoiceByIdController = getInvoiceByIdController;
exports.updateInvoiceController = updateInvoiceController;
const bil_service_1 = require("./bil.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createChargeController(req, res) {
    try {
        const body = req.body ?? {};
        if (!body.hospitalId ||
            !body.patientId ||
            !body.type ||
            !body.description ||
            body.unitPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID, patient ID, type, description and unit price are required",
            });
        }
        const charge = await (0, bil_service_1.createCharge)(body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: charge.hospitalId,
            action: "CREATE",
            entityType: "CHARGE",
            entityId: charge.id,
            metadata: {
                amount: charge.amount.toString(),
                type: charge.type,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Charge created successfully",
            data: charge,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                HOSPITAL_NOT_FOUND: [
                    404,
                    "Hospital not found",
                ],
                PATIENT_NOT_FOUND: [
                    404,
                    "Patient not found",
                ],
                ENCOUNTER_NOT_FOUND: [
                    404,
                    "Encounter not found",
                ],
                INVALID_AMOUNT: [
                    400,
                    "Invalid amount",
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
        console.error("Create charge error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getChargesController(_req, res) {
    try {
        const charges = await (0, bil_service_1.getCharges)();
        return res.status(200).json({
            success: true,
            data: charges,
        });
    }
    catch (error) {
        console.error("Get charges error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getChargeByIdController(req, res) {
    try {
        const charge = await (0, bil_service_1.getChargeById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: charge,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "CHARGE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Charge not found",
            });
        }
        console.error("Get charge error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function createInvoiceController(req, res) {
    try {
        const body = req.body ?? {};
        if (!body.hospitalId ||
            !body.patientId ||
            !Array.isArray(body.chargeIds) ||
            body.chargeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID, patient ID and charge IDs are required",
            });
        }
        const invoice = await (0, bil_service_1.createInvoice)(body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: invoice.hospitalId,
            action: "CREATE",
            entityType: "INVOICE",
            entityId: invoice.id,
            metadata: {
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount.toString(),
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            const map = {
                CHARGES_REQUIRED: [
                    400,
                    "At least one charge is required",
                ],
                HOSPITAL_NOT_FOUND: [
                    404,
                    "Hospital not found",
                ],
                PATIENT_NOT_FOUND: [
                    404,
                    "Patient not found",
                ],
                INVALID_CHARGES: [
                    400,
                    "Invalid or already billed charges",
                ],
                CHARGE_ALREADY_INVOICED: [
                    409,
                    "One or more charges are already invoiced",
                ],
                INVALID_AMOUNT: [
                    400,
                    "Invalid amount",
                ],
                INVALID_TOTAL: [
                    400,
                    "Invoice total cannot be negative",
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
        console.error("Create invoice error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getInvoicesController(_req, res) {
    try {
        const invoices = await (0, bil_service_1.getInvoices)();
        return res.status(200).json({
            success: true,
            data: invoices,
        });
    }
    catch (error) {
        console.error("Get invoices error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getInvoiceByIdController(req, res) {
    try {
        const invoice = await (0, bil_service_1.getInvoiceById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: invoice,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "INVOICE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }
        console.error("Get invoice error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateInvoiceController(req, res) {
    try {
        const invoice = await (0, bil_service_1.updateInvoice)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: invoice.hospitalId,
            action: "UPDATE",
            entityType: "INVOICE",
            entityId: invoice.id,
            metadata: {
                status: invoice.status,
                totalAmount: invoice.totalAmount.toString(),
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVOICE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }
            if (error.message === "INVOICE_ALREADY_PAID") {
                return res.status(400).json({
                    success: false,
                    message: "Paid invoice cannot be modified",
                });
            }
            if (error.message === "INVALID_TOTAL") {
                return res.status(400).json({
                    success: false,
                    message: "Invoice total cannot be negative",
                });
            }
        }
        console.error("Update invoice error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
