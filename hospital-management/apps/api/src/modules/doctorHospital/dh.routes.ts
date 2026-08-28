import { Router } from "express";

import {
  createDoctorHospitalController,
  getDoctorHospitalsController,
  getDoctorHospitalByIdController,
  updateDoctorHospitalController,
  deleteDoctorHospitalController,
} from "./dh.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/doctor-hospitals:
 *   post:
 *     tags:
 *       - Doctor Hospital Assignments
 *     summary: Assign a doctor to a hospital
 *     description: Creates an assignment between a doctor and a hospital.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - hospitalId
 *             properties:
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *     responses:
 *       201:
 *         description: Doctor assigned to hospital successfully
 *       400:
 *         description: Doctor ID and hospital ID are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor or hospital not found
 *       409:
 *         description: Doctor is already assigned to this hospital
 *       500:
 *         description: Internal server error
 */
router.post(
  "/doctor-hospitals",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_CREATE"),
  createDoctorHospitalController
);

/**
 * @swagger
 * /api/v1/doctor-hospitals:
 *   get:
 *     tags:
 *       - Doctor Hospital Assignments
 *     summary: Get all doctor-hospital assignments
 *     description: Retrieves all doctor-hospital assignments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor-hospital assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/doctor-hospitals",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_READ"),
  getDoctorHospitalsController
);

/**
 * @swagger
 * /api/v1/doctor-hospitals/{id}:
 *   get:
 *     tags:
 *       - Doctor Hospital Assignments
 *     summary: Get doctor-hospital assignment by ID
 *     description: Retrieves a specific doctor-hospital assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor-hospital assignment ID
 *     responses:
 *       200:
 *         description: Doctor-hospital assignment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor hospital assignment not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_READ"),
  getDoctorHospitalByIdController
);

/**
 * @swagger
 * /api/v1/doctor-hospitals/{id}:
 *   put:
 *     tags:
 *       - Doctor Hospital Assignments
 *     summary: Update doctor-hospital assignment
 *     description: Updates an existing doctor-hospital assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor-hospital assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             description: Assignment fields to update. The exact accepted fields are handled by the service layer.
 *     responses:
 *       200:
 *         description: Doctor-hospital assignment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor hospital assignment not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_UPDATE"),
  updateDoctorHospitalController
);

/**
 * @swagger
 * /api/v1/doctor-hospitals/{id}:
 *   delete:
 *     tags:
 *       - Doctor Hospital Assignments
 *     summary: Remove doctor from hospital
 *     description: Deletes a doctor-hospital assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor-hospital assignment ID
 *     responses:
 *       200:
 *         description: Doctor removed from hospital successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor hospital assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/doctor-hospitals/:id",
  authenticate,
  requirePermission("DOCTOR_HOSPITAL_DELETE"),
  deleteDoctorHospitalController
);

export default router;