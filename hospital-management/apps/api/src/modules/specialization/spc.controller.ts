import { Request, Response } from "express";

import {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
} from "./spc.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createSpecializationController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Specialization name and code are required",
      });
    }

    const specialization = await createSpecialization(req.body);

    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "SPECIALIZATION",
      entityId: specialization.id,
      metadata: {
        name: specialization.name,
        code: specialization.code,
        description: specialization.description,
        isActive: specialization.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Specialization created successfully",
      data: specialization,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SPECIALIZATION_CODE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Specialization code already exists",
      });
    }

    console.error("Create specialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSpecializationsController(
  _req: Request,
  res: Response
) {
  try {
    const specializations = await getSpecializations();

    return res.status(200).json({
      success: true,
      data: specializations,
    });
  } catch (error) {
    console.error("Get specializations error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSpecializationByIdController(
  req: Request,
  res: Response
) {
  try {
    const specialization = await getSpecializationById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: specialization,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SPECIALIZATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    console.error("Get specialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}