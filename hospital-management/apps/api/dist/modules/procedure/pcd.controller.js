"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcedureController = createProcedureController;
exports.getProceduresController = getProceduresController;
exports.getProcedureByIdController = getProcedureByIdController;
exports.updateProcedureController = updateProcedureController;
exports.deleteProcedureController = deleteProcedureController;
const pcd_service_1 = require("./pcd.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createProcedureController(req, res) {
    try {
        const { name, code, category, description } = req.body;
        if (!name || !code || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, code and category are required",
            });
        }
        const procedure = await (0, pcd_service_1.createProcedure)(name, code, category, description);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "PROCEDURE",
            entityId: procedure.id,
            metadata: {
                name: procedure.name,
                code: procedure.code,
                category: procedure.category,
                description: procedure.description,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Procedure created successfully",
            data: procedure,
        });
    }
    catch (error) {
        console.error("Create procedure error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create procedure",
        });
    }
}
async function getProceduresController(_req, res) {
    try {
        const procedures = await (0, pcd_service_1.getProcedures)();
        return res.status(200).json({
            success: true,
            data: procedures,
        });
    }
    catch (error) {
        console.error("Get procedures error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getProcedureByIdController(req, res) {
    try {
        const procedure = await (0, pcd_service_1.getProcedureById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: procedure,
        });
    }
    catch (error) {
        console.error("Get procedure error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Procedure not found",
        });
    }
}
async function updateProcedureController(req, res) {
    try {
        const { name, code, category, description } = req.body;
        const procedure = await (0, pcd_service_1.updateProcedure)(req.params.id, name, code, category, description);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "PROCEDURE",
            entityId: procedure.id,
            metadata: {
                name: procedure.name,
                code: procedure.code,
                category: procedure.category,
                description: procedure.description,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Procedure updated successfully",
            data: procedure,
        });
    }
    catch (error) {
        console.error("Update procedure error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update procedure",
        });
    }
}
async function deleteProcedureController(req, res) {
    try {
        const procedure = await (0, pcd_service_1.deleteProcedure)(req.params.id);
        // Audit DELETE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "DELETE",
            entityType: "PROCEDURE",
            entityId: procedure.id,
            metadata: {
                name: procedure.name,
                code: procedure.code,
                category: procedure.category,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Procedure deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete procedure error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Procedure not found",
        });
    }
}
