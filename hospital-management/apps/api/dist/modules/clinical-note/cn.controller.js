"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClinicalNoteController = createClinicalNoteController;
exports.getClinicalNotesController = getClinicalNotesController;
exports.getClinicalNoteByIdController = getClinicalNoteByIdController;
exports.updateClinicalNoteController = updateClinicalNoteController;
const cn_service_1 = require("./cn.service");
const aud_service_1 = require("../audit-log/aud.service");
async function createClinicalNoteController(req, res) {
    try {
        const { encounterId, createdById, noteType, content, } = req.body;
        if (!encounterId ||
            !createdById ||
            !noteType ||
            !content) {
            return res.status(400).json({
                success: false,
                message: "Encounter ID, creator ID, note type and content are required",
            });
        }
        const note = await (0, cn_service_1.createClinicalNote)(req.body);
        // Get encounter with hospital context
        const noteWithEncounter = await (0, cn_service_1.getClinicalNoteById)(note.id);
        // Audit CREATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: noteWithEncounter.encounter.hospitalId,
            action: "CREATE",
            entityType: "CLINICAL_NOTE",
            entityId: note.id,
            metadata: {
                encounterId: note.encounterId,
                noteType: note.noteType,
                content: note.content,
                createdById: note.createdById,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(201).json({
            success: true,
            message: "Clinical note created successfully",
            data: note,
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
                    message: "Cannot add clinical note to a cancelled encounter",
                });
            }
            if (error.message === "CREATOR_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Creator user not found",
                });
            }
        }
        console.error("Create clinical note error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getClinicalNotesController(_req, res) {
    try {
        const notes = await (0, cn_service_1.getClinicalNotes)();
        return res.status(200).json({
            success: true,
            data: notes,
        });
    }
    catch (error) {
        console.error("Get clinical notes error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getClinicalNoteByIdController(req, res) {
    try {
        const note = await (0, cn_service_1.getClinicalNoteById)(req.params.id);
        return res.status(200).json({
            success: true,
            data: note,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "CLINICAL_NOTE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Clinical note not found",
            });
        }
        console.error("Get clinical note error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateClinicalNoteController(req, res) {
    try {
        const note = await (0, cn_service_1.updateClinicalNote)(req.params.id, req.body);
        // Get encounter with hospital context
        const noteWithEncounter = await (0, cn_service_1.getClinicalNoteById)(note.id);
        // Audit UPDATE
        await (0, aud_service_1.createAuditLog)({
            userId: req.user?.id,
            hospitalId: noteWithEncounter.encounter.hospitalId,
            action: "UPDATE",
            entityType: "CLINICAL_NOTE",
            entityId: note.id,
            metadata: {
                encounterId: note.encounterId,
                noteType: note.noteType,
                content: note.content,
                createdById: note.createdById,
            },
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        return res.status(200).json({
            success: true,
            message: "Clinical note updated successfully",
            data: note,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "CLINICAL_NOTE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Clinical note not found",
                });
            }
            if (error.message === "ENCOUNTER_CANCELLED") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot update clinical note of a cancelled encounter",
                });
            }
        }
        console.error("Update clinical note error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
