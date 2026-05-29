// ─── Firebase Realtime Database Types ──────────────────────────────────────────

export interface Caption {
  id: string;
  text: string;
  categoryId: string;
  tags: string[];
  mood: string;
  type: string;
  emojis: string;
  isFeatured: boolean;
  copyCount: number;
  likeCount: number;
  views: number;
  status: "published" | "draft" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  captionCount: number;
  isPopular: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  captionCount: number;
  createdAt: number;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  description: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    pinterest?: string;
    youtube?: string;
    linkedin?: string;
  };
  updatedAt: number;
}

export interface DashboardStats {
  totalCaptions: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
  totalLikes: number;
  totalCopies: number;
  publishedCaptions: number;
  draftCaptions: number;
  featuredCaptions: number;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CaptionWithCategory extends Caption {
  category: Pick<Category, "name" | "color" | "icon" | "slug">;
}

export interface CaptionWithCategoryAndTags extends CaptionWithCategory {
  tagsList: Tag[];
}
