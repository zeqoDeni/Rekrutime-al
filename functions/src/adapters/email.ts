export interface InviteEmailPayload {
  email: string;
  inviteCode: string;
  orgName: string;
  role: "owner" | "admin" | "recruiter" | "viewer";
  acceptUrl: string;
}

export async function sendInviteEmail(payload: InviteEmailPayload): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("SendGrid is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.email }] }],
      from: { email: fromEmail, name: "Rekrutime" },
      subject: `You're invited to join ${payload.orgName}`,
      content: [
        {
          type: "text/plain",
          value: [
            `You have been invited to join ${payload.orgName} as ${payload.role}.`,
            "",
            `Accept the invite: ${payload.acceptUrl}`,
            "",
            "If you did not expect this invite, you can ignore this email.",
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid invite email failed: ${response.status} ${body}`);
  }
}
