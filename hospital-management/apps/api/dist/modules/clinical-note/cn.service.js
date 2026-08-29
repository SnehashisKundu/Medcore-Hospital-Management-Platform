"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClinicalNote = createClinicalNote;
exports.getClinicalNotes = getClinicalNotes;
exports.getClinicalNoteById = getClinicalNoteById;
exports.updateClinicalNote = updateClinicalNote;
const prisma_1 = require("../../config/prisma");
async function createClinicalNote(input) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id: input.encounterId,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    if (encounter.status === "CANCELLED") {
        throw new Error("ENCOUNTER_CANCELLED");
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: input.createdById,
        },
    });
    if (!user) {
        throw new Error("CREATOR_NOT_FOUND");
    }
    return prisma_1.prisma.encounterClinicalNote.create({
        data: {
            encounterId: input.encounterId,
            createdById: input.createdById,
            noteType: input.noteType,
            content: input.content.trim(),
        },
    });
}
async function getClinicalNotes() {
    return prisma_1.prisma.encounterClinicalNote.findMany({
        include: {
            encounter: true,
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getClinicalNoteById(id) {
    const note = await prisma_1.prisma.encounterClinicalNote.findUnique({
        where: {
            id,
        },
        include: {
            encounter: true,
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    if (!note) {
        throw new Error("CLINICAL_NOTE_NOT_FOUND");
    }
    return note;
}
async function updateClinicalNote(id, input) {
    const note = await prisma_1.prisma.encounterClinicalNote.findUnique({
        where: {
            id,
        },
        include: {
            encounter: true,
        },
    });
    if (!note) {
        throw new Error("CLINICAL_NOTE_NOT_FOUND");
    }
    if (note.encounter.status === "CANCELLED") {
        throw new Error("ENCOUNTER_CANCELLED");
    }
    return prisma_1.prisma.encounterClinicalNote.update({
        where: {
            id,
        },
        data: {
            noteType: input.noteType,
            content: input.content?.trim(),
        },
    });
}
