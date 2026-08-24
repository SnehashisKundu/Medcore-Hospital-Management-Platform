-- The preceding migration creates this column as `otp`. Rename it so the
-- stored value matches the hashed OTP used by the application.
ALTER TABLE "EmailVerificationOtp" RENAME COLUMN "otp" TO "otpHash";
