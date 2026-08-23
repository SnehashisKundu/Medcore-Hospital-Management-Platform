import { Request, Response } from "express";

import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "./pat.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createPatientController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { firstName } = req.body;

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    const patient = await createPatient(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PATIENT",
      entityId: patient.id,
      metadata: {
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PATIENT_PROFILE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Patient profile already exists for this user",
      });
    }

    console.error("Create patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPatientsController(
  _req: Request,
  res: Response
) {
  try {
    const patients = await getPatients();

    return res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPatientByIdController(
  req: Request,
  res: Response
) {
  try {
    const patient = await getPatientById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    console.error("Get patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updatePatientController(
  req: AuthRequest,
  res: Response
) {
  try {
    const patient = await updatePatient(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PATIENT",
      entityId: patient.id,
      metadata: {
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    console.error("Update patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deletePatientController(
  req: AuthRequest,
  res: Response
) {
  try {
    const patient = await deletePatient(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PATIENT",
      entityId: patient.id,
      metadata: {
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    console.error("Delete patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}