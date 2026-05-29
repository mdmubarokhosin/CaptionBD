import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import {
  getCaptionById,
  updateCaption,
  deleteCaption,
  incrementCaptionField,
} from "@/lib/database";

// GET /api/captions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caption = await getCaptionById(id);

    if (!caption) {
      return NextResponse.json(
        { success: false, error: "Caption not found" },
        { status: 404 }
      );
    }

    // Transform tagsList to nested tags format for frontend compatibility
    const transformedCaption = {
      ...caption,
      tags: (caption.tagsList || []).map((tag: any) => ({
        tag: { name: tag.name, slug: tag.slug },
      })),
    };

    return NextResponse.json({ success: true, caption: transformedCaption });
  } catch (error) {
    console.error("Error fetching caption:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch caption" },
      { status: 500 }
    );
  }
}

// PATCH /api/captions/[id] — supports actions: copy, like, view, or generic update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "copy") {
      await incrementCaptionField(id, "copyCount");
      return NextResponse.json({ success: true, message: "Copy count incremented" });
    }

    if (body.action === "like") {
      await incrementCaptionField(id, "likeCount");
      return NextResponse.json({ success: true, message: "Like count incremented" });
    }

    if (body.action === "view") {
      await incrementCaptionField(id, "views");
      return NextResponse.json({ success: true, message: "View count incremented" });
    }

    // Generic update — exclude the `action` key from the update payload
    const { action, ...updateData } = body;
    await updateCaption(id, updateData);

    return NextResponse.json({ success: true, message: "Caption updated" });
  } catch (error) {
    console.error("Error updating caption:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update caption" },
      { status: 500 }
    );
  }
}

// DELETE /api/captions/[id]
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
    return NextResponse.json(
      { success: false, error: "Failed to delete caption" },
      { status: 500 }
    );
  }
}
