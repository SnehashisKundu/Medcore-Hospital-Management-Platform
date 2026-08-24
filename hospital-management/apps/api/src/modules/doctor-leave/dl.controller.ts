import { Request, Response } from "express";

import {
  createDoctorLeave,
  getDoctorLeaves,
  getDoctorLeaveById,
  updateDoctorLeave,
} from "./dl.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const errorMap: Record<string, [number, string]> = {
  INVALID_DATE: [400, "Invalid date format"],
  INVALID_LEAVE_RANGE: [
    400,
    "Leave end date must be later than start date",
  ],
  DOCTOR_HOSPITAL_NOT_FOUND: [
    404,
    "Active doctor hospital assignment not found",
  ],
  DOCTOR_LEAVE_NOT_FOUND: [404, "Doctor leave not found"],
  DOCTOR_LEAVE_CONFLICT: [
    409,
    "Doctor leave conflicts with an existing leave period",
  ],
};

function handleError(
  error: unknown,
  res: Response,
  label: string
) {
  if (error instanceof Error && errorMap[error.message]) {
    const [status, message] = errorMap[error.message];

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

export async function createDoctorLeaveController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      doctorHospitalId,
      startAt,
      endAt,
      reason,
    } = req.body ?? {};

    if (!doctorHospitalId || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor hospital ID, start date and end date are required",
      });
    }

    const leave = await createDoctorLeave({
      doctorHospitalId,
      startAt,
      endAt,
      reason,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: leave.doctorHospital.hospitalId,
      action: "CREATE",
      entityType: "DOCTOR_LEAVE",
      entityId: leave.id,
      metadata: {
        doctorHospitalId: leave.doctorHospitalId,
        startAt: leave.startAt,
        endAt: leave.endAt,
        reason: leave.reason,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Doctor leave created successfully",
      data: leave,
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "Create doctor leave error"
    );
  }
}

export async function getDoctorLeavesController(
  _req: Request,
  res: Response
) {
  try {
    const leaves = await getDoctorLeaves();

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "Get doctor leaves error"
    );
  }
}

export async function getDoctorLeaveByIdController(
  req: Request,
  res: Response
) {
  try {
    const leave = await getDoctorLeaveById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "Get doctor leave error"
    );
  }
}

export async function updateDoctorLeaveController(
  req: AuthRequest,
  res: Response
) {
  try {
    const leave = await updateDoctorLeave(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: leave.doctorHospital.hospitalId,
      action: "UPDATE",
      entityType: "DOCTOR_LEAVE",
      entityId: leave.id,
      metadata: {
        doctorHospitalId: leave.doctorHospitalId,
        startAt: leave.startAt,
        endAt: leave.endAt,
        reason: leave.reason,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Doctor leave updated successfully",
      data: leave,
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "Update doctor leave error"
    );
  }
}