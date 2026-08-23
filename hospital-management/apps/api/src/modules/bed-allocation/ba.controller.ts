import { Request, Response } from "express";

import {
  allocateBed,
  releaseBed,
  getBedAllocations,
} from "./ba.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function allocateBedController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { admissionId, bedId } = req.body ?? {};

    if (!admissionId || !bedId) {
      return res.status(400).json({
        success: false,
        message: "Admission ID and bed ID are required",
      });
    }

    const allocation = await allocateBed({
      admissionId,
      bedId,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: allocation.admission.hospitalId,
      action: "CREATE",
      entityType: "BED_ALLOCATION",
      entityId: allocation.id,
      metadata: {
        admissionId,
        bedId,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Bed allocated successfully",
      data: allocation,
    });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<string, { status: number; message: string }> = {
        ADMISSION_NOT_FOUND: {
          status: 404,
          message: "Admission not found",
        },
        ADMISSION_NOT_ACTIVE: {
          status: 400,
          message: "Admission is not active",
        },
        BED_NOT_FOUND: {
          status: 404,
          message: "Bed not found",
        },
        BED_NOT_AVAILABLE: {
          status: 400,
          message: "Bed is not available",
        },
        ADMISSION_ALREADY_HAS_ACTIVE_BED: {
          status: 409,
          message: "Admission already has an active bed allocation",
        },
      };

      const knownError = errors[error.message];

      if (knownError) {
        return res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
      }
    }

    console.error("Allocate bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function releaseBedController(
  req: AuthRequest,
  res: Response
) {
  try {
    const allocation = await releaseBed(req.params.id as string);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: allocation.admission.hospitalId,
      action: "UPDATE",
      entityType: "BED_ALLOCATION",
      entityId: allocation.id,
      metadata: {
        admissionId: allocation.admissionId,
        bedId: allocation.bedId,
        releasedAt: allocation.releasedAt,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Bed released successfully",
      data: allocation,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ALLOCATION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Bed allocation not found",
        });
      }

      if (error.message === "BED_ALREADY_RELEASED") {
        return res.status(400).json({
          success: false,
          message: "Bed is already released",
        });
      }
    }

    console.error("Release bed error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getBedAllocationsController(
  req: Request,
  res: Response
) {
  try {
    const params = req.params as Record<string, string | undefined>;

    const admissionId =
      typeof req.query.admissionId === "string"
        ? req.query.admissionId
        : typeof params.admissionId === "string"
          ? params.admissionId
          : undefined;

    const bedId =
      typeof req.query.bedId === "string"
        ? req.query.bedId
        : typeof params.bedId === "string"
          ? params.bedId
          : undefined;

    const allocations = await getBedAllocations(
      admissionId,
      bedId
    );

    return res.status(200).json({
      success: true,
      data: allocations,
    });
  } catch (error) {
    console.error("Get bed allocations error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}