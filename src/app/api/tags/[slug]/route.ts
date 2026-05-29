import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import { getTagBySlug, getAllCaptions } from "@/lib/database";

// GET /api/tags/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tag = await getTagBySlug(slug);

    if (!tag) {
      return NextResponse.json(
        { success: false, error: "Tag not found" },
        { status: 404 }
      );
    }

    // Fetch all captions and filter by the tag
    const allCaptions = await getAllCaptions();
    const captions = allCaptions.filter(
      (caption) =>
        caption.tagsList &&
        Array.isArray(caption.tagsList) &&
        caption.tagsList.some((t) => t.id === tag.id)
    );

    // Transform tagsList to nested tags format for frontend compatibility
    const transformedCaptions = captions.map((caption: any) => ({
      ...caption,
      tags: (caption.tagsList || []).map((t: any) => ({
        tag: { name: t.name, slug: t.slug },
      })),
    }));

    return NextResponse.json({ success: true, tag, captions: transformedCaptions });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tag" },
      { status: 500 }
    );
  }
}
