import { Router } from "express";

import {
  createProcedureController,
  getProceduresController,
  getProcedureByIdController,
  updateProcedureController,
  deleteProcedureController,
} from "./pcd.controller";

import { authenticate } from "../auth/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

/**
 * @swagger
 * /api/v1/procedures:
 *   post:
 *     tags:
 *       - Procedures
 *     summary: Create a procedure
 *     description: Creates a new medical procedure.
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Appendectomy"
 *               code:
 *                 type: string
 *                 example: "PROC-APP-001"
 *               category:
 *                 type: string
 *                 example: "SURGERY"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Surgical removal of the appendix"
 *     responses:
 *       201:
 *         description: Procedure created successfully
 *       400:
 *         description: Name, code, or category is missing or procedure creation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  requirePermission("PROCEDURE_CREATE"),
  createProcedureController
);

/**
 * @swagger
 * /api/v1/procedures:
 *   get:
 *     tags:
 *       - Procedures
 *     summary: Get all procedures
 *     description: Retrieves all procedures.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procedures retrieved successfully
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
  requirePermission("PROCEDURE_READ"),
  getProceduresController
);

/**
 * @swagger
 * /api/v1/procedures/{id}:
 *   get:
 *     tags:
 *       - Procedures
 *     summary: Get procedure by ID
 *     description: Retrieves a specific procedure by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure ID
 *     responses:
 *       200:
 *         description: Procedure retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_READ"),
  getProcedureByIdController
);

/**
 * @swagger
 * /api/v1/procedures/{id}:
 *   put:
 *     tags:
 *       - Procedures
 *     summary: Update a procedure
 *     description: Updates an existing procedure.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Appendectomy"
 *               code:
 *                 type: string
 *                 example: "PROC-APP-001"
 *               category:
 *                 type: string
 *                 example: "SURGERY"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated procedure description"
 *     responses:
 *       200:
 *         description: Procedure updated successfully
 *       400:
 *         description: Procedure update failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_UPDATE"),
  updateProcedureController
);

/**
 * @swagger
 * /api/v1/procedures/{id}:
 *   delete:
 *     tags:
 *       - Procedures
 *     summary: Delete a procedure
 *     description: Deletes an existing procedure.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Procedure ID
 *     responses:
 *       200:
 *         description: Procedure deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Procedure not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  requirePermission("PROCEDURE_DELETE"),
  deleteProcedureController
);

export default router;