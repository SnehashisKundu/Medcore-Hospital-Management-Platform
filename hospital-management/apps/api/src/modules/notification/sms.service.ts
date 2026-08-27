import twilio from "twilio";

interface SendSmsInput {
  to: string;
  message: string;
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio is not configured. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required."
    );
  }

  return twilio(accountSid, authToken);
}

export async function sendSms({
  to,
  message,
}: SendSmsInput): Promise<void> {
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error(
      "Twilio is not configured. TWILIO_PHONE_NUMBER is required."
    );
  }

  const client = getTwilioClient();

  await client.messages.create({
    body: message,
    from,
    to,
  });
}