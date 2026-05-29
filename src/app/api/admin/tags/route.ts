import { NextRequest, NextResponse } from "next/server";
import { createTag, deleteTag } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0980-\u09ff-]/g, "");

    const id = await createTag({
      name: name.trim(),
      slug: slug || name.trim(),
    });

    return NextResponse.json({ success: true, id, message: "Tag created" });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Tag id is required" }, { status: 400 });
    }

    await deleteTag(id);
    return NextResponse.json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
