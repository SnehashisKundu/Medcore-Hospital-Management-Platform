import { Request, Response } from "express";

import {
  createDoctorHospital,
  getDoctorHospitals,
  getDoctorHospitalById,
  updateDoctorHospital,
  deleteDoctorHospital,
} from "./dh.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDoctorHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { doctorId, hospitalId } = req.body;

    if (!doctorId || !hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and hospital ID are required",
      });
    }

    const doctorHospital =
      await createDoctorHospital(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId: doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "DOCTOR_HOSPITAL",
      entityId: doctorHospital.id,
      metadata: {
        doctorId: doctorHospital.doctorId,
        hospitalId: doctorHospital.hospitalId,
        joinedAt: doctorHospital.joinedAt,
        isActive: doctorHospital.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Doctor assigned to hospital successfully",
      data: doctorHospital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DOCTOR_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

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
      error.message === "DOCTOR_HOSPITAL_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Doctor is already assigned to this hospital",
      });
    }

    console.error(
      "Create doctor hospital error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDoctorHospitalsController(
  _req: Request,
  res: Response
) {
  try {
    const doctorHospitals =
      await getDoctorHospitals();

    return res.status(200).json({
      success: true,
      data: doctorHospitals,
    });
  } catch (error) {
    console.error(
      "Get doctor hospitals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDoctorHospitalByIdController(
  req: Request,
  res: Response
) {
  try {
    const doctorHospital =
      await getDoctorHospitalById(req.params.id as string);

    return res.status(200).json({
      success: true,
      data: doctorHospital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor hospital assignment not found",
      });
    }

    console.error(
      "Get doctor hospital error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateDoctorHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctorHospital =
      await updateDoctorHospital(
        req.params.id as string,
        req.body
      );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DOCTOR_HOSPITAL",
      entityId: doctorHospital.id,
      metadata: {
        doctorId: doctorHospital.doctorId,
        hospitalId: doctorHospital.hospitalId,
        joinedAt: doctorHospital.joinedAt,
        isActive: doctorHospital.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Doctor hospital assignment updated successfully",
      data: doctorHospital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor hospital assignment not found",
      });
    }

    console.error(
      "Update doctor hospital error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteDoctorHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctorHospital =
      await deleteDoctorHospital(req.params.id as string);

    // Audit DELETE
    await createAuditLog({
      hospitalId: doctorHospital.hospitalId,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "DOCTOR_HOSPITAL",
      entityId: doctorHospital.id,
      metadata: {
        doctorId: doctorHospital.doctorId,
        hospitalId: doctorHospital.hospitalId,
        joinedAt: doctorHospital.joinedAt,
        isActive: doctorHospital.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Doctor removed from hospital successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DOCTOR_HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor hospital assignment not found",
      });
    }

    console.error(
      "Delete doctor hospital error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}