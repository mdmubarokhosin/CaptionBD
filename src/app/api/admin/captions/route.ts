import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import { createCaption } from "@/lib/database";

// POST /api/admin/captions — Create a new caption
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = await createCaption(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating caption:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create caption" },
      { status: 500 }
    );
  }
}
