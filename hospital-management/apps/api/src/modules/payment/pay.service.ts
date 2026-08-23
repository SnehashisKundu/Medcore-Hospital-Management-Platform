import crypto from "node:crypto";

import { prisma } from "../../config/prisma";
import { anchorPaymentHash } from "../../services/blockchain.service";

type PaymentMethod =
  | "CASH"
  | "CARD"
  | "UPI"
  | "NET_BANKING"
  | "INSURANCE"
  | "OTHER";

type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string;
}

interface UpdatePaymentInput {
  status?: PaymentStatus;
  transactionReference?: string;
  paidAt?: string;
}

function generatePaymentHash(data: {
  paymentId: string;
  invoiceId: string;
  amount: string;
  method: string;
  status: string;
  transactionReference?: string;
  paidAt: Date;
}) {
  const payload = JSON.stringify({
    paymentId: data.paymentId,
    invoiceId: data.invoiceId,
    amount: data.amount,
    method: data.method,
    status: data.status,
    transactionReference:
      data.transactionReference ?? null,
    paidAt: data.paidAt.toISOString(),
  });

  return crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex");
}

export async function createPayment(
  input: CreatePaymentInput
) {
  if (input.amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: input.invoiceId,
    },
  });

  if (!invoice) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  if (
    invoice.status === "DRAFT" ||
    invoice.status === "CANCELLED"
  ) {
    throw new Error("INVOICE_NOT_PAYABLE");
  }

  if (invoice.status === "PAID") {
    throw new Error("INVOICE_ALREADY_PAID");
  }

  /*
   * First complete the database operation.
   * We intentionally DO NOT call blockchain
   * inside Prisma transaction.
   */
  const payment = await prisma.$transaction(
    async (tx) => {
      const successfulPayments =
        await tx.payment.findMany({
          where: {
            invoiceId: input.invoiceId,
            status: "SUCCESS",
          },
        });

      const alreadyPaid =
        successfulPayments.reduce(
          (sum, payment) =>
            sum + Number(payment.amount),
          0
        );

      const totalAmount =
        Number(invoice.totalAmount);

      const remainingAmount =
        totalAmount - alreadyPaid;

      if (input.amount > remainingAmount) {
        throw new Error(
          "PAYMENT_EXCEEDS_DUE"
        );
      }

      const paymentStatus =
        input.status ?? "SUCCESS";

      const paidAt =
        paymentStatus === "SUCCESS"
          ? new Date()
          : undefined;

      const createdPayment =
        await tx.payment.create({
          data: {
            invoiceId: input.invoiceId,
            amount: input.amount,
            method: input.method,
            status: paymentStatus,

            transactionReference:
              input.transactionReference?.trim(),

            paidAt,
          },
        });

      if (paymentStatus === "SUCCESS") {
        const newPaidAmount =
          alreadyPaid + input.amount;

        const newInvoiceStatus =
          newPaidAmount >= totalAmount
            ? "PAID"
            : "PARTIALLY_PAID";

        await tx.invoice.update({
          where: {
            id: input.invoiceId,
          },

          data: {
            status: newInvoiceStatus,
          },
        });
      }

      return createdPayment;
    }
  );

  /*
   * Blockchain only for successful payments.
   */
  if (
    payment.status === "SUCCESS" &&
    payment.paidAt
  ) {
    const blockchainHash =
      generatePaymentHash({
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,

        transactionReference:
          payment.transactionReference ??
          undefined,

        paidAt: payment.paidAt,
      });

    /*
     * Store SHA-256 hash first.
     */
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        blockchainHash,
      },
    });

    /*
     * Anchor hash on Sepolia.
     */
    const blockchainTxId =
      await anchorPaymentHash(
        blockchainHash
      );

    /*
     * Save confirmed blockchain transaction ID.
     */
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        blockchainTxId,
      },
    });
  }

  /*
   * Return fresh payment with blockchain data.
   */
  return prisma.payment.findUnique({
    where: {
      id: payment.id,
    },

    include: {
      invoice: true,
    },
  });
}

export async function getPayments() {
  return prisma.payment.findMany({
    include: {
      invoice: {
        include: {
          patient: true,
          hospital: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPaymentById(
  id: string
) {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        invoice: {
          include: {
            patient: true,
            hospital: true,

            items: {
              include: {
                charge: true,
              },
            },
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      "PAYMENT_NOT_FOUND"
    );
  }

  return payment;
}

export async function updatePayment(
  id: string,
  input: UpdatePaymentInput
) {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },
    });

  if (!payment) {
    throw new Error(
      "PAYMENT_NOT_FOUND"
    );
  }

  if (payment.status === "REFUNDED") {
    throw new Error(
      "PAYMENT_ALREADY_REFUNDED"
    );
  }

  return prisma.payment.update({
    where: {
      id,
    },

    data: {
      status: input.status,

      transactionReference:
        input.transactionReference?.trim(),

      paidAt: input.paidAt
        ? new Date(input.paidAt)
        : input.status === "SUCCESS"
          ? new Date()
          : undefined,
    },

    include: {
      invoice: true,
    },
  });
}