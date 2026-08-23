import { prisma } from "../../config/prisma";

interface CreateClinicalNoteInput {
  encounterId: string;
  createdById: string;
  noteType: "GENERAL" | "PROGRESS" | "FOLLOW_UP" | "DISCHARGE";
  content: string;
}

interface UpdateClinicalNoteInput {
  noteType?: "GENERAL" | "PROGRESS" | "FOLLOW_UP" | "DISCHARGE";
  content?: string;
}

export async function createClinicalNote(
  input: CreateClinicalNoteInput
) {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: input.encounterId,
    },
  });

  if (!encounter) {
    throw new Error("ENCOUNTER_NOT_FOUND");
  }

  if (encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.createdById,
    },
  });

  if (!user) {
    throw new Error("CREATOR_NOT_FOUND");
  }

  return prisma.encounterClinicalNote.create({
    data: {
      encounterId: input.encounterId,
      createdById: input.createdById,
      noteType: input.noteType,
      content: input.content.trim(),
    },
  });
}

export async function getClinicalNotes() {
  return prisma.encounterClinicalNote.findMany({
    include: {
      encounter: true,

      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClinicalNoteById(id: string) {
  const note =
    await prisma.encounterClinicalNote.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,

        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

  if (!note) {
    throw new Error("CLINICAL_NOTE_NOT_FOUND");
  }

  return note;
}

export async function updateClinicalNote(
  id: string,
  input: UpdateClinicalNoteInput
) {
  const note =
    await prisma.encounterClinicalNote.findUnique({
      where: {
        id,
      },

      include: {
        encounter: true,
      },
    });

  if (!note) {
    throw new Error("CLINICAL_NOTE_NOT_FOUND");
  }

  if (note.encounter.status === "CANCELLED") {
    throw new Error("ENCOUNTER_CANCELLED");
  }

  return prisma.encounterClinicalNote.update({
    where: {
      id,
    },

    data: {
      noteType: input.noteType,

      content: input.content?.trim(),
    },
  });
}