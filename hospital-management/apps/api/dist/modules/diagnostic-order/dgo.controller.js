"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosticOrderController = createDiagnosticOrderController;
exports.getDiagnosticOrdersController = getDiagnosticOrdersController;
exports.getDiagnosticOrderByIdController = getDiagnosticOrderByIdController;
exports.updateDiagnosticOrderController = updateDiagnosticOrderController;
exports.updateDiagnosticOrderItemController = updateDiagnosticOrderItemController;
const dgo_service_1 = require("./dgo.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDiagnosticOrderController(req, res) {
    try {
        const body = req.body ?? {};
        const { encounterId, orderedById, items, } = body;
        if (!encounterId ||
            !orderedById ||
            !Array.isArray(items) ||
            items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Encounter ID, ordered by ID and at least one diagnostic item are required",
            });
        }
        const order = await (0, dgo_service_1.createDiagnosticOrder)(body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: order.encounter.hospitalId,
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DIAGNOSTIC_ORDER",
            entityId: order.id,
            metadata: {
                encounterId: order.encounterId,
                orderedById: order.orderedById,
                clinicalNotes: order.clinicalNotes,
                itemCount: order.items.length,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Diagnostic order created successfully",
            data: order,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "ENCOUNTER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Encounter not found",
                });
            }
            if (error.message === "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot create diagnostic order for a cancelled encounter",
                });
            }
            if (error.message === "ORDERED_BY_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Ordering doctor not found",
                });
            }
            if (error.message === "DIAGNOSTIC_ITEMS_REQUIRED") {
                return res.status(400).json({
                    success: false,
                    message: "At least one diagnostic test is required",
                });
            }
            if (error.message === "DIAGNOSTIC_TEST_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnostic test not found",
                });
            }
            if (error.message === "DIAGNOSTIC_TEST_INACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Diagnostic test is inactive",
                });
            }
        }
        console.error("Create diagnostic order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosticOrdersController(_req, res) {
    try {
        const orders = await (0, dgo_service_1.getDiagnosticOrders)();
        return res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        console.error("Get diagnostic orders error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosticOrderByIdController(req, res) {
    try {
        const order = await (0, dgo_service_1.getDiagnosticOrderById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DIAGNOSTIC_ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Diagnostic order not found",
            });
        }
        console.error("Get diagnostic order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDiagnosticOrderController(req, res) {
    try {
        const order = await (0, dgo_service_1.updateDiagnosticOrder)(req.params.id, req.body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: order.encounter.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DIAGNOSTIC_ORDER",
            entityId: order.id,
            metadata: {
                clinicalNotes: order.clinicalNotes,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Diagnostic order updated successfully",
            data: order,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "DIAGNOSTIC_ORDER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnostic order not found",
                });
            }
            if (error.message === "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot update diagnostic order of a cancelled encounter",
                });
            }
        }
        console.error("Update diagnostic order error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDiagnosticOrderItemController(req, res) {
    try {
        const item = await (0, dgo_service_1.updateDiagnosticOrderItem)(req.params.id, req.body);
        await (0, aud_service_1.createAuditLog)({
            hospitalId: item.diagnosticOrder.encounter.hospitalId,
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DIAGNOSTIC_ORDER_ITEM",
            entityId: item.id,
            metadata: {
                diagnosticOrderId: item.diagnosticOrderId,
                diagnosticTestId: item.diagnosticTestId,
                status: item.status,
                scheduledAt: item.scheduledAt,
                sampleCollectedAt: item.sampleCollectedAt,
                startedAt: item.startedAt,
                completedAt: item.completedAt,
                instructions: item.instructions,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Diagnostic order item updated successfully",
            data: item,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "DIAGNOSTIC_ORDER_ITEM_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Diagnostic order item not found",
            });
        }
        console.error("Update diagnostic order item error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
