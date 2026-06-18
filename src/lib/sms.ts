type SendSmsResult = {
  sent: boolean;
  skipped: boolean;
};

function normalizePhone(phone: string) {
  const trimmed = phone.trim().replace(/\s/g, "");

  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  if (trimmed.startsWith("0")) {
    return `+33${trimmed.slice(1)}`;
  }

  return trimmed;
}

export async function sendSms(input: {
  to: string;
  message: string;
}): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !from) {
    return { sent: false, skipped: true };
  }

  try {
    const body = new URLSearchParams({
      To: normalizePhone(input.to),
      From: from,
      Body: input.message,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    return { sent: response.ok, skipped: false };
  } catch (error) {
    console.error("SMS sending failed", error);
    return { sent: false, skipped: false };
  }
}

export async function sendReadyRepairSms(input: {
  firstName: string;
  phone: string;
  deviceType: string;
  brand: string;
  model: string;
}) {
  return sendSms({
    to: input.phone,
    message: `Bonjour ${input.firstName}, votre ${input.deviceType} ${input.brand} ${input.model} est pret. Vous pouvez venir le recuperer au magasin.`,
  });
}
