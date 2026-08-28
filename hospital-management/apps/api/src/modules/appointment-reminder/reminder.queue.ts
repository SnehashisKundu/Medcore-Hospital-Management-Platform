import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

export interface AppointmentReminderJob {
  appointmentId: string;
  reminderType: "24_HOURS" | "1_HOUR";
}

export const appointmentReminderQueue =
  new Queue<AppointmentReminderJob>(
    "appointment-reminders",
    {
      connection: redisConnection,
    }
  );

export async function scheduleAppointmentReminders(
  appointmentId: string,
  scheduledStart: Date
) {
  const now = Date.now();
  const appointmentTime = scheduledStart.getTime();

  const reminders = [
    {
      reminderType: "24_HOURS" as const,
      delay: appointmentTime - now - 24 * 60 * 60 * 1000,
    },
    {
      reminderType: "1_HOUR" as const,
      delay: appointmentTime - now - 60 * 60 * 1000,
    },
  ];

  for (const reminder of reminders) {
    if (reminder.delay <= 0) {
      continue;
    }

    await appointmentReminderQueue.add(
      "send-appointment-reminder",
      {
        appointmentId,
        reminderType: reminder.reminderType,
      },
      {
        jobId: `${appointmentId}-${reminder.reminderType}`,
        delay: reminder.delay,
        removeOnComplete: true,
        removeOnFail: 100,
      }
    );
  }
}

export async function cancelAppointmentReminders(
  appointmentId: string
) {
  const reminderTypes = ["24_HOURS", "1_HOUR"];

  for (const reminderType of reminderTypes) {
    const job = await appointmentReminderQueue.getJob(
      `${appointmentId}-${reminderType}`
    );

    if (job) {
      await job.remove();
    }
  }
}