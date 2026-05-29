import { NextRequest, NextResponse } from "next/server";
import { seedDatabase, clearDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "clear") {
      const result = await clearDatabase();
      return NextResponse.json(result);
    }

    if (action === "seed") {
      const result = await seedDatabase();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action. Use 'seed' or 'clear'." }, { status: 400 });
  } catch (error) {
    console.error("Error in seed operation:", error);
    return NextResponse.json({ error: "Seed operation failed" }, { status: 500 });
  }
}
