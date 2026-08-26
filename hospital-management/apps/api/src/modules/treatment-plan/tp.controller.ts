import { Request, Response } from "express";

import {
  createTreatmentPlan,
  getTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from "./tp.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";
import { TreatmentPlanStatus } from "../../generated/prisma/browser";

const TREATMENT_PLAN_STATUSES = Object.values(
  TreatmentPlanStatus
);

function isValidTreatmentPlanStatus(
  status: unknown
): status is TreatmentPlanStatus {
  return (
    typeof status === "string" &&
    TREATMENT_PLAN_STATUSES.includes(
      status as TreatmentPlanStatus
    )
  );
}

export async function createTreatmentPlanController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const { encounterId, title, description } = body;

    if (
      typeof encounterId !== "string" ||
      !encounterId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Encounter ID is required",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Treatment plan title is required",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Treatment plan description must be a string",
      });
    }

    const treatmentPlan =
      await createTreatmentPlan({
        encounterId: encounterId.trim(),
        title,
        description,
      });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        treatmentPlan.encounter.hospitalId,
      action: "CREATE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description:
          treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Treatment plan created successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "ENCOUNTER_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Encounter not found",
        });
      }

      if (
        error.message ===
        "ENCOUNTER_CANCELLED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot create treatment plan for a cancelled encounter",
        });
      }
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
      typeof req.params.encounterId === "string"
        ? req.params.encounterId.trim()
        : undefined;

    const rawStatus =
      typeof req.query.status === "string"
        ? req.query.status.trim()
        : undefined;

    let status: TreatmentPlanStatus | undefined;

    if (rawStatus) {
      if (!isValidTreatmentPlanStatus(rawStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid treatment plan status",
        });
      }

      status = rawStatus;
    }

    const treatmentPlans =
      await getTreatmentPlans(
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
    const treatmentPlan =
      await getTreatmentPlanById(
        req.params.id as string
      );

    return res.status(200).json({
      success: true,
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "TREATMENT_PLAN_NOT_FOUND"
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
    const body = req.body ?? {};

    const { title, description, status } = body;

    if (
      title === undefined &&
      description === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update the treatment plan",
      });
    }

    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        !title.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Treatment plan title cannot be empty",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Treatment plan description must be a string or null",
      });
    }

    if (
      status !== undefined &&
      !isValidTreatmentPlanStatus(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment plan status",
      });
    }

    const treatmentPlan =
      await updateTreatmentPlan(
        req.params.id as string,
        {
          title,
          description,
          status,
        }
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        treatmentPlan.encounter.hospitalId,
      action: "UPDATE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description:
          treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Treatment plan updated successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "TREATMENT_PLAN_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Treatment plan not found",
        });
      }

      if (
        error.message ===
        "ENCOUNTER_CANCELLED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot update treatment plan for a cancelled encounter",
        });
      }

      if (
        error.message ===
        "INVALID_STATUS_TRANSITION"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid treatment plan status transition",
        });
      }
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
    const treatmentPlan =
      await deleteTreatmentPlan(
        req.params.id as string
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        treatmentPlan.encounter.hospitalId,
      action: "DELETE",
      entityType: "TREATMENT_PLAN",
      entityId: treatmentPlan.id,
      metadata: {
        encounterId: treatmentPlan.encounterId,
        title: treatmentPlan.title,
        description:
          treatmentPlan.description,
        status: treatmentPlan.status,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Treatment plan deleted successfully",
      data: treatmentPlan,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "TREATMENT_PLAN_NOT_FOUND"
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