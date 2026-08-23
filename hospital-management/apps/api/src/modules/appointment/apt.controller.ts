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
    } = req.body;

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

    const appointment = await createAppointment(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId: appointment.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      metadata: {
        appointmentNumber: appointment.appointmentNumber,
        type: appointment.type,
        status: appointment.status,
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
    if (
      error instanceof Error &&
      error.message === "HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor is not assigned to this hospital",
      });
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor department assignment not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "APPOINTMENT_NUMBER_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Appointment number already exists",
      });
    }

    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    if (
      error instanceof Error &&
      error.message === "APPOINTMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    console.error("Get appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateAppointmentController(
  req: AuthRequest,
  res: Response
) {
  try {
    const appointment = await updateAppointment(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: appointment.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      metadata: {
        appointmentNumber: appointment.appointmentNumber,
        type: appointment.type,
        status: appointment.status,
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
    if (
      error instanceof Error &&
      error.message === "APPOINTMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    console.error("Update appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
        appointmentNumber: appointment.appointmentNumber,
        status: appointment.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "APPOINTMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    console.error("Delete appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}