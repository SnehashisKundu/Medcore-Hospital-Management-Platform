import { Router } from "express";

import {
  allocateBedController,
  releaseBedController,
  getBedAllocationsController,
} from "./ba.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/bed-allocations:
 *   post:
 *     tags:
 *       - Bed Allocations
 *     summary: Allocate a bed
 *     description: Allocates an available bed to an active admission.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admissionId
 *               - bedId
 *             properties:
 *               admissionId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               bedId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789013"
 *     responses:
 *       201:
 *         description: Bed allocated successfully
 *       400:
 *         description: Admission is not active or bed is not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Admission or bed not found
 *       409:
 *         description: Admission already has an active bed allocation
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("BED_ALLOCATION_CREATE"),
  allocateBedController
);

/**
 * @swagger
 * /api/v1/bed-allocations:
 *   get:
 *     tags:
 *       - Bed Allocations
 *     summary: Get bed allocations
 *     description: Retrieves bed allocations. Results can optionally be filtered by admissionId or bedId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: admissionId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter allocations by admission ID
 *       - in: query
 *         name: bedId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter allocations by bed ID
 *     responses:
 *       200:
 *         description: Bed allocations retrieved successfully
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
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

/**
 * @swagger
 * /api/v1/bed-allocations/admission/{admissionId}:
 *   get:
 *     tags:
 *       - Bed Allocations
 *     summary: Get allocations by admission ID
 *     description: Retrieves bed allocations associated with a specific admission.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Admission ID
 *     responses:
 *       200:
 *         description: Bed allocations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admission/:admissionId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

/**
 * @swagger
 * /api/v1/bed-allocations/bed/{bedId}:
 *   get:
 *     tags:
 *       - Bed Allocations
 *     summary: Get allocations by bed ID
 *     description: Retrieves bed allocations associated with a specific bed.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed ID
 *     responses:
 *       200:
 *         description: Bed allocations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/bed/:bedId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

/**
 * @swagger
 * /api/v1/bed-allocations/admissionId={admissionId}:
 *   get:
 *     tags:
 *       - Bed Allocations
 *     summary: Get allocations using admissionId path parameter
 *     description: Retrieves bed allocations using the admissionId route parameter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Admission ID
 *     responses:
 *       200:
 *         description: Bed allocations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admissionId=:admissionId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

/**
 * @swagger
 * /api/v1/bed-allocations/bedId={bedId}:
 *   get:
 *     tags:
 *       - Bed Allocations
 *     summary: Get allocations using bedId path parameter
 *     description: Retrieves bed allocations using the bedId route parameter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bedId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed ID
 *     responses:
 *       200:
 *         description: Bed allocations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/bedId=:bedId",
  authenticate,
  requirePermission("BED_ALLOCATION_READ"),
  getBedAllocationsController
);

/**
 * @swagger
 * /api/v1/bed-allocations/{id}/release:
 *   put:
 *     tags:
 *       - Bed Allocations
 *     summary: Release a bed
 *     description: Releases an existing bed allocation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bed allocation ID
 *     responses:
 *       200:
 *         description: Bed released successfully
 *       400:
 *         description: Bed is already released
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Bed allocation not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/release",
  authenticate,
  requirePermission("BED_ALLOCATION_UPDATE"),
  releaseBedController
);

export default router;