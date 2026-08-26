import { Request, Response } from "express";
import fs from "fs";

import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  uploadDoctorSignature,
  removeDoctorSignature,
} from "./doc.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDoctorController(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      userId,
      medicalRegistrationNumber,
    } = req.body;

    if (!userId || !medicalRegistrationNumber) {
      return res.status(400).json({
        success: false,
        message:
          "User ID and medical registration number are required",
      });
    }

    const doctor = await createDoctor(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "DOCTOR",
      entityId: doctor.id,
      metadata: {
        userId: doctor.userId,
        medicalRegistrationNumber:
          doctor.medicalRegistrationNumber,
        qualification: doctor.qualification,
        bio: doctor.bio,
        priorExperienceYears:
          doctor.priorExperienceYears,
        isActive: doctor.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
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
      error.message === "DOCTOR_PROFILE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Doctor profile already exists for this user",
      });
    }

    if (
      error instanceof Error &&
      error.message === "MEDICAL_REGISTRATION_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Medical registration number already exists",
      });
    }

    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDoctorsController(
  _req: Request,
  res: Response
) {
  try {
    const doctors = await getDoctors();

    return res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDoctorByIdController(
  req: Request,
  res: Response
) {
  try {
    const doctor = await getDoctorById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: doctor,
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

    console.error("Get doctor by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateDoctorController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctor = await updateDoctor(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DOCTOR",
      entityId: doctor.id,
      metadata: {
        userId: doctor.userId,
        medicalRegistrationNumber:
          doctor.medicalRegistrationNumber,
        qualification: doctor.qualification,
        bio: doctor.bio,
        priorExperienceYears:
          doctor.priorExperienceYears,
        isActive: doctor.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
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
      error.message === "MEDICAL_REGISTRATION_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Medical registration number already exists",
      });
    }

    console.error("Update doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteDoctorController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctor = await deleteDoctor(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId:
        req.user?.roles?.[0]?.hospitalId as string,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "DOCTOR",
      entityId: doctor.id,
      metadata: {
        userId: doctor.userId,
        medicalRegistrationNumber:
          doctor.medicalRegistrationNumber,
        qualification: doctor.qualification,
        bio: doctor.bio,
        priorExperienceYears:
          doctor.priorExperienceYears,
        isActive: doctor.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
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

    console.error("Delete doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function uploadDoctorSignatureController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctorId =
      req.params.id as string;

    if (!doctorId || !doctorId.trim()) {
      if (req.file) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Signature image is required",
      });
    }

    const signatureUrl =
      `/uploads/signatures/${req.file.filename}`;

    const doctor =
      await uploadDoctorSignature(
        doctorId.trim(),
        signatureUrl
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DOCTOR",
      entityId: doctor.id,
      metadata: {
        action: "SIGNATURE_UPLOADED",
        signatureUrl:
          doctor.signatureUrl,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Doctor signature uploaded successfully",
      data: doctor,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(
        req.file.path,
        () => {}
      );
    }

    if (
      error instanceof Error &&
      error.message === "DOCTOR_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    console.error(
      "Upload doctor signature error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function removeDoctorSignatureController(
  req: AuthRequest,
  res: Response
) {
  try {
    const doctor =
      await removeDoctorSignature(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DOCTOR",
      entityId: doctor.id,
      metadata: {
        action: "SIGNATURE_REMOVED",
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Doctor signature removed successfully",
      data: doctor,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "DOCTOR_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      if (
        error.message === "SIGNATURE_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Doctor signature not found",
        });
      }
    }

    console.error(
      "Remove doctor signature error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}