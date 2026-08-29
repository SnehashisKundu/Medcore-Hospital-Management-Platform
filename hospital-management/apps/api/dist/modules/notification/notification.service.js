"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPatientNotification = sendPatientNotification;
const prisma_1 = require("../../config/prisma");
const socket_1 = require("../../config/socket");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
async function sendPatientNotification({ patientId, type, subject, message, referenceType, referenceId, }) {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            user: {
                select: {
                    email: true,
                    phone: true,
                },
            },
        },
    });
    if (!patient) {
        throw new Error("Patient not found");
    }
    const email = patient.email || patient.user?.email || null;
    const phone = patient.phone || patient.user?.phone || null;
    const notification = await prisma_1.prisma.notification.create({
        data: {
            patientId,
            type,
            subject,
            message,
            emailStatus: email
                ? "PENDING"
                : "SKIPPED",
            smsStatus: phone
                ? "PENDING"
                : "SKIPPED",
            referenceType,
            referenceId,
        },
    });
    if (email) {
        try {
            await (0, email_service_1.sendEmail)({
                to: email,
                subject,
                message,
            });
            await prisma_1.prisma.notification.update({
                where: {
                    id: notification.id,
                },
                data: {
                    emailStatus: "SENT",
                    emailSentAt: new Date(),
                    emailError: null,
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown email error";
            await prisma_1.prisma.notification.update({
                where: {
                    id: notification.id,
                },
                data: {
                    emailStatus: "FAILED",
                    emailError: errorMessage,
                },
            });
        }
    }
    if (phone) {
        try {
            await (0, sms_service_1.sendSms)({
                to: phone,
                message,
            });
            await prisma_1.prisma.notification.update({
                where: {
                    id: notification.id,
                },
                data: {
                    smsStatus: "SENT",
                    smsSentAt: new Date(),
                    smsError: null,
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Unknown SMS error";
            await prisma_1.prisma.notification.update({
                where: {
                    id: notification.id,
                },
                data: {
                    smsStatus: "FAILED",
                    smsError: errorMessage,
                },
            });
        }
    }
    const savedNotification = await prisma_1.prisma.notification.findUnique({
        where: {
            id: notification.id,
        },
    });
    if (savedNotification) {
        (0, socket_1.getIO)().emit("notification:new", savedNotification);
    }
    return savedNotification;
}
