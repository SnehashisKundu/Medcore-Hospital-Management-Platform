"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicineController = createMedicineController;
exports.getMedicinesController = getMedicinesController;
exports.getMedicineByIdController = getMedicineByIdController;
exports.updateMedicineController = updateMedicineController;
const med_service_1 = require("./med.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createMedicineController(req, res) {
    try {
        const { name, genericName, strength, dosageForm, } = req.body ?? {};
        if (!name || !strength || !dosageForm) {
            return res.status(400).json({
                success: false,
                message: "Name, strength and dosage form are required",
            });
        }
        const medicine = await (0, med_service_1.createMedicine)(req.body);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "CREATE",
            entityType: "MEDICINE",
            entityId: medicine.id,
            metadata: {
                name: medicine.name,
                genericName: medicine.genericName,
                strength: medicine.strength,
                dosageForm: medicine.dosageForm,
                isActive: medicine.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Medicine created successfully",
            data: medicine,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "MEDICINE_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Medicine already exists",
            });
        }
        console.error("Create medicine error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getMedicinesController(_req, res) {
    try {
        const medicines = await (0, med_service_1.getMedicines)();
        return res.status(200).json({
            success: true,
            data: medicines,
        });
    }
    catch (error) {
        console.error("Get medicines error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getMedicineByIdController(req, res) {
    try {
        const medicine = await (0, med_service_1.getMedicineById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: medicine,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "MEDICINE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }
        console.error("Get medicine error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateMedicineController(req, res) {
    try {
        const medicine = await (0, med_service_1.updateMedicine)(req.params.id, req.body ?? {});
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            action: "UPDATE",
            entityType: "MEDICINE",
            entityId: medicine.id,
            metadata: {
                name: medicine.name,
                genericName: medicine.genericName,
                strength: medicine.strength,
                dosageForm: medicine.dosageForm,
                isActive: medicine.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Medicine updated successfully",
            data: medicine,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "MEDICINE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Medicine not found",
                });
            }
            if (error.message === "MEDICINE_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Medicine already exists",
                });
            }
        }
        console.error("Update medicine error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
