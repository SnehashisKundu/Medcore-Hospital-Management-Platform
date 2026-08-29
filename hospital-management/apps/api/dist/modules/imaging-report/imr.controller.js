"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImagingReportController = createImagingReportController;
exports.getImagingReportsController = getImagingReportsController;
exports.getImagingReportByIdController = getImagingReportByIdController;
exports.updateImagingReportController = updateImagingReportController;
const imr_service_1 = require("./imr.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createImagingReportController(req, res) {
    try {
        const body = req.body ?? {};
        const { diagnosticOrderItemId, reportedById, } = body;
        if (!diagnosticOrderItemId || !reportedById) {
            return res.status(400).json({
                success: false,
                message: "Diagnostic order item ID and reporter ID are required",
            });
        }
        const report = await (0, imr_service_1.createImagingReport)(body);
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: report.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
            action: "CREATE",
            entityType: "IMAGING_REPORT",
            entityId: report.id,
            metadata: {
                diagnosticOrderItemId: report.diagnosticOrderItemId,
                reportedById: report.reportedById,
                diagnosticTestId: report.diagnosticOrderItem.diagnosticTestId,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Imaging report created successfully",
            data: report,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message ===
                "DIAGNOSTIC_ORDER_ITEM_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnostic order item not found",
                });
            }
            if (error.message ===
                "IMAGING_REPORT_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Imaging report already exists",
                });
            }
            if (error.message ===
                "INVALID_DIAGNOSTIC_TEST_CATEGORY") {
                return res.status(400).json({
                    success: false,
                    message: "Imaging report can only be created for an imaging diagnostic test",
                });
            }
            if (error.message ===
                "DIAGNOSTIC_TEST_INACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Diagnostic test is inactive",
                });
            }
            if (error.message ===
                "DIAGNOSTIC_ORDER_ITEM_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot create an imaging report for a cancelled diagnostic order item",
                });
            }
            if (error.message === "REPORTER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Reporter not found",
                });
            }
            if (error.message === "INVALID_REPORTED_AT") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reported date",
                });
            }
        }
        console.error("Create imaging report error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getImagingReportsController(_req, res) {
    try {
        const reports = await (0, imr_service_1.getImagingReports)();
        return res.status(200).json({
            success: true,
            data: reports,
        });
    }
    catch (error) {
        console.error("Get imaging reports error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getImagingReportByIdController(req, res) {
    try {
        const report = await (0, imr_service_1.getImagingReportById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "IMAGING_REPORT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Imaging report not found",
            });
        }
        console.error("Get imaging report error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateImagingReportController(req, res) {
    try {
        const report = await (0, imr_service_1.updateImagingReport)(req.params.id, req.body ?? {});
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: report.diagnosticOrderItem.diagnosticOrder.encounter.hospitalId,
            action: "UPDATE",
            entityType: "IMAGING_REPORT",
            entityId: report.id,
            metadata: {
                diagnosticOrderItemId: report.diagnosticOrderItemId,
                reportedById: report.reportedById,
                diagnosticTestId: report.diagnosticOrderItem.diagnosticTestId,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Imaging report updated successfully",
            data: report,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "IMAGING_REPORT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Imaging report not found",
                });
            }
            if (error.message === "NO_UPDATE_DATA") {
                return res.status(400).json({
                    success: false,
                    message: "At least one field must be provided for update",
                });
            }
            if (error.message === "INVALID_FINDINGS") {
                return res.status(400).json({
                    success: false,
                    message: "Findings cannot be empty",
                });
            }
            if (error.message === "INVALID_IMPRESSION") {
                return res.status(400).json({
                    success: false,
                    message: "Impression cannot be empty",
                });
            }
            if (error.message === "INVALID_CONCLUSION") {
                return res.status(400).json({
                    success: false,
                    message: "Conclusion cannot be empty",
                });
            }
            if (error.message === "INVALID_REPORTED_AT") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reported date",
                });
            }
        }
        console.error("Update imaging report error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
