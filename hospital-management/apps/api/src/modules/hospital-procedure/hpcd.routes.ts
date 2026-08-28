import { Router } from "express";

import {
  createHospitalProcedureController,
  getHospitalProceduresController,
  getHospitalProcedureByIdController,
  updateHospitalProcedureController,
  deleteHospitalProcedureController,
} from "./hpcd.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/hospital-procedures:
 *   post:
 *     tags:
 *       - Hospital Procedures
 *     summary: Assign a procedure to a hospital
 *     description: Creates a hospital-specific procedure configuration with pricing and availability.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalId
 *               - procedureId
 *               - basePrice
 *             properties:
 *               hospitalId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               procedureId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *               basePrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 5000
 *               estimatedDurationMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 example: 60
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Hospital procedure created successfully
 *       400:
 *         description: Required fields are missing, base price is negative, or duration is negative
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital or procedure not found
 *       409:
 *         description: Procedure is already assigned to this hospital
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_CREATE"),
  createHospitalProcedureController
);

/**
 * @swagger
 * /api/v1/hospital-procedures:
 *   get:
 *     tags:
 *       - Hospital Procedures
 *     summary: Get hospital procedures
 *     description: Retrieves hospital procedures with optional hospital, procedure, location, and sorting filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hospitalId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by hospital ID
 *       - in: query
 *         name: procedureId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by procedure ID
 *       - in: query
 *         name: latitude
 *         required: false
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude used for distance calculation
 *       - in: query
 *         name: longitude
 *         required: false
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude used for distance calculation
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - price
 *             - distance
 *         description: Sort results by price or distance
 *     responses:
 *       200:
 *         description: Hospital procedures retrieved successfully
 *       400:
 *         description: Invalid latitude, longitude, coordinate combination, or sort value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_READ"),
  getHospitalProceduresController
);

/**
 * @swagger
 * /api/v1/hospital-procedures/{id}:
 *   get:
 *     tags:
 *       - Hospital Procedures
 *     summary: Get hospital procedure by ID
 *     description: Retrieves a specific hospital procedure configuration.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital procedure ID
 *     responses:
 *       200:
 *         description: Hospital procedure retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital procedure not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_READ"),
  getHospitalProcedureByIdController
);

/**
 * @swagger
 * /api/v1/hospital-procedures/{id}:
 *   put:
 *     tags:
 *       - Hospital Procedures
 *     summary: Update a hospital procedure
 *     description: Updates pricing, estimated duration, or availability for a hospital procedure.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital procedure ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basePrice:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 example: 5500
 *               estimatedDurationMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 example: 75
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Hospital procedure updated successfully
 *       400:
 *         description: Base price or estimated duration is invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital procedure not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_UPDATE"),
  updateHospitalProcedureController
);

/**
 * @swagger
 * /api/v1/hospital-procedures/{id}:
 *   delete:
 *     tags:
 *       - Hospital Procedures
 *     summary: Delete a hospital procedure
 *     description: Deletes a hospital-specific procedure configuration.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital procedure ID
 *     responses:
 *       200:
 *         description: Hospital procedure deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital procedure not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_PROCEDURE_DELETE"),
  deleteHospitalProcedureController
);

export default router;