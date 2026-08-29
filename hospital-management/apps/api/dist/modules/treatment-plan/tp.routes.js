"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const tp_controller_1 = require("./tp.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/treatment-plans:
 *   post:
 *     tags:
 *       - Treatment Plans
 *     summary: Create a treatment plan
 *     description: Creates a treatment plan for an encounter.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encounterId
 *               - title
 *             properties:
 *               encounterId:
 *                 type: string
 *                 format: uuid
 *                 example: "12345678-1234-1234-1234-123456789012"
 *               title:
 *                 type: string
 *                 example: "Post-operative Recovery Plan"
 *               description:
 *                 type: string
 *                 example: "Recovery and follow-up treatment plan"
 *     responses:
 *       201:
 *         description: Treatment plan created successfully
 *       400:
 *         description: Encounter ID or title is missing, description is invalid, or encounter is cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Encounter not found
 *       500:
 *         description: Internal server error
 */
router.post("/", auth_middleware_1.authenticate, tp_controller_1.createTreatmentPlanController);
/**
 * @swagger
 * /api/v1/treatment-plans/encounter/{encounterId}:
 *   get:
 *     tags:
 *       - Treatment Plans
 *     summary: Get treatment plans by encounter
 *     description: Retrieves treatment plans for a specific encounter, optionally filtered by status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: encounterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Encounter ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Treatment plan status
 *     responses:
 *       200:
 *         description: Treatment plans retrieved successfully
 *       400:
 *         description: Invalid treatment plan status
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/encounter/:encounterId", auth_middleware_1.authenticate, tp_controller_1.getTreatmentPlansController);
/**
 * @swagger
 * /api/v1/treatment-plans/{id}:
 *   get:
 *     tags:
 *       - Treatment Plans
 *     summary: Get treatment plan by ID
 *     description: Retrieves a specific treatment plan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Treatment plan ID
 *     responses:
 *       200:
 *         description: Treatment plan retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", auth_middleware_1.authenticate, tp_controller_1.getTreatmentPlanByIdController);
/**
 * @swagger
 * /api/v1/treatment-plans/{id}:
 *   put:
 *     tags:
 *       - Treatment Plans
 *     summary: Update a treatment plan
 *     description: Updates an existing treatment plan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Treatment plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Recovery Plan"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Updated treatment instructions"
 *               status:
 *                 type: string
 *                 description: Treatment plan status
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Treatment plan updated successfully
 *       400:
 *         description: No fields provided, invalid title, invalid description, invalid status, invalid status transition, or encounter is cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth_middleware_1.authenticate, tp_controller_1.updateTreatmentPlanController);
/**
 * @swagger
 * /api/v1/treatment-plans/{id}:
 *   delete:
 *     tags:
 *       - Treatment Plans
 *     summary: Delete a treatment plan
 *     description: Deletes an existing treatment plan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Treatment plan ID
 *     responses:
 *       200:
 *         description: Treatment plan deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Treatment plan not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth_middleware_1.authenticate, tp_controller_1.deleteTreatmentPlanController);
exports.default = router;
