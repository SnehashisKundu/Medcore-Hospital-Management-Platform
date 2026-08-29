"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentReminderWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../config/redis");
const prisma_1 = require("../../config/prisma");
const notification_service_1 = require("../notification/notification.service");
exports.appointmentReminderWorker = new bullmq_1.Worker("appointment-reminders", async (job) => {
    const { appointmentId, reminderType, } = job.data;
    const appointment = await prisma_1.prisma.appointment.findUnique({
        where: {
            id: appointmentId,
        },
        select: {
            id: true,
            patientId: true,
            appointmentNumber: true,
            scheduledStart: true,
            status: true,
            deletedAt: true,
        },
    });
    if (!appointment) {
        return;
    }
    if (appointment.deletedAt) {
        return;
    }
    if (appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED") {
        return;
    }
    const reminderLabel = reminderType === "24_HOURS"
        ? "24 hours"
        : "1 hour";
    await (0, notification_service_1.sendPatientNotification)({
        patientId: appointment.patientId,
        type: "APPOINTMENT_REMINDER",
        subject: "Appointment Reminder",
        message: `Reminder: Your appointment (${appointment.appointmentNumber}) ` +
            `is scheduled in approximately ${reminderLabel}.`,
        referenceType: "APPOINTMENT",
        referenceId: appointment.id,
    });
}, {
    connection: redis_1.redisConnection,
});
exports.appointmentReminderWorker.on("completed", (job) => {
    console.log(`Appointment reminder completed: ${job.id}`);
});
exports.appointmentReminderWorker.on("failed", (job, error) => {
    console.error(`Appointment reminder failed: ${job?.id}`, error);
});
