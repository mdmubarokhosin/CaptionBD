import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug, getAllCaptions } from "@/lib/database";

// GET /api/categories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const captions = await getAllCaptions({ category: category.id });

    return NextResponse.json({ success: true, category, captions });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
