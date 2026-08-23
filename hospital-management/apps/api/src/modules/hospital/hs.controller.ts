import { Request, Response } from "express";

import {
  createHospital,
  getHospitals,
  getNearbyHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} from "./hs.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

export async function createHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Hospital name and code are required",
      });
    }

    const hospital = await createHospital(req.body);

    // Audit CREATE
    await createAuditLog({
      hospitalId: hospital.id,
      userId: req.user?.id,
      action: "CREATE",
      entityType: "HOSPITAL",
      entityId: hospital.id,
      metadata: {
        name: hospital.name,
        code: hospital.code,
        email: hospital.email,
        phone: hospital.phone,
        city: hospital.city,
        state: hospital.state,
        country: hospital.country,
        registrationNumber: hospital.registrationNumber,
        isActive: hospital.isActive,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: hospital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "HOSPITAL_CODE_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Hospital code already exists",
      });
    }

    console.error("Create hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getHospitalsController(
  _req: Request,
  res: Response
) {
  try {
    const hospitals = await getHospitals();

    return res.status(200).json({
      success: true,
      data: hospitals,
    });
  } catch (error) {
    console.error("Get hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getNearbyHospitalsController(
  req: Request,
  res: Response
) {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const availableOnly =
      req.query.availableOnly === "true";

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude range",
      });
    }

    const hospitals = await getNearbyHospitals(
      latitude,
      longitude,
      availableOnly
    );

    return res.status(200).json({
      success: true,
      data: hospitals,
    });
  } catch (error) {
    console.error("Get nearby hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function getHospitalByIdController(
  req: Request,
  res: Response
) {
  try {
    const hospital = await getHospitalById(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    console.error("Get hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const hospital = await updateHospital(
      req.params.id as string,
      req.body
    );

    // Audit UPDATE
    await createAuditLog({
      hospitalId: hospital.id,
      userId: req.user?.id,
      action: "UPDATE",
      entityType: "HOSPITAL",
      entityId: hospital.id,
      metadata: {
        name: hospital.name,
        code: hospital.code,
        email: hospital.email,
        phone: hospital.phone,
        city: hospital.city,
        state: hospital.state,
        country: hospital.country,
        registrationNumber: hospital.registrationNumber,
        isActive: hospital.isActive,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      data: hospital,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "HOSPITAL_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
      }

      if (error.message === "HOSPITAL_CODE_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Hospital code already exists",
        });
      }
    }

    console.error("Update hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteHospitalController(
  req: AuthRequest,
  res: Response
) {
  try {
    const hospital = await deleteHospital(
      req.params.id as string
    );

    // Audit DELETE
    await createAuditLog({
      hospitalId: hospital.id,
      userId: req.user?.id,
      action: "DELETE",
      entityType: "HOSPITAL",
      entityId: hospital.id,
      metadata: {
        name: hospital.name,
        code: hospital.code,
        email: hospital.email,
        phone: hospital.phone,
        city: hospital.city,
        state: hospital.state,
        country: hospital.country,
        registrationNumber: hospital.registrationNumber,
        isActive: hospital.isActive,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        deletedAt: hospital.deletedAt,       
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "HOSPITAL_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    console.error("Delete hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}