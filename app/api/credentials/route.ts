// app/api/credentials/route.ts
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// Get all credentials
export async function GET() {
  try {
    // Get credentials from Redis
    const data = await kv.get("credentials");

    // Return empty array if no data
    if (!data) {
      return NextResponse.json([]);
    }

    // Return data directly
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

// Add a new credential
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { recipientEmail, key, value } = data;

    if (!recipientEmail || !key || !value) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current credentials
    const credentialsData = await kv.get("credentials");

    // Handle null case and ensure we have an array
    const credentials = Array.isArray(credentialsData) ? credentialsData : [];

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

    // Save back to Redis
    await kv.set("credentials", credentials);

    return NextResponse.json({ status: "success", credential: newCredential });
  } catch (error) {
    console.error("Error adding credential:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to add credential" },
      { status: 500 }
    );
  }
}
