// app/api/send/[id]/route.ts
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    // Get credentials from Redis
    const credentialsData = await kv.get("credentials");
    if (!credentialsData) {
      return NextResponse.json(
        { status: "error", message: "No credentials found" },
        { status: 404 }
      );
    }

    // Use credentials directly - no parsing needed
    const credentials = credentialsData;
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

    // Save updated credentials back to Redis
    await kv.set("credentials", credentials);

    return NextResponse.json({ status: "success", lastSent: now });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to send email" },
      { status: 500 }
    );
  }
}
