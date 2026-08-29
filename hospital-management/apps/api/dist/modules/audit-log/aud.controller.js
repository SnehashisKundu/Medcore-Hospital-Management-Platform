"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogsController = getAuditLogsController;
exports.getAuditLogByIdController = getAuditLogByIdController;
const aud_service_1 = require("./aud.service");
async function getAuditLogsController(req, res) {
    try {
        const logs = await (0, aud_service_1.getAuditLogs)();
        return res.status(200).json({
            success: true,
            data: logs,
        });
    }
    catch (error) {
        console.error("Get audit logs error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAuditLogByIdController(req, res) {
    try {
        const { id } = req.params;
        const auditLog = await (0, aud_service_1.getAuditLogById)(Array.isArray(id) ? id[0] : id);
        return res.status(200).json({
            success: true,
            data: auditLog,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "AUDIT_LOG_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Audit log not found",
            });
        }
        console.error("Get audit log error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
