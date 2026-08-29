"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.getAssignments = getAssignments;
exports.getAssignmentById = getAssignmentById;
exports.updateAssignment = updateAssignment;
exports.deleteAssignment = deleteAssignment;
const prisma_1 = require("../../config/prisma");
async function createAssignment(input) {
    const doctorHospital = await prisma_1.prisma.doctorHospital.findFirst({
        where: {
            id: input.doctorHospitalId,
        },
    });
    if (!doctorHospital) {
        throw new Error("DOCTOR_HOSPITAL_NOT_FOUND");
    }
    if (!doctorHospital.isActive) {
        throw new Error("DOCTOR_HOSPITAL_INACTIVE");
    }
    const department = await prisma_1.prisma.department.findFirst({
        where: {
            id: input.departmentId,
            hospitalId: doctorHospital.hospitalId,
            isActive: true,
        },
    });
    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }
    const specialization = await prisma_1.prisma.specialization.findFirst({
        where: {
            id: input.specializationId,
            isActive: true,
        },
    });
    if (!specialization) {
        throw new Error("SPECIALIZATION_NOT_FOUND");
    }
    const existing = await prisma_1.prisma.doctorDepartmentAssignment.findUnique({
        where: {
            doctorHospitalId_departmentId_specializationId: {
                doctorHospitalId: input.doctorHospitalId,
                departmentId: input.departmentId,
                specializationId: input.specializationId,
            },
        },
    });
    if (existing) {
        throw new Error("ASSIGNMENT_EXISTS");
    }
    if (input.isPrimary === true) {
        await prisma_1.prisma.doctorDepartmentAssignment.updateMany({
            where: {
                doctorHospitalId: input.doctorHospitalId,
                isPrimary: true,
                isActive: true,
            },
            data: {
                isPrimary: false,
            },
        });
    }
    return prisma_1.prisma.doctorDepartmentAssignment.create({
        data: {
            doctorHospitalId: input.doctorHospitalId,
            departmentId: input.departmentId,
            specializationId: input.specializationId,
            isPrimary: input.isPrimary ?? false,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            specialization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
}
async function getAssignments() {
    return prisma_1.prisma.doctorDepartmentAssignment.findMany({
        where: {
            isActive: true,
        },
        include: {
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    hospital: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    hospitalId: true,
                },
            },
            specialization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}
async function getAssignmentById(id) {
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            doctorHospital: {
                include: {
                    doctor: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    hospital: true,
                },
            },
            department: true,
            specialization: true,
        },
    });
    if (!assignment) {
        throw new Error("ASSIGNMENT_NOT_FOUND");
    }
    return assignment;
}
async function updateAssignment(id, input) {
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!assignment) {
        throw new Error("ASSIGNMENT_NOT_FOUND");
    }
    if (input.isPrimary === true) {
        await prisma_1.prisma.doctorDepartmentAssignment.updateMany({
            where: {
                doctorHospitalId: assignment.doctorHospitalId,
                isPrimary: true,
                isActive: true,
                NOT: {
                    id,
                },
            },
            data: {
                isPrimary: false,
            },
        });
    }
    return prisma_1.prisma.doctorDepartmentAssignment.update({
        where: {
            id,
        },
        data: {
            isPrimary: input.isPrimary,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            specialization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
}
async function deleteAssignment(id) {
    const assignment = await prisma_1.prisma.doctorDepartmentAssignment.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
    if (!assignment) {
        throw new Error("ASSIGNMENT_NOT_FOUND");
    }
    return prisma_1.prisma.doctorDepartmentAssignment.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
        include: {
            doctorHospital: {
                select: {
                    hospitalId: true,
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            specialization: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });
}
