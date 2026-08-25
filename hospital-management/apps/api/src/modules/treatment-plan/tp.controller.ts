import { Request, Response } from "express";

import {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from "./tp.service";

type UpdateTreatmentPlanInput =
  Parameters<typeof updateTreatmentPlan>[1];

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createTreatmentPlanController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { encounterId, title, description } =
      req.body ?? {};

    if (!encounterId) {
      return res.status(400).json({
        success: false,
        message: "Encounter ID is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Treatment plan title is required",
      });
    }

    const treatmentPlan = await createTreatmentPlan({
      encounterId,
      title,
      description,
    });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: treatmentPlan.encounter.hospitalId,
      action: "CREATE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description: treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Treatment plan created successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    console.error(
      "Create treatment plan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getTreatmentPlansController(
  req: Request,
  res: Response
) {
  try {
    const encounterId =
      typeof req.query.encounterId === "string"
        ? req.query.encounterId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const treatmentPlans = await getTreatmentPlans(
      encounterId,
      status
    );

    return res.status(200).json({
      success: true,
      data: treatmentPlans,
    });
  } catch (error) {
    console.error(
      "Get treatment plans error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getTreatmentPlanByIdController(
  req: Request,
  res: Response
) {
  try {
    const treatmentPlan = await getTreatmentPlanById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TREATMENT_PLAN_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found",
      });
    }

    console.error(
      "Get treatment plan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateTreatmentPlanController(
  req: AuthRequest,
  res: Response
) {
  try {
    const treatmentPlan = await updateTreatmentPlan(
      req.params.id as string,
      {
        title: req.body?.title,
        description: req.body?.description,
        status: req.body?.status as
          UpdateTreatmentPlanInput["status"],
      }
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: treatmentPlan.encounter.hospitalId,
      action: "UPDATE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description: treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Treatment plan updated successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TREATMENT_PLAN_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found",
      });
    }

    console.error(
      "Update treatment plan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteTreatmentPlanController(
  req: AuthRequest,
  res: Response
) {
  try {
    const treatmentPlan = await deleteTreatmentPlan(
      req.params.id as string
    );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: treatmentPlan.encounter.hospitalId,
      action: "DELETE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description: treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Treatment plan deleted successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TREATMENT_PLAN_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found",
      });
    }

    console.error(
      "Delete treatment plan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}