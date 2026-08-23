import { prisma } from "../../config/prisma";

interface CreateChargeInput {
  hospitalId: string;
  patientId: string;
  encounterId?: string;
  type:
    | "CONSULTATION"
    | "MEDICINE"
    | "LAB"
    | "IMAGING"
    | "PROCEDURE"
    | "BED"
    | "ROOM"
    | "NURSING"
    | "EMERGENCY"
    | "OTHER";
  description: string;
  quantity?: number;
  unitPrice: number;
  referenceType?: string;
  referenceId?: string;
}

interface CreateInvoiceInput {
  hospitalId: string;
  patientId: string;
  chargeIds: string[];
  discountAmount?: number;
  taxAmount?: number;
  dueAt?: string;
}

interface UpdateInvoiceInput {
  status?: "DRAFT" | "ISSUED" | "CANCELLED";
  discountAmount?: number;
  taxAmount?: number;
  dueAt?: string;
}

export async function createCharge(
  input: CreateChargeInput
) {
  const hospital = await prisma.hospital.findUnique({
    where: {
      id: input.hospitalId,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: input.patientId,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  if (input.encounterId) {
    const encounter = await prisma.encounter.findUnique({
      where: {
        id: input.encounterId,
      },
    });

    if (!encounter) {
      throw new Error("ENCOUNTER_NOT_FOUND");
    }
  }

  const quantity = input.quantity ?? 1;

  if (quantity <= 0 || input.unitPrice < 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const amount = quantity * input.unitPrice;

  return prisma.charge.create({
    data: {
      hospitalId: input.hospitalId,
      patientId: input.patientId,
      encounterId: input.encounterId,

      type: input.type,
      status: "PENDING",

      description: input.description.trim(),

      quantity,
      unitPrice: input.unitPrice,
      amount,

      referenceType: input.referenceType?.trim(),
      referenceId: input.referenceId?.trim(),
    },

    include: {
      patient: true,
      hospital: true,
      encounter: true,
    },
  });
}

export async function getCharges() {
  return prisma.charge.findMany({
    include: {
      patient: true,
      hospital: true,
      encounter: true,
      invoiceItem: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getChargeById(id: string) {
  const charge = await prisma.charge.findUnique({
    where: {
      id,
    },

    include: {
      patient: true,
      hospital: true,
      encounter: true,
      invoiceItem: {
        include: {
          invoice: true,
        },
      },
    },
  });

  if (!charge) {
    throw new Error("CHARGE_NOT_FOUND");
  }

  return charge;
}

export async function createInvoice(
  input: CreateInvoiceInput
) {
  if (!input.chargeIds?.length) {
    throw new Error("CHARGES_REQUIRED");
  }

  const hospital = await prisma.hospital.findUnique({
    where: {
      id: input.hospitalId,
    },
  });

  if (!hospital) {
    throw new Error("HOSPITAL_NOT_FOUND");
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: input.patientId,
    },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const charges = await prisma.charge.findMany({
    where: {
      id: {
        in: input.chargeIds,
      },
      hospitalId: input.hospitalId,
      patientId: input.patientId,
      status: "PENDING",
    },
  });


  if (charges.length !== input.chargeIds.length) {
    console.log("EXPECTED:", input.chargeIds.length);
    console.log("FOUND:", charges.length);

    throw new Error("INVALID_CHARGES");
    }

  const alreadyInvoiced = await prisma.invoiceItem.findMany({
    where: {
      chargeId: {
        in: input.chargeIds,
      },
    },
  });

  if (alreadyInvoiced.length > 0) {
    throw new Error("CHARGE_ALREADY_INVOICED");
  }

  const subtotal = charges.reduce(
    (sum, charge) => sum + Number(charge.amount),
    0
  );

  const discountAmount =
    input.discountAmount ?? 0;

  const taxAmount = input.taxAmount ?? 0;

  if (discountAmount < 0 || taxAmount < 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const totalAmount =
    subtotal - discountAmount + taxAmount;

  if (totalAmount < 0) {
    throw new Error("INVALID_TOTAL");
  }

  const invoiceNumber = `INV-${Date.now()}`;

  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        hospitalId: input.hospitalId,
        patientId: input.patientId,

        invoiceNumber,

        status: "DRAFT",

        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,

        dueAt: input.dueAt
          ? new Date(input.dueAt)
          : undefined,

        items: {
          create: charges.map((charge) => ({
            chargeId: charge.id,
            description: charge.description,
            quantity: charge.quantity,
            unitPrice: charge.unitPrice,
            amount: charge.amount,
          })),
        },
      },

      include: {
        items: {
          include: {
            charge: true,
          },
        },
        patient: true,
        hospital: true,
      },
    });

    await tx.charge.updateMany({
      where: {
        id: {
          in: input.chargeIds,
        },
      },

      data: {
        status: "BILLED",
      },
    });

    return invoice;
  });
}

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      patient: true,
      hospital: true,
      items: {
        include: {
          charge: true,
        },
      },
      payments: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },

    include: {
      patient: true,
      hospital: true,

      items: {
        include: {
          charge: true,
        },
      },

      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  return invoice;
}

export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput
) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
  });

  if (!invoice) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  if (invoice.status === "PAID") {
    throw new Error("INVOICE_ALREADY_PAID");
  }

  const discountAmount =
    input.discountAmount ?? Number(invoice.discountAmount);

  const taxAmount =
    input.taxAmount ?? Number(invoice.taxAmount);

  const totalAmount =
    Number(invoice.subtotal) -
    discountAmount +
    taxAmount;

  if (totalAmount < 0) {
    throw new Error("INVALID_TOTAL");
  }

  return prisma.invoice.update({
    where: {
      id,
    },

    data: {
      status: input.status,
      discountAmount,
      taxAmount,
      totalAmount,

      issuedAt:
        input.status === "ISSUED"
          ? new Date()
          : undefined,

      dueAt: input.dueAt
        ? new Date(input.dueAt)
        : undefined,
    },

    include: {
      items: {
        include: {
          charge: true,
        },
      },
      patient: true,
      hospital: true,
      payments: true,
    },
  });
}