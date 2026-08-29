"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosticTestController = createDiagnosticTestController;
exports.getDiagnosticTestsController = getDiagnosticTestsController;
exports.getDiagnosticTestByIdController = getDiagnosticTestByIdController;
exports.updateDiagnosticTestController = updateDiagnosticTestController;
const dgt_service_1 = require("./dgt.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createDiagnosticTestController(req, res) {
    try {
        const { name, code, category } = req.body ?? {};
        if (!name || !code || !category) {
            return res.status(400).json({
                success: false,
                message: "Name, code and category are required",
            });
        }
        const test = await (0, dgt_service_1.createDiagnosticTest)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "DIAGNOSTIC_TEST",
            entityId: test.id,
            metadata: {
                name: test.name,
                code: test.code,
                category: test.category,
                isActive: test.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Diagnostic test created successfully",
            data: test,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DIAGNOSTIC_TEST_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Diagnostic test already exists",
            });
        }
        console.error("Create diagnostic test error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosticTestsController(_req, res) {
    try {
        const tests = await (0, dgt_service_1.getDiagnosticTests)();
        return res.status(200).json({
            success: true,
            data: tests,
        });
    }
    catch (error) {
        console.error("Get diagnostic tests error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getDiagnosticTestByIdController(req, res) {
    try {
        const test = await (0, dgt_service_1.getDiagnosticTestById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: test,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "DIAGNOSTIC_TEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Diagnostic test not found",
            });
        }
        console.error("Get diagnostic test error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateDiagnosticTestController(req, res) {
    try {
        const test = await (0, dgt_service_1.updateDiagnosticTest)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "DIAGNOSTIC_TEST",
            entityId: test.id,
            metadata: {
                name: test.name,
                code: test.code,
                category: test.category,
                isActive: test.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Diagnostic test updated successfully",
            data: test,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "DIAGNOSTIC_TEST_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Diagnostic test not found",
                });
            }
            if (error.message === "DIAGNOSTIC_TEST_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Diagnostic test already exists",
                });
            }
        }
        console.error("Update diagnostic test error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
