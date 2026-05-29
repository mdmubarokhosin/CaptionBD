import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import { updateCaption, deleteCaption } from "@/lib/database";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateCaption(id, body);
    return NextResponse.json({ success: true, message: "Caption updated" });
  } catch (error) {
    console.error("Error updating caption:", error);
    return NextResponse.json({ error: "Failed to update caption" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCaption(id);
    return NextResponse.json({ success: true, message: "Caption deleted" });
  } catch (error) {
    console.error("Error deleting caption:", error);
    return NextResponse.json({ error: "Failed to delete caption" }, { status: 500 });
  }
}
