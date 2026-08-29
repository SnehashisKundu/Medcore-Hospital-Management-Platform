"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doc_controller_1 = require("./doc.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/doctors:
 *   post:
 *     tags:
 *       - Doctors
 *     summary: Create a doctor
 *     description: Creates a doctor profile for an existing user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - medicalRegistrationNumber
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "5968fdae-3097-4ed7-8b8c-231f6650c664"
 *               medicalRegistrationNumber:
 *                 type: string
 *                 example: "MED-REG-12345"
 *               qualification:
 *                 type: string
 *                 example: "MBBS, MD"
 *               bio:
 *                 type: string
 *                 example: "Experienced physician specializing in internal medicine."
 *               priorExperienceYears:
 *                 type: integer
 *                 example: 8
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: User ID and medical registration number are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       409:
 *         description: Doctor profile or medical registration number already exists
 *       500:
 *         description: Internal server error
 */
router.post("/doctors", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_CREATE"), doc_controller_1.createDoctorController);
/**
 * @swagger
 * /api/v1/doctors:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get all doctors
 *     description: Retrieves all doctor profiles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get("/doctors", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_READ"), doc_controller_1.getDoctorsController);
/**
 * @swagger
 * /api/v1/doctors/{id}:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get doctor by ID
 *     description: Retrieves a doctor profile by doctor ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router.get("/doctors/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_READ"), doc_controller_1.getDoctorByIdController);
/**
 * @swagger
 * /api/v1/doctors/{id}:
 *   put:
 *     tags:
 *       - Doctors
 *     summary: Update doctor
 *     description: Updates an existing doctor profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicalRegistrationNumber:
 *                 type: string
 *                 example: "MED-REG-12345"
 *               qualification:
 *                 type: string
 *                 example: "MBBS, MD"
 *               bio:
 *                 type: string
 *                 example: "Experienced physician specializing in internal medicine."
 *               priorExperienceYears:
 *                 type: integer
 *                 example: 8
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Medical registration number already exists
 *       500:
 *         description: Internal server error
 */
router.put("/doctors/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_UPDATE"), doc_controller_1.updateDoctorController);
/**
 * @swagger
 * /api/v1/doctors/{id}:
 *   delete:
 *     tags:
 *       - Doctors
 *     summary: Delete doctor
 *     description: Deletes a doctor profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router.delete("/doctors/:id", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_DELETE"), doc_controller_1.deleteDoctorController);
/**
 * @swagger
 * /api/v1/doctors/{id}/signature:
 *   post:
 *     tags:
 *       - Doctors
 *     summary: Upload doctor signature
 *     description: Uploads a signature image for a doctor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Doctor signature image
 *     responses:
 *       200:
 *         description: Doctor signature uploaded successfully
 *       400:
 *         description: Doctor ID or signature image is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router.post("/doctors/:id/signature", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_UPDATE"), upload_middleware_1.signatureUpload.single("signature"), doc_controller_1.uploadDoctorSignatureController);
/**
 * @swagger
 * /api/v1/doctors/{id}/signature:
 *   delete:
 *     tags:
 *       - Doctors
 *     summary: Remove doctor signature
 *     description: Removes the existing signature from a doctor profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor signature removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Doctor or signature not found
 *       500:
 *         description: Internal server error
 */
router.delete("/doctors/:id/signature", auth_middleware_1.authenticate, (0, permission_middleware_1.requirePermission)("DOCTOR_UPDATE"), doc_controller_1.removeDoctorSignatureController);
exports.default = router;
