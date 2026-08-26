import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import PDFDocument from "pdfkit";

import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPrescriptionPdfData,
  updatePrescription,
} from "./psc.service";

import { AuthRequest } from "../auth/auth.middleware";
import { createAuditLog } from "../audit-log/aud.service";

const CREATE_PRESCRIPTION_ERROR_MAP: Record<
  string,
  {
    status: number;
    message: string;
  }
> = {
  ENCOUNTER_NOT_FOUND: {
    status: 404,
    message: "Encounter not found",
  },

  ENCOUNTER_CANCELLED: {
    status: 400,
    message:
      "Cannot create prescription for a cancelled encounter",
  },

  PRESCRIBER_NOT_FOUND: {
    status: 404,
    message: "Prescriber not found",
  },

  PRESCRIPTION_ITEMS_REQUIRED: {
    status: 400,
    message:
      "At least one prescription item is required",
  },

  INVALID_PRESCRIPTION_ITEM: {
    status: 400,
    message:
      "Each prescription item must contain a valid medicine ID, dosage, frequency and duration",
  },

  INVALID_INSTRUCTIONS: {
    status: 400,
    message:
      "Prescription instructions must be a string or null",
  },

  INVALID_QUANTITY: {
    status: 400,
    message:
      "Medicine quantity must be a positive integer",
  },

  INVALID_MEDICINE_TIMING: {
    status: 400,
    message:
      "Invalid medicine timing. Use BEFORE_FOOD, AFTER_FOOD, WITH_FOOD, ANYTIME or supported aliases like 'After meals'.",
  },

  INVALID_MEDICINE_ROUTE: {
    status: 400,
    message:
      "Invalid medicine route. Use ORAL, IV, IM, TOPICAL, INHALATION, EYE_DROP, EAR_DROP or OTHER.",
  },

  DUPLICATE_MEDICINE: {
    status: 400,
    message:
      "Duplicate medicine is not allowed in the same prescription",
  },

  MEDICINE_NOT_FOUND: {
    status: 404,
    message: "Medicine not found",
  },

  MEDICINE_INACTIVE: {
    status: 400,
    message:
      "Cannot prescribe an inactive medicine",
  },
};

const GET_PRESCRIPTION_ERROR_MAP: Record<
  string,
  {
    status: number;
    message: string;
  }
> = {
  INVALID_PRESCRIPTION_ID: {
    status: 400,
    message: "Invalid prescription ID",
  },

  PRESCRIPTION_NOT_FOUND: {
    status: 404,
    message: "Prescription not found",
  },
};

const UPDATE_PRESCRIPTION_ERROR_MAP: Record<
  string,
  {
    status: number;
    message: string;
  }
> = {
  INVALID_PRESCRIPTION_ID: {
    status: 400,
    message: "Invalid prescription ID",
  },

  PRESCRIPTION_NOT_FOUND: {
    status: 404,
    message: "Prescription not found",
  },

  INVALID_INSTRUCTIONS: {
    status: 400,
    message:
      "Prescription instructions must be a string or null",
  },

  ENCOUNTER_CANCELLED: {
    status: 400,
    message:
      "Cannot update prescription of a cancelled encounter",
  },

  PRESCRIPTION_CANCELLED: {
    status: 400,
    message:
      "Cannot update a cancelled prescription",
  },

  PRESCRIPTION_NOT_ACTIVE: {
    status: 400,
    message:
      "Only an active prescription can be updated manually",
  },

  INVALID_STATUS_TRANSITION: {
    status: 400,
    message:
      "Invalid prescription status transition",
  },

  EMPTY_UPDATE: {
    status: 400,
    message:
      "At least one field is required to update the prescription",
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatEnumValue(
  value: string | null | undefined
) {
  if (!value) {
    return "N/A";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number
) {
  const left = doc.page.margins.left;
  const right =
    doc.page.width - doc.page.margins.right;

  doc
    .save()
    .lineWidth(1)
    .strokeColor("#D1D5DB")
    .moveTo(left, y + 18)
    .lineTo(right, y + 18)
    .stroke()
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#111827")
    .text(title, left, y);

  return y + 30;
}

function drawInfoRow(
  doc: PDFKit.PDFDocument,
  options: {
    leftLabel: string;
    leftValue: string;
    rightLabel?: string;
    rightValue?: string;
    y: number;
  }
) {
  const left = doc.page.margins.left;
  const contentWidth =
    doc.page.width -
    doc.page.margins.left -
    doc.page.margins.right;

  const rightX = left + contentWidth / 2 + 10;

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#374151")
    .text(
      `${options.leftLabel}: `,
      left,
      options.y,
      {
        continued: true,
      }
    )
    .font("Helvetica")
    .fillColor("#111827")
    .text(options.leftValue || "N/A");

  if (
    options.rightLabel &&
    options.rightValue !== undefined
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#374151")
      .text(
        `${options.rightLabel}: `,
        rightX,
        options.y,
        {
          continued: true,
        }
      )
      .font("Helvetica")
      .fillColor("#111827")
      .text(options.rightValue || "N/A");
  }

  return options.y + 20;
}

export async function createPrescriptionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      encounterId,
      prescribedById,
      instructions,
      items,
    } = body;

    if (
      typeof encounterId !== "string" ||
      !encounterId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Encounter ID is required",
      });
    }

    if (
      typeof prescribedById !== "string" ||
      !prescribedById.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Prescriber ID is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one prescription item is required",
      });
    }

    if (
      instructions !== undefined &&
      instructions !== null &&
      typeof instructions !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Prescription instructions must be a string or null",
      });
    }

    const prescription =
      await createPrescription({
        encounterId: encounterId.trim(),
        prescribedById: prescribedById.trim(),
        instructions,
        items,
      });

    await createAuditLog({
      userId: req.user?.id,
      hospitalId: prescription.encounter.hospitalId,
      action: "CREATE",
      entityType: "PRESCRIPTION",
      entityId: prescription.id,
      metadata: {
        encounterId: prescription.encounterId,
        prescribedById:
          prescription.prescribedById,
        status: prescription.status,
        instructions:
          prescription.instructions,
        itemCount:
          prescription.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(201).json({
      success: true,
      message:
        "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    if (error instanceof Error) {
      const mappedError =
        CREATE_PRESCRIPTION_ERROR_MAP[
          error.message
        ];

      if (mappedError) {
        return res
          .status(mappedError.status)
          .json({
            success: false,
            message:
              mappedError.message,
          });
      }
    }

    console.error(
      "Create prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPrescriptionsController(
  _req: Request,
  res: Response
) {
  try {
    const prescriptions =
      await getPrescriptions();

    return res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error(
      "Get prescriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPrescriptionByIdController(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const prescription =
      await getPrescriptionById(
        id.trim()
      );

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    if (error instanceof Error) {
      const mappedError =
        GET_PRESCRIPTION_ERROR_MAP[
          error.message
        ];

      if (mappedError) {
        return res
          .status(mappedError.status)
          .json({
            success: false,
            message:
              mappedError.message,
          });
      }
    }

    console.error(
      "Get prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function downloadPrescriptionPdfController(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    const prescription =
      await getPrescriptionPdfData(
        id.trim()
      );

    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
      bufferPages: true,
    });

    const patientName =
      [
        prescription.encounter.patient.firstName,
        prescription.encounter.patient.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "N/A";

    const doctorName =
      [
        prescription.prescribedBy.firstName,
        prescription.prescribedBy.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "N/A";

    const filename =
      `prescription-${prescription.id}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const left = doc.page.margins.left;
    const right =
      pageWidth - doc.page.margins.right;

    /*
      ==========================
      HOSPITAL HEADER
      ==========================
    */

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#111827")
      .text(
        prescription.encounter.hospital.name ||
          "Hospital",
        left,
        50,
        {
          width: right - left,
          align: "center",
        }
      );

    doc
      .moveDown(0.3)
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6B7280")
      .text(
        "Hospital Management System",
        {
          align: "center",
        }
      );

    const headerBottom = 108;

    doc
      .save()
      .lineWidth(2)
      .strokeColor("#111827")
      .moveTo(left, headerBottom)
      .lineTo(right, headerBottom)
      .stroke()
      .restore();

    /*
      ==========================
      PRESCRIPTION TITLE
      ==========================
    */

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#111827")
      .text(
        "PRESCRIPTION",
        left,
        125,
        {
          width: right - left,
          align: "center",
        }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6B7280")
      .text(
        `Issued on ${formatDate(
          prescription.createdAt
        )}`,
        left,
        150,
        {
          width: right - left,
          align: "center",
        }
      );

    let y = 180;

    /*
      ==========================
      PRESCRIPTION META
      ==========================
    */

    doc
      .save()
      .roundedRect(
        left,
        y,
        right - left,
        54,
        5
      )
      .fillAndStroke(
        "#F9FAFB",
        "#D1D5DB"
      )
      .restore();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6B7280")
      .text(
        "PRESCRIPTION NO.",
        left + 15,
        y + 12
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111827")
      .text(
        prescription.id.slice(0, 13).toUpperCase(),
        left + 15,
        y + 27
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6B7280")
      .text(
        "ENCOUNTER",
        left + 210,
        y + 12
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111827")
      .text(
        prescription.encounter.encounterNumber ||
          "N/A",
        left + 210,
        y + 27
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#6B7280")
      .text(
        "STATUS",
        left + 390,
        y + 12
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#111827")
      .text(
        formatEnumValue(
          prescription.status
        ),
        left + 390,
        y + 27
      );

    y += 78;

    /*
      ==========================
      PATIENT DETAILS
      ==========================
    */

    y = drawSectionTitle(
      doc,
      "PATIENT DETAILS",
      y
    );

    y = drawInfoRow(doc, {
      leftLabel: "Patient Name",
      leftValue: patientName,
      rightLabel: "Patient ID",
      rightValue:
        prescription.encounter.patient.id.slice(
          0,
          13
        ),
      y,
    });

    y = drawInfoRow(doc, {
      leftLabel: "Encounter",
      leftValue:
        prescription.encounter.encounterNumber ||
        "N/A",
      rightLabel: "Date",
      rightValue: formatDate(
        prescription.createdAt
      ),
      y,
    });

    y += 8;

    /*
      ==========================
      DOCTOR DETAILS
      ==========================
    */

    y = drawSectionTitle(
      doc,
      "PRESCRIBED BY",
      y
    );

    y = drawInfoRow(doc, {
      leftLabel: "Doctor",
      leftValue: `Dr. ${doctorName}`,
      rightLabel: "Email",
      rightValue:
        prescription.prescribedBy.email ||
        "N/A",
      y,
    });

    y += 12;

    /*
      ==========================
      MEDICINES SECTION
      ==========================
    */

    y = drawSectionTitle(
      doc,
      "Rx  MEDICINES",
      y
    );

    const tableX = left;
    const tableWidth = right - left;

    const columns = {
      serial: tableX,
      medicine: tableX + 35,
      dosage: tableX + 220,
      frequency: tableX + 290,
      duration: tableX + 390,
      route: tableX + 460,
    };

    const widths = {
      serial: 35,
      medicine: 185,
      dosage: 70,
      frequency: 100,
      duration: 70,
      route: 50,
    };

    const drawTableHeader = () => {
      doc
        .save()
        .rect(
          tableX,
          y,
          tableWidth,
          28
        )
        .fill("#111827")
        .restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text(
          "#",
          columns.serial + 12,
          y + 10
        )
        .text(
          "MEDICINE",
          columns.medicine + 6,
          y + 10,
          {
            width: widths.medicine - 10,
          }
        )
        .text(
          "DOSAGE",
          columns.dosage + 5,
          y + 10,
          {
            width: widths.dosage - 8,
          }
        )
        .text(
          "FREQUENCY",
          columns.frequency + 5,
          y + 10,
          {
            width: widths.frequency - 8,
          }
        )
        .text(
          "DURATION",
          columns.duration + 5,
          y + 10,
          {
            width: widths.duration - 8,
          }
        )
        .text(
          "ROUTE",
          columns.route + 4,
          y + 10,
          {
            width: widths.route - 6,
          }
        );

      y += 28;
    };

    drawTableHeader();

    prescription.items.forEach(
      (item, index) => {
        const medicineName =
          [
            item.medicine.name,
            item.medicine.strength,
          ]
            .filter(Boolean)
            .join(" - ") || "N/A";

        const genericName =
          item.medicine.genericName
            ? `Generic: ${item.medicine.genericName}`
            : "";

        const medicineText = genericName
          ? `${medicineName}\n${genericName}`
          : medicineName;

        const medicineHeight =
          doc.heightOfString(
            medicineText,
            {
              width:
                widths.medicine - 14,
            }
          );

        const remarksText =
          [
            item.quantity !== null &&
            item.quantity !== undefined
              ? `Qty: ${item.quantity}`
              : null,
            item.timing
              ? `Timing: ${formatEnumValue(
                  item.timing
                )}`
              : null,
            item.remarks
              ? `Remarks: ${item.remarks}`
              : null,
          ]
            .filter(Boolean)
            .join("   |   ") || "—";

        const remarksHeight =
          doc.heightOfString(
            remarksText,
            {
              width: tableWidth - 24,
            }
          );

        const rowHeight =
          Math.max(
            medicineHeight + 18,
            38
          ) +
          remarksHeight +
          24;

        const bottomLimit =
          doc.page.height -
          doc.page.margins.bottom -
          55;

        if (y + rowHeight > bottomLimit) {
          doc.addPage();

          y = doc.page.margins.top;

          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#111827")
            .text(
              "PRESCRIPTION CONTINUED",
              left,
              y
            );

          y += 25;

          drawTableHeader();
        }

        doc
          .save()
          .rect(
            tableX,
            y,
            tableWidth,
            rowHeight
          )
          .fillAndStroke(
            index % 2 === 0
              ? "#FFFFFF"
              : "#F9FAFB",
            "#D1D5DB"
          )
          .restore();

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor("#111827")
          .text(
            String(index + 1),
            columns.serial + 12,
            y + 12
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .fillColor("#111827")
          .text(
            medicineName,
            columns.medicine + 6,
            y + 10,
            {
              width:
                widths.medicine - 12,
            }
          );

        if (genericName) {
          doc
            .font("Helvetica")
            .fontSize(7.5)
            .fillColor("#6B7280")
            .text(
              genericName,
              columns.medicine + 6,
              y + 25,
              {
                width:
                  widths.medicine - 12,
              }
            );
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#111827")
          .text(
            item.dosage || "N/A",
            columns.dosage + 5,
            y + 12,
            {
              width:
                widths.dosage - 8,
            }
          )
          .text(
            item.frequency || "N/A",
            columns.frequency + 5,
            y + 12,
            {
              width:
                widths.frequency - 8,
            }
          )
          .text(
            item.duration || "N/A",
            columns.duration + 5,
            y + 12,
            {
              width:
                widths.duration - 8,
            }
          )
          .text(
            formatEnumValue(item.route),
            columns.route + 4,
            y + 12,
            {
              width:
                widths.route - 6,
            }
          );

        const detailsY =
          y +
          Math.max(
            medicineHeight + 18,
            38
          );

        doc
          .save()
          .moveTo(
            tableX + 8,
            detailsY - 5
          )
          .lineTo(
            right - 8,
            detailsY - 5
          )
          .strokeColor("#E5E7EB")
          .lineWidth(0.6)
          .stroke()
          .restore();

        doc
          .font("Helvetica")
          .fontSize(7.8)
          .fillColor("#4B5563")
          .text(
            remarksText,
            tableX + 10,
            detailsY + 5,
            {
              width: tableWidth - 20,
            }
          );

        y += rowHeight;
      }
    );

    y += 20;

    /*
      ==========================
      INSTRUCTIONS
      ==========================
    */

    const instructions =
      prescription.instructions?.trim() ||
      "Take medicines exactly as prescribed by the doctor.";

    const instructionHeight =
      doc.heightOfString(
        instructions,
        {
          width: tableWidth - 30,
        }
      );

    const instructionBoxHeight =
      Math.max(
        70,
        instructionHeight + 48
      );

    const footerRequiredSpace =
      instructionBoxHeight + 100;

    if (
      y + footerRequiredSpace >
      doc.page.height -
        doc.page.margins.bottom
    ) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    doc
      .save()
      .roundedRect(
        left,
        y,
        tableWidth,
        instructionBoxHeight,
        5
      )
      .fillAndStroke(
        "#F9FAFB",
        "#D1D5DB"
      )
      .restore();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(
        "INSTRUCTIONS",
        left + 15,
        y + 13
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#374151")
      .text(
        instructions,
        left + 15,
        y + 32,
        {
          width: tableWidth - 30,
          lineGap: 3,
        }
      );

    y += instructionBoxHeight + 45;

    /*
      ==========================
      SIGNATURE AREA
      ==========================
    */

    doc.moveDown(3);

    const signatureUrl =
      prescription.prescribedBy.doctor?.signatureUrl;

    if (signatureUrl) {
      const signaturePath = path.join(
        process.cwd(),
        signatureUrl
      );

      if (fs.existsSync(signaturePath)) {
        doc.image(
          signaturePath,
          doc.page.width -
            doc.page.margins.right -
            150,
          doc.y,
          {
            fit: [150, 70],
            align: "right",
          }
        );

        doc.moveDown(5);
      } else {
        doc.text("____________________", {
          align: "right",
        });
      }
    } else {
      doc.text("____________________", {
        align: "right",
      });
    }

    doc.text(`Dr. ${doctorName}`, {
      align: "right",
    });

    if (
      prescription.prescribedBy.doctor?.qualification
    ) {
      doc.text(
        prescription.prescribedBy.doctor.qualification,
        {
          align: "right",
        }
      );
    }

    doc.text("Prescribing Doctor", {
      align: "right",
    });

    /*
      ==========================
      FOOTER
      ==========================
    */

    const pageRange =
      doc.bufferedPageRange();

    for (
      let i = 0;
      i < pageRange.count;
      i++
    ) {
      doc.switchToPage(i);

      const footerY =
        doc.page.height - 35;

      doc
        .save()
        .moveTo(
          doc.page.margins.left,
          footerY - 8
        )
        .lineTo(
          doc.page.width -
            doc.page.margins.right,
          footerY - 8
        )
        .strokeColor("#D1D5DB")
        .lineWidth(0.7)
        .stroke()
        .restore();

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#6B7280")
        .text(
          "This prescription was generated electronically by the Hospital Management System.",
          doc.page.margins.left,
          footerY,
          {
            width:
              doc.page.width -
              doc.page.margins.left -
              doc.page.margins.right,
            align: "center",
          }
        );

      doc
        .fontSize(7)
        .text(
          `Page ${i + 1} of ${
            pageRange.count
          }`,
          doc.page.margins.left,
          footerY + 12,
          {
            width:
              doc.page.width -
              doc.page.margins.left -
              doc.page.margins.right,
            align: "center",
          }
        );
    }

    doc.end();
  } catch (error) {
    if (error instanceof Error) {
      const mappedError =
        GET_PRESCRIPTION_ERROR_MAP[
          error.message
        ];

      if (mappedError) {
        return res
          .status(mappedError.status)
          .json({
            success: false,
            message:
              mappedError.message,
          });
      }
    }

    console.error(
      "Download prescription PDF error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export async function updatePrescriptionController(
  req: AuthRequest,
  res: Response
) {
  try {
    const body = req.body ?? {};

    const {
      instructions,
      status,
    } = body;

    if (
      instructions === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update the prescription",
      });
    }

    if (
      instructions !== undefined &&
      instructions !== null &&
      typeof instructions !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Prescription instructions must be a string or null",
      });
    }

    if (
      status !== undefined &&
      status !== "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only CANCELLED status can be updated manually. Dispense statuses are managed by the medicine dispense workflow.",
      });
    }

    const prescription =
      await updatePrescription(
        req.params.id as string,
        {
          instructions,
          status,
        }
      );

    await createAuditLog({
      userId: req.user?.id,
      hospitalId:
        prescription.encounter.hospitalId,
      action: "UPDATE",
      entityType: "PRESCRIPTION",
      entityId: prescription.id,
      metadata: {
        encounterId:
          prescription.encounterId,
        prescribedById:
          prescription.prescribedById,
        status: prescription.status,
        instructions:
          prescription.instructions,
        itemCount:
          prescription.items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    if (error instanceof Error) {
      const mappedError =
        UPDATE_PRESCRIPTION_ERROR_MAP[
          error.message
        ];

      if (mappedError) {
        return res
          .status(mappedError.status)
          .json({
            success: false,
            message:
              mappedError.message,
          });
      }
    }

    console.error(
      "Update prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}