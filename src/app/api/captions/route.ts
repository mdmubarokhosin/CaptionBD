import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import {
  getAllCaptions,
  searchCaptions,
} from "@/lib/database";

// GET /api/captions?category=love&featured=true&mood=sad&limit=20&page=1&search=keyword&status=published&tag=romantic
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (search) {
      const captions = await searchCaptions(search, 200);
      const total = captions.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedCaptions = captions.slice(start, start + limit);

      return NextResponse.json({
        success: true,
        captions: paginatedCaptions,
        total,
        totalPages,
        page,
      });
    }

    const category = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const mood = searchParams.get("mood") || undefined;
    const status = searchParams.get("status") || undefined;
    const tag = searchParams.get("tag") || undefined;

    // Fetch all matching captions (up to a safe limit) for client-side pagination
    const fetchLimit = Math.max(limit, 200);
    const captions = await getAllCaptions({
      category,
      featured,
      mood,
      limit: fetchLimit,
      status,
    });

    // Filter by tag if provided
    const filteredCaptions = tag
      ? captions.filter((c: any) =>
          c.tagsList?.some((t: any) => t.slug === tag)
        )
      : captions;

    const total = filteredCaptions.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedCaptions = filteredCaptions.slice(start, start + limit);

    // Transform tagsList to nested tags format for frontend compatibility
    const transformedCaptions = paginatedCaptions.map((caption: any) => ({
      ...caption,
      tags: (caption.tagsList || []).map((tag: any) => ({
        tag: { name: tag.name, slug: tag.slug },
      })),
    }));

    return NextResponse.json({
      success: true,
      captions: transformedCaptions,
      total,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Error fetching captions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch captions" },
      { status: 500 }
    );
  }
}
