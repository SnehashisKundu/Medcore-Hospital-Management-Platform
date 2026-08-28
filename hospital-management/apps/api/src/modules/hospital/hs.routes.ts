import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import {
  createHospitalController,
  getHospitalsController,
  getNearbyHospitalsController,
  getHospitalByIdController,
  updateHospitalController,
  verifyHospitalController,
  deleteHospitalController,
} from "./hs.controller";

const router = Router();

/**
 * @swagger
 * /api/v1/hospitals:
 *   post:
 *     tags:
 *       - Hospitals
 *     summary: Create a hospital
 *     description: Creates a new hospital.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "MedCore General Hospital"
 *               code:
 *                 type: string
 *                 example: "MCGH001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@medcore.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               city:
 *                 type: string
 *                 example: "Kolkata"
 *               state:
 *                 type: string
 *                 example: "West Bengal"
 *               country:
 *                 type: string
 *                 example: "India"
 *               registrationNumber:
 *                 type: string
 *                 example: "REG-MCGH-001"
 *               latitude:
 *                 type: number
 *                 format: double
 *                 example: 22.5726
 *               longitude:
 *                 type: number
 *                 format: double
 *                 example: 88.3639
 *     responses:
 *       201:
 *         description: Hospital created successfully
 *       400:
 *         description: Hospital name and code are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Hospital code already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("HOSPITAL_CREATE"),
  createHospitalController
);

/**
 * @swagger
 * /api/v1/hospitals:
 *   get:
 *     tags:
 *       - Hospitals
 *     summary: Get all hospitals
 *     description: Retrieves all hospitals.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
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
  requirePermission("HOSPITAL_READ"),
  getHospitalsController
);

/**
 * @swagger
 * /api/v1/hospitals/nearby:
 *   get:
 *     tags:
 *       - Hospitals
 *     summary: Find nearby hospitals
 *     description: Retrieves hospitals near the provided geographic coordinates.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         example: 22.5726
 *         description: Latitude between -90 and 90
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         example: 88.3639
 *         description: Longitude between -180 and 180
 *       - in: query
 *         name: availableOnly
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         example: true
 *         description: Return only available hospitals
 *     responses:
 *       200:
 *         description: Nearby hospitals retrieved successfully
 *       400:
 *         description: Invalid latitude or longitude
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/nearby",
  authenticate,
  requirePermission("HOSPITAL_READ"),
  getNearbyHospitalsController
);

/**
 * @swagger
 * /api/v1/hospitals/{id}:
 *   get:
 *     tags:
 *       - Hospitals
 *     summary: Get hospital by ID
 *     description: Retrieves a hospital using its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_READ"),
  getHospitalByIdController
);

/**
 * @swagger
 * /api/v1/hospitals/{id}:
 *   patch:
 *     tags:
 *       - Hospitals
 *     summary: Update hospital
 *     description: Updates an existing hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "MedCore General Hospital"
 *               code:
 *                 type: string
 *                 example: "MCGH001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@medcore.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               city:
 *                 type: string
 *                 example: "Kolkata"
 *               state:
 *                 type: string
 *                 example: "West Bengal"
 *               country:
 *                 type: string
 *                 example: "India"
 *               registrationNumber:
 *                 type: string
 *                 example: "REG-MCGH-001"
 *               latitude:
 *                 type: number
 *                 format: double
 *                 example: 22.5726
 *               longitude:
 *                 type: number
 *                 format: double
 *                 example: 88.3639
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       409:
 *         description: Hospital code already exists
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_UPDATE"),
  updateHospitalController
);

/**
 * @swagger
 * /api/v1/hospitals/{id}/verify:
 *   patch:
 *     tags:
 *       - Hospitals
 *     summary: Verify a hospital
 *     description: Marks a hospital as verified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital verified successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       409:
 *         description: Hospital is already verified
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/verify",
  authenticate,
  requirePermission("HOSPITAL_UPDATE"),
  verifyHospitalController
);

/**
 * @swagger
 * /api/v1/hospitals/{id}:
 *   delete:
 *     tags:
 *       - Hospitals
 *     summary: Delete hospital
 *     description: Deletes a hospital.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("HOSPITAL_DELETE"),
  deleteHospitalController
);

export default router;