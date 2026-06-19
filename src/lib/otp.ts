// WhatsApp OTP via Twilio Verify. Twilio generates, sends, and checks the code;
// we just call two endpoints. Until the env vars are set the flow runs in DEMO
// mode (no real message; any 4–6 digit code is accepted) so dev/staging works.
//
// To go live, set in the environment (server-side only):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
// and enable the WhatsApp channel + an approved OTP template on the Verify
// Service in the Twilio console.

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SERVICE = process.env.TWILIO_VERIFY_SERVICE_SID;

export const otpLive = Boolean(SID && TOKEN && SERVICE);

function authHeader() {
  return 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');
}

// Send a WhatsApp verification code to a phone in E.164 (+9665XXXXXXXX).
export async function startVerification(phone: string): Promise<{ ok: boolean }> {
  if (!otpLive) return { ok: true }; // demo: pretend it was sent
  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${SERVICE}/Verifications`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, Channel: 'whatsapp' }),
      },
    );
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// Check a code the user entered. Returns whether it was approved.
export async function checkVerification(
  phone: string,
  code: string,
): Promise<{ approved: boolean }> {
  if (!otpLive) return { approved: /^\d{4,6}$/.test(code) }; // demo: any 4–6 digits
  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${SERVICE}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, Code: code }),
      },
    );
    if (!res.ok) return { approved: false };
    const data = (await res.json()) as { status?: string };
    return { approved: data.status === 'approved' };
  } catch {
    return { approved: false };
  }
}
