import { Request, Response } from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "./apt.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const appointmentErrorMap: Record<
  string,
  [number, string]
> = {
  HOSPITAL_NOT_FOUND: [404, "Hospital not found"],

  PATIENT_NOT_FOUND: [404, "Patient not found"],

  DOCTOR_HOSPITAL_NOT_FOUND: [
    404,
    "Doctor is not assigned to this hospital",
  ],

  DOCTOR_ASSIGNMENT_NOT_FOUND: [
    404,
    "Doctor department assignment not found",
  ],

  APPOINTMENT_NOT_FOUND: [
    404,
    "Appointment not found",
  ],

  APPOINTMENT_NUMBER_EXISTS: [
    409,
    "Appointment number already exists",
  ],

  INVALID_APPOINTMENT_DATE: [
    400,
    "Invalid appointment date format",
  ],

  INVALID_APPOINTMENT_RANGE: [
    400,
    "Appointment end time must be later than start time",
  ],

  APPOINTMENT_MUST_BE_SAME_DAY: [
    400,
    "Appointment must start and end on the same day",
  ],

  DOCTOR_NOT_AVAILABLE_ON_DAY: [
    409,
    "Doctor is not available on the selected day",
  ],

  INVALID_DOCTOR_SCHEDULE_SLOT: [
    409,
    "Selected appointment time is not a valid doctor schedule slot",
  ],

  DOCTOR_ON_LEAVE: [
    409,
    "Doctor is on leave during the selected appointment time",
  ],

  APPOINTMENT_SLOT_ALREADY_BOOKED: [
    409,
    "Doctor already has an appointment during the selected time slot",
  ],
};

function handleAppointmentError(
  error: unknown,
  res: Response,
  label: string
) {
  if (
    error instanceof Error &&
    appointmentErrorMap[error.message]
  ) {
    const [status, message] =
      appointmentErrorMap[error.message];

    return res.status(status).json({
      success: false,
      message,
    });
  }

  console.error(`${label}:`, error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function createAppointmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      hospitalId,
      patientId,
      doctorHospitalId,
      doctorDepartmentAssignmentId,
      appointmentNumber,
      scheduledStart,
      scheduledEnd,
    } = req.body ?? {};

    if (
      !hospitalId ||
      !patientId ||
      !doctorHospitalId ||
      !doctorDepartmentAssignmentId ||
      !appointmentNumber ||
      !scheduledStart ||
      !scheduledEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "Required appointment fields are missing",
      });
    }

    const appointment = await createAppointment(
      req.body
    );

    // Audit CREATE
    await createAuditLog({
      hospitalId: appointment.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      metadata: {
        appointmentNumber:
          appointment.appointmentNumber,
        type: appointment.type,
        status: appointment.status,
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    return handleAppointmentError(
      error,
      res,
      "Create appointment error"
    );
  }
}

export async function getAppointmentsController(
  _req: Request,
  res: Response
) {
  try {
    const appointments = await getAppointments();

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return handleAppointmentError(
      error,
      res,
      "Get appointments error"
    );
  }
}

export async function getAppointmentByIdController(
  req: Request,
  res: Response
) {
  try {
    const appointment = await getAppointmentById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return handleAppointmentError(
      error,
      res,
      "Get appointment error"
    );
  }
}

export async function updateAppointmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const appointment = await updateAppointment(
      req.params.id as string,
      req.body ?? {}
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: appointment.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      metadata: {
        appointmentNumber:
          appointment.appointmentNumber,
        type: appointment.type,
        priority: appointment.priority,
        status: appointment.status,
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    return handleAppointmentError(
      error,
      res,
      "Update appointment error"
    );
  }
}

export async function deleteAppointmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const appointment = await deleteAppointment(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId: appointment.hospitalId,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      metadata: {
        appointmentNumber:
          appointment.appointmentNumber,
        type: appointment.type,
        status: appointment.status,
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    return handleAppointmentError(
      error,
      res,
      "Delete appointment error"
    );
  }
}