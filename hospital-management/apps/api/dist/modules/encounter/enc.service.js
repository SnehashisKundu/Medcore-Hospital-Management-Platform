"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEncounter = createEncounter;
exports.getEncounters = getEncounters;
exports.getEncounterById = getEncounterById;
exports.updateEncounter = updateEncounter;
exports.deleteEncounter = deleteEncounter;
const prisma_1 = require("../../config/prisma");
async function createEncounter(input) {
    // 1. Check hospital
    const hospital = await prisma_1.prisma.hospital.findFirst({
        where: {
            id: input.hospitalId,
            isActive: true,
        },
    });
    if (!hospital) {
        throw new Error("HOSPITAL_NOT_FOUND");
    }
    // 2. Check patient
    const patient = await prisma_1.prisma.patient.findFirst({
        where: {
            id: input.patientId,
            isActive: true,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    // 3. If appointment is provided, check it
    if (input.appointmentId) {
        const appointment = await prisma_1.prisma.appointment.findFirst({
            where: {
                id: input.appointmentId,
                hospitalId: input.hospitalId,
                patientId: input.patientId,
                deletedAt: null,
            },
        });
        if (!appointment) {
            throw new Error("APPOINTMENT_NOT_FOUND");
        }
        const existingEncounterForAppointment = await prisma_1.prisma.encounter.findUnique({
            where: {
                appointmentId: input.appointmentId,
            },
        });
        if (existingEncounterForAppointment) {
            throw new Error("ENCOUNTER_ALREADY_EXISTS_FOR_APPOINTMENT");
        }
    }
    if (input.emergencyCaseId) {
        const existingEncounterForEmergencyCase = await prisma_1.prisma.encounter.findUnique({
            where: {
                emergencyCaseId: input.emergencyCaseId,
            },
        });
        if (existingEncounterForEmergencyCase) {
            throw new Error("ENCOUNTER_ALREADY_EXISTS_FOR_EMERGENCY_CASE");
        }
    }
    // 4. Check DoctorHospital if provided
    if (input.doctorHospitalId) {
        const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
            where: {
                id: input.doctorHospitalId,
                hospitalId: input.hospitalId,
                isActive: true,
            },
        });
        if (!doctorHospital) {
            throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
        }
    }
    // 5. Check DoctorDepartmentAssignment if provided
    if (input.doctorDepartmentAssignmentId) {
        const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
            where: {
                id: input.doctorDepartmentAssignmentId,
                isActive: true,
                ...(input.doctorHospitalId
                    ? {
                        doctorHospitalId: input.doctorHospitalId,
                    }
                    : {}),
            },
        });
        if (!assignment) {
            throw new Error("DOCTOR_ASSIGNMENT_NOT_FOUND");
        }
    }
    // 6. Check duplicate encounter number
    const existing = await prisma_1.prisma.encounter.findFirst({
        where: {
            hospitalId: input.hospitalId,
            encounterNumber: input.encounterNumber.trim(),
        },
    });
    if (existing) {
        throw new Error("ENCOUNTER_NUMBER_EXISTS");
    }
    // 7. Create encounter
    return prisma_1.prisma.encounter.create({
        data: {
            hospitalId: input.hospitalId,
            patientId: input.patientId,
            appointmentId: input.appointmentId,
            emergencyCaseId: input.emergencyCaseId,
            doctorHospitalId: input.doctorHospitalId,
            doctorDepartmentAssignmentId: input.doctorDepartmentAssignmentId,
            encounterNumber: input.encounterNumber.trim(),
            consultationType: input.consultationType,
            chiefComplaint: input.chiefComplaint?.trim(),
            remarks: input.remarks?.trim(),
            startedAt: input.startedAt
                ? new Date(input.startedAt)
                : undefined,
            followUpRequired: input.followUpRequired ?? false,
            followUpAfterDays: input.followUpAfterDays,
        },
    });
}
async function getEncounters() {
    return prisma_1.prisma.encounter.findMany({
        include: {
            patient: true,
            hospital: true,
            appointment: true,
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
            doctorDepartmentAssignment: {
                include: {
                    department: true,
                    specialization: true,
                },
            },
        },
        orderBy: {
            startedAt: "desc",
        },
    });
}
async function getEncounterById(id) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id,
        },
        include: {
            patient: true,
            hospital: true,
            appointment: true,
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
            doctorDepartmentAssignment: {
                include: {
                    department: true,
                    specialization: true,
                },
            },
            vitals: true,
            diagnoses: true,
            clinicalNotes: true,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    return encounter;
}
async function updateEncounter(id, input) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    return prisma_1.prisma.encounter.update({
        where: {
            id,
        },
        data: {
            status: input.status,
            chiefComplaint: input.chiefComplaint?.trim(),
            remarks: input.remarks?.trim(),
            endedAt: input.endedAt
                ? new Date(input.endedAt)
                : undefined,
            followUpRequired: input.followUpRequired,
            followUpAfterDays: input.followUpAfterDays,
        },
    });
}
async function deleteEncounter(id) {
    const encounter = await prisma_1.prisma.encounter.findUnique({
        where: {
            id,
        },
    });
    if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND");
    }
    return prisma_1.prisma.encounter.update({
        where: {
            id,
        },
        data: {
            status: "CANCELLED",
            endedAt: new Date(),
        },
    });
}
