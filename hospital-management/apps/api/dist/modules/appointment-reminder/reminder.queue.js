"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentReminderQueue = void 0;
exports.scheduleAppointmentReminders = scheduleAppointmentReminders;
exports.cancelAppointmentReminders = cancelAppointmentReminders;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../config/redis");
exports.appointmentReminderQueue = new bullmq_1.Queue("appointment-reminders", {
    connection: redis_1.redisConnection,
});
async function scheduleAppointmentReminders(appointmentId, scheduledStart) {
    const now = Date.now();
    const appointmentTime = scheduledStart.getTime();
    const reminders = [
        {
            reminderType: "24_HOURS",
            delay: appointmentTime - now - 24 * 60 * 60 * 1000,
        },
        {
            reminderType: "1_HOUR",
            delay: appointmentTime - now - 60 * 60 * 1000,
        },
    ];
    for (const reminder of reminders) {
        if (reminder.delay <= 0) {
            continue;
        }
        await exports.appointmentReminderQueue.add("send-appointment-reminder", {
            appointmentId,
            reminderType: reminder.reminderType,
        }, {
            jobId: `${appointmentId}-${reminder.reminderType}`,
            delay: reminder.delay,
            removeOnComplete: true,
            removeOnFail: 100,
        });
    }
}
async function cancelAppointmentReminders(appointmentId) {
    const reminderTypes = ["24_HOURS", "1_HOUR"];
    for (const reminderType of reminderTypes) {
        const job = await exports.appointmentReminderQueue.getJob(`${appointmentId}-${reminderType}`);
        if (job) {
            await job.remove();
        }
    }
}
