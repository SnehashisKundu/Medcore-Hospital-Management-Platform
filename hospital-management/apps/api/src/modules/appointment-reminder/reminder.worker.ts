import { Worker } from "bullmq";

import { redisConnection } from "../../config/redis";
import { prisma } from "../../config/prisma";
import { sendPatientNotification } from "../notification/notification.service";

import type { AppointmentReminderJob } from "./reminder.queue";

export const appointmentReminderWorker =
  new Worker<AppointmentReminderJob>(
    "appointment-reminders",
    async (job) => {
      const {
        appointmentId,
        reminderType,
      } = job.data;

      const appointment =
        await prisma.appointment.findUnique({
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

      if (
        appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED"
      ) {
        return;
      }

      const reminderLabel =
        reminderType === "24_HOURS"
          ? "24 hours"
          : "1 hour";

      await sendPatientNotification({
        patientId: appointment.patientId,
        type: "APPOINTMENT_REMINDER",
        subject: "Appointment Reminder",
        message:
          `Reminder: Your appointment (${appointment.appointmentNumber}) ` +
          `is scheduled in approximately ${reminderLabel}.`,
        referenceType: "APPOINTMENT",
        referenceId: appointment.id,
      });
    },
    {
      connection: redisConnection,
    }
  );

appointmentReminderWorker.on(
  "completed",
  (job) => {
    console.log(
      `Appointment reminder completed: ${job.id}`
    );
  }
);

appointmentReminderWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `Appointment reminder failed: ${job?.id}`,
      error
    );
  }
);