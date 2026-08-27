import { prisma } from "../../config/prisma";
import type { NotificationType } from "../../generated/prisma/client";
import { sendEmail } from "./email.service";
import { sendSms } from "./sms.service";

interface SendPatientNotificationInput {
  patientId: string;

  type: NotificationType;

  subject: string;
  message: string;

  referenceType?: string;
  referenceId?: string;
}

export async function sendPatientNotification({
  patientId,
  type,
  subject,
  message,
  referenceType,
  referenceId,
}: SendPatientNotificationInput) {
  const patient = await prisma.patient.findUnique({
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

  const notification = await prisma.notification.create({
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
      await sendEmail({
        to: email,
        subject,
        message,
      });

      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          emailStatus: "SENT",
          emailSentAt: new Date(),
          emailError: null,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown email error";

      await prisma.notification.update({
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
      await sendSms({
        to: phone,
        message,
      });

      await prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          smsStatus: "SENT",
          smsSentAt: new Date(),
          smsError: null,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown SMS error";

      await prisma.notification.update({
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

  return prisma.notification.findUnique({
    where: {
      id: notification.id,
    },
  });
}