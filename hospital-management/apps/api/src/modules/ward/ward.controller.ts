import { Request, Response } from "express";

import {
  createWard,
  getWards,
  getWardById,
  updateWard,
  deleteWard,
} from "./ward.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

type WardFloor = string | number | boolean | null;

export async function createWardController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      hospitalId,
      name,
      code,
      type,
      floor,
    } = body;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Ward name is required",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Ward code is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Ward type is required",
      });
    }

    if (floor === undefined || floor === null) {
      return res.status(400).json({
        success: false,
        message: "Floor is required",
      });
    }

    const ward = await createWard(body);

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: ward.hospitalId,
      action: "CREATE",
      entityType: "WARD",
      entityId: ward.id,
      metadata: {
        name: ward.name,
        code: ward.code,
        type: ward.type,
        floor:
          (ward as {
            floor?: WardFloor;
          }).floor ?? null,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Ward created successfully",
      data: ward,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "HOSPITAL_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
      }

      if (error.message === "WARD_CODE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message:
            "Ward code already exists in this hospital",
        });
      }
    }

    console.error("Create ward error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getWardsController(
  req: Request,
  res: Response
) {
  try {
    const hospitalId =
      typeof req.query.hospitalId === "string"
        ? req.query.hospitalId
        : undefined;

    const wards = await getWards(hospitalId);

    return res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (error) {
    console.error("Get wards error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getWardByIdController(
  req: Request,
  res: Response
) {
  try {
    const ward = await getWardById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: ward,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Ward not found",
      });
    }

    console.error("Get ward error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateWardController(
  req: AuthRequest,
  res: Response
) {
  try {
    const ward = await updateWard(
      req.params.id as string,
      req.body ?? {}
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: ward.hospitalId,
      action: "UPDATE",
      entityType: "WARD",
      entityId: ward.id,
      metadata: {
        name: ward.name,
        code: ward.code,
        type: ward.type,
        floor:
          (ward as {
            floor?: WardFloor;
          }).floor ?? null,
        isActive: ward.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Ward updated successfully",
      data: ward,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "WARD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Ward not found",
        });
      }

      if (error.message === "WARD_CODE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message:
            "Ward code already exists in this hospital",
        });
      }
    }

    console.error("Update ward error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteWardController(
  req: AuthRequest,
  res: Response
) {
  try {
    const ward = await deleteWard(
      req.params.id as string
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: ward.hospitalId,
      action: "DELETE",
      entityType: "WARD",
      entityId: ward.id,
      metadata: {
        name: ward.name,
        code: ward.code,
        type: ward.type,
        floor:
          (ward as {
            floor?: WardFloor;
          }).floor ?? null,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Ward deleted successfully",
      data: ward,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WARD_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Ward not found",
      });
    }

    console.error("Delete ward error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}