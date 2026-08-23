import { Request, Response } from "express";

import {
  createProcedure,
  getProcedures,
  getProcedureById,
  updateProcedure,
  deleteProcedure,
} from "./pcd.service";

import type { ProcedureCategory } from "../../generated/prisma/client";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createProcedureController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, code, category, description } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, code and category are required",
      });
    }

    const procedure = await createProcedure(
      name,
      code,
      category as ProcedureCategory,
      description
    );

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      metadata: {
        name: procedure.name,
        code: procedure.code,
        category: procedure.category,
        description: procedure.description,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Procedure created successfully",
      data: procedure,
    });
  } catch (error: any) {
    console.error("Create procedure error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create procedure",
    });
  }
}

export async function getProceduresController(
  _req: Request,
  res: Response
) {
  try {
    const procedures = await getProcedures();

    return res.status(200).json({
      success: true,
      data: procedures,
    });
  } catch (error) {
    console.error("Get procedures error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getProcedureByIdController(
  req: Request,
  res: Response
) {
  try {
    const procedure = await getProcedureById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: procedure,
    });
  } catch (error: any) {
    console.error("Get procedure error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Procedure not found",
    });
  }
}

export async function updateProcedureController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, code, category, description } = req.body;

    const procedure = await updateProcedure(
      req.params.id as string,
      name,
      code,
      category as ProcedureCategory | undefined,
      description
    );

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      metadata: {
        name: procedure.name,
        code: procedure.code,
        category: procedure.category,
        description: procedure.description,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Procedure updated successfully",
      data: procedure,
    });
  } catch (error: any) {
    console.error("Update procedure error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update procedure",
    });
  }
}

export async function deleteProcedureController(
  req: AuthRequest,
  res: Response
) {
  try {
    const procedure = await deleteProcedure(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      userId: req.user?.id,
      action: "DELETE",
      entityType: "PROCEDURE",
      entityId: procedure.id,
      metadata: {
        name: procedure.name,
        code: procedure.code,
        category: procedure.category,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Procedure deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete procedure error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Procedure not found",
    });
  }
}