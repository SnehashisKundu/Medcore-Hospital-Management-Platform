import multer from "multer";
import path from "path";
import fs from "fs";

const signaturesDirectory = path.join(
  process.cwd(),
  "uploads",
  "signatures"
);

if (!fs.existsSync(signaturesDirectory)) {
  fs.mkdirSync(signaturesDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, signaturesDirectory);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const uniqueName =
      `signature-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only PNG and JPEG signature images are allowed"
      )
    );
  }

  cb(null, true);
};

export const signatureUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});