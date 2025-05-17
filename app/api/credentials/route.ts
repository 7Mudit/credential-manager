// app/api/credentials/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const dataFilePath = path.join(process.cwd(), "data", "credentials.json");

// Helper function to ensure data file exists
async function ensureDataFile() {
  try {
    await fs.access(path.dirname(dataFilePath));
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  }

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify([]));
  }
}

// Get all credentials
export async function GET() {
  await ensureDataFile();

  const data = await fs.readFile(dataFilePath, "utf8");
  const credentials = JSON.parse(data);

  return NextResponse.json(credentials);
}

// Add a new credential
export async function POST(request: Request) {
  await ensureDataFile();

  const data = await request.json();
  const { recipientEmail, key, value } = data;

  if (!recipientEmail || !key || !value) {
    return NextResponse.json(
      { status: "error", message: "Missing required fields" },
      { status: 400 }
    );
  }

  const fileData = await fs.readFile(dataFilePath, "utf8");
  const credentials = JSON.parse(fileData);

  // Check if key already exists
  if (credentials.some((c) => c.key === key)) {
    return NextResponse.json(
      { status: "error", message: "Key already exists" },
      { status: 400 }
    );
  }

  // Add new credential
  const newCredential = {
    id:
      credentials.length > 0
        ? Math.max(...credentials.map((c) => c.id)) + 1
        : 1,
    recipientEmail,
    key,
    value,
    lastSent: null,
  };

  credentials.push(newCredential);

  await fs.writeFile(dataFilePath, JSON.stringify(credentials, null, 2));

  return NextResponse.json({ status: "success", credential: newCredential });
}
