import { Request, Response } from "express";

import {
  createDiagnosticTest,
  getDiagnosticTests,
  getDiagnosticTestById,
  updateDiagnosticTest,
} from "./dgt.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createDiagnosticTestController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, code, category } = req.body ?? {};

    if (!name || !code || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, code and category are required",
      });
    }

    const test = await createDiagnosticTest(req.body);

    // Audit CREATE
    await createAuditLog({
      userId: req.user?.id,
      action: "CREATE",
      entityType: "DIAGNOSTIC_TEST",
      entityId: test.id,
      metadata: {
        name: test.name,
        code: test.code,
        category: test.category,
        isActive: test.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Diagnostic test created successfully",
      data: test,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DIAGNOSTIC_TEST_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Diagnostic test already exists",
      });
    }

    console.error("Create diagnostic test error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDiagnosticTestsController(
  _req: Request,
  res: Response
) {
  try {
    const tests = await getDiagnosticTests();

    return res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Get diagnostic tests error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getDiagnosticTestByIdController(
  req: Request,
  res: Response
) {
  try {
    const test = await getDiagnosticTestById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DIAGNOSTIC_TEST_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Diagnostic test not found",
      });
    }

    console.error("Get diagnostic test error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateDiagnosticTestController(
  req: AuthRequest,
  res: Response
) {
  try {
    const test = await updateDiagnosticTest(
      req.params.id as string,
      req.body ?? {}
    );

    // Audit UPDATE
    await createAuditLog({
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "DIAGNOSTIC_TEST",
      entityId: test.id,
      metadata: {
        name: test.name,
        code: test.code,
        category: test.category,
        isActive: test.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Diagnostic test updated successfully",
      data: test,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DIAGNOSTIC_TEST_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Diagnostic test not found",
        });
      }

      if (error.message === "DIAGNOSTIC_TEST_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Diagnostic test already exists",
        });
      }
    }

    console.error("Update diagnostic test error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}