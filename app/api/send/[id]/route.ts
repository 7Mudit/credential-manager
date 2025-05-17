// app/api/send/[id]/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import nodemailer from "nodemailer";

const dataFilePath = path.join(process.cwd(), "data", "credentials.json");

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = parseInt(params.id);

  // Get credential data
  const data = await fs.readFile(dataFilePath, "utf8");
  const credentials = JSON.parse(data);

  const cred = credentials.find((c) => c.id === id);

  if (!cred) {
    return NextResponse.json(
      { status: "error", message: "Credential not found" },
      { status: 404 }
    );
  }

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: cred.recipientEmail,
      subject: "Your Credentials",
      text: `
Hello,

Here are your credentials:
Key: ${cred.key}
Value: ${cred.value}

Please DO NOTHING UNTIL TOLD OTHERWISE.

Thank you,
The Team
      `,
    });

    // Update last sent time
    const now = new Date().toISOString();
    cred.lastSent = now;

    // await fs.writeFile(dataFilePath, JSON.stringify(credentials, null, 2));

    return NextResponse.json({ status: "success", lastSent: now });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to send email" },
      { status: 500 }
    );
  }
}
