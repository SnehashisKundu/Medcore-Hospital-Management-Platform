import { Request, Response } from "express";
import {
  getAuditLogById,
  getAuditLogs,
} from "./aud.service";

export async function getAuditLogsController(
  req: Request,
  res: Response
) {
  try {
    const logs = await getAuditLogs();

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAuditLogByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const auditLog = await getAuditLogById(Array.isArray(id) ? id[0] : id);

    return res.status(200).json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "AUDIT_LOG_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    console.error("Get audit log error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}