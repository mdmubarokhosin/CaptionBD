import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge';

import { createCategory, updateCategory, deleteCategory } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameEn, slug, description, icon, color, order, isPopular } = body;

    if (!name || !nameEn || !slug) {
      return NextResponse.json({ error: "Name, nameEn, and slug are required" }, { status: 400 });
    }

    const id = await createCategory({
      name: name || "",
      nameEn: nameEn || "",
      slug: slug || "",
      description: description || "",
      icon: icon || "📌",
      color: color || "#8B5CF6",
      order: order || 0,
      isPopular: isPopular || false,
    });

    return NextResponse.json({ success: true, id, message: "Category created" });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, nameEn, slug, description, icon, color, order, isPopular } = body;

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (isPopular !== undefined) updateData.isPopular = isPopular;

    await updateCategory(id, updateData);
    return NextResponse.json({ success: true, message: "Category updated" });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    await deleteCategory(id);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
