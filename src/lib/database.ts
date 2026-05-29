import type { Caption, Category, Tag, SiteConfig, DashboardStats, CaptionWithCategoryAndTags } from "@/types";

// ─── Firebase REST API (no SDK needed — saves ~8MB bundle size) ──────────────

const DB_URL = "https://flix-net-bd1-default-rtdb.firebaseio.com";

async function dbGet(path: string): Promise<any> {
  const res = await fetch(`${DB_URL}/${path}.json`);
  if (!res.ok) throw new Error(`DB GET ${path} failed: ${res.status}`);
  const data = await res.json();
  return data === null ? null : data;
}

async function dbPost(path: string, data: any): Promise<string> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB POST ${path} failed: ${res.status}`);
  const result = await res.json();
  return result.name as string;
}

async function dbPut(path: string, data: any): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB PUT ${path} failed: ${res.status}`);
}

async function dbPatch(path: string, data: any): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB PATCH ${path} failed: ${res.status}`);
}

async function dbDelete(path: string): Promise<void> {
  const res = await fetch(`${DB_URL}/${path}.json`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DB DELETE ${path} failed: ${res.status}`);
}

// ─── Helper: Convert Firebase REST object to array ────────────────────────────

function objectToArray<T>(obj: Record<string, any> | null): (T & { id: string })[] {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({
    id: key,
    ...value,
  })) as (T & { id: string })[];
}

// ─── Captions ────────────────────────────────────────────────────────────────

export async function getAllCaptions(options?: {
  category?: string;
  featured?: boolean;
  mood?: string;
  limit?: number;
  status?: string;
}): Promise<CaptionWithCategoryAndTags[]> {
  const raw = await dbGet("captions");
  let captions = objectToArray<Caption>(raw);

  // Filter by status
  captions = captions.filter((c) => c.status === (options?.status || "published"));

  // Filter by category
  if (options?.category) {
    captions = captions.filter((c) => c.categoryId === options.category);
  }

  // Filter by featured
  if (options?.featured) {
    captions = captions.filter((c) => c.isFeatured);
  }

  // Filter by mood
  if (options?.mood) {
    captions = captions.filter((c) => c.mood === options.mood);
  }

  // Sort by createdAt descending
  captions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Limit
  if (options?.limit) {
    captions = captions.slice(0, options.limit);
  }

  // Attach categories and tags
  const allCategories = await getAllCategoriesMap();
  const allTags = await getAllTagsMap();

  return captions.map((caption) => ({
    ...caption,
    category: allCategories[caption.categoryId] || { name: "অজানা", color: "#8B5CF6", icon: "📝", slug: "unknown" },
    tagsList: (caption.tags || [])
      .map((tagId: string) => allTags[tagId])
      .filter(Boolean),
  }));
}

export async function getCaptionById(id: string): Promise<CaptionWithCategoryAndTags | null> {
  const raw = await dbGet(`captions/${id}`);
  if (!raw) return null;

  const caption = { id, ...raw } as Caption;
  const allCategories = await getAllCategoriesMap();
  const allTags = await getAllTagsMap();

  return {
    ...caption,
    category: allCategories[caption.categoryId] || { name: "অজানা", color: "#8B5CF6", icon: "📝", slug: "unknown" },
    tagsList: (caption.tags || [])
      .map((tagId: string) => allTags[tagId])
      .filter(Boolean),
  };
}

export async function searchCaptions(searchTerm: string, limitCount: number = 50): Promise<CaptionWithCategoryAndTags[]> {
  const allCaptions = await getAllCaptions();
  const term = searchTerm.toLowerCase();

  const filtered = allCaptions.filter(
    (c) =>
      c.text.toLowerCase().includes(term) ||
      c.mood.toLowerCase().includes(term) ||
      c.type.toLowerCase().includes(term)
  );

  return filtered.slice(0, limitCount);
}

export async function createCaption(data: Omit<Caption, "id" | "copyCount" | "likeCount" | "views" | "createdAt" | "updatedAt">): Promise<string> {
  const now = Date.now();
  const id = await dbPost("captions", {
    ...data,
    copyCount: 0,
    likeCount: 0,
    views: 0,
    createdAt: now,
    updatedAt: now,
  });

  // Update category caption count
  const catRaw = await dbGet(`categories/${data.categoryId}/captionCount`);
  const currentCount = (catRaw as number) || 0;
  await dbPatch(`categories/${data.categoryId}`, { captionCount: currentCount + 1 });

  // Update tag caption counts
  for (const tagId of data.tags || []) {
    const tagRaw = await dbGet(`tags/${tagId}/captionCount`);
    const tagCount = (tagRaw as number) || 0;
    await dbPatch(`tags/${tagId}`, { captionCount: tagCount + 1 });
  }

  return id;
}

export async function updateCaption(id: string, data: Partial<Caption>): Promise<void> {
  await dbPatch(`captions/${id}`, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteCaption(id: string): Promise<void> {
  const raw = await dbGet(`captions/${id}`);
  if (raw) {
    const caption = raw as Caption;
    const catRaw = await dbGet(`categories/${caption.categoryId}/captionCount`);
    const currentCount = (catRaw as number) || 0;
    await dbPatch(`categories/${caption.categoryId}`, {
      captionCount: Math.max(0, currentCount - 1),
    });
  }
  await dbDelete(`captions/${id}`);
}

export async function incrementCaptionField(id: string, field: "copyCount" | "likeCount" | "views", amount: number = 1): Promise<void> {
  const raw = await dbGet(`captions/${id}`);
  if (raw) {
    const current = (raw as any)[field] || 0;
    await dbPatch(`captions/${id}`, { [field]: current + amount });
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const raw = await dbGet("categories");
  const categories = objectToArray<Category>(raw);
  return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function getAllCategoriesMap(): Promise<Record<string, Pick<Category, "name" | "color" | "icon" | "slug">>> {
  const raw = await dbGet("categories");
  if (!raw) return {};
  const map: Record<string, Pick<Category, "name" | "color" | "icon" | "slug">> = {};
  Object.entries(raw).forEach(([key, value]: [string, any]) => {
    map[key] = {
      name: value.name,
      color: value.color,
      icon: value.icon,
      slug: value.slug,
    };
  });
  return map;
}

async function getCategoryCaptionCount(categoryId: string): Promise<number> {
  const raw = await dbGet(`categories/${categoryId}/captionCount`);
  return (raw as number) || 0;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug) || null;
}

export async function createCategory(data: Omit<Category, "id" | "captionCount" | "createdAt">): Promise<string> {
  return await dbPost("categories", {
    ...data,
    captionCount: 0,
    createdAt: Date.now(),
  });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await dbPatch(`categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
  // Update captions that reference this category
  const captionsRaw = await dbGet("captions");
  if (captionsRaw) {
    const updates: Record<string, any> = {};
    Object.entries(captionsRaw).forEach(([key, value]: [string, any]) => {
      if (value.categoryId === id) {
        updates[`captions/${key}/categoryId`] = "uncategorized";
      }
    });
    if (Object.keys(updates).length > 0) {
      // Apply updates via individual patches
      for (const [path, val] of Object.entries(updates)) {
        const nodePath = path.replace("captions/", "");
        await dbPatch(`captions/${nodePath}`, val);
      }
    }
  }
  await dbDelete(`categories/${id}`);
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const raw = await dbGet("tags");
  return objectToArray<Tag>(raw).sort((a, b) => (b.captionCount || 0) - (a.captionCount || 0));
}

async function getAllTagsMap(): Promise<Record<string, Tag>> {
  const raw = await dbGet("tags");
  if (!raw) return {};
  const map: Record<string, Tag> = {};
  Object.entries(raw).forEach(([key, value]: [string, any]) => {
    map[key] = { id: key, ...value } as Tag;
  });
  return map;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const tags = await getAllTags();
  return tags.find((t) => t.slug === slug) || null;
}

export async function createTag(data: Omit<Tag, "id" | "captionCount" | "createdAt">): Promise<string> {
  return await dbPost("tags", {
    ...data,
    captionCount: 0,
    createdAt: Date.now(),
  });
}

export async function deleteTag(id: string): Promise<void> {
  // Remove tag from all captions
  const captionsRaw = await dbGet("captions");
  if (captionsRaw) {
    Object.entries(captionsRaw).forEach(async ([key, value]: [string, any]) => {
      if (value.tags && Array.isArray(value.tags) && value.tags.includes(id)) {
        await dbPatch(`captions/${key}`, {
          tags: (value.tags as string[]).filter((t) => t !== id),
        });
      }
    });
  }
  await dbDelete(`tags/${id}`);
}

// ─── Site Config ─────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const raw = await dbGet("siteConfig");
  if (!raw) {
    return {
      siteName: "CaptionLover",
      tagline: "বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল",
      description: "বাংলা ক্যাপশনের সমৃদ্ধ ভাণ্ডার",
      socialLinks: {},
      updatedAt: Date.now(),
    };
  }
  return raw as SiteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  await dbPatch("siteConfig", {
    ...data,
    updatedAt: Date.now(),
  });
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const [captionsRaw, categoriesRaw, tagsRaw] = await Promise.all([
    dbGet("captions"),
    dbGet("categories"),
    dbGet("tags"),
  ]);

  const captions = captionsRaw
    ? Object.values(captionsRaw as Record<string, Caption>)
    : [];

  return {
    totalCaptions: captions.length,
    totalCategories: categoriesRaw ? Object.keys(categoriesRaw).length : 0,
    totalTags: tagsRaw ? Object.keys(tagsRaw).length : 0,
    totalViews: captions.reduce((sum, c) => sum + (c.views || 0), 0),
    totalLikes: captions.reduce((sum, c) => sum + (c.likeCount || 0), 0),
    totalCopies: captions.reduce((sum, c) => sum + (c.copyCount || 0), 0),
    publishedCaptions: captions.filter((c) => c.status === "published").length,
    draftCaptions: captions.filter((c) => c.status === "draft").length,
    featuredCaptions: captions.filter((c) => c.isFeatured).length,
  };
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  const existingCategories = await dbGet("categories");
  if (existingCategories) {
    return { success: false, message: "ডাটাবেজে ইতিমধ্যে ডাটা আছে। প্রথমে ডাটা মুছে ফেলুন।" };
  }

  const categories: Omit<Category, "id">[] = [
    { name: "ইসলামিক", nameEn: "Islamic", slug: "islamic", description: "ইসলামিক ক্যাপশন, কোটস ও স্ট্যাটাস", icon: "🕌", color: "#10B981", order: 1, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "জীবন ও বাস্তবতা", nameEn: "Life & Reality", slug: "life", description: "জীবনের বাস্তবতা নিয়ে ক্যাপশন", icon: "🌿", color: "#059669", order: 2, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "ভালোবাসা", nameEn: "Love & Affection", slug: "love", description: "প্রেম ও ভালোবাসার ক্যাপশন", icon: "❤️", color: "#EF4444", order: 3, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "কষ্ট ও একাকীত্ব", nameEn: "Pain & Sad", slug: "sad", description: "কষ্ট, দুঃখ ও একাকীত্বের ক্যাপশন", icon: "💔", color: "#6366F1", order: 4, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "অনুপ্রেরণা ও মোটিভেশন", nameEn: "Motivation", slug: "motivation", description: "মোটিভেশনাল ও অনুপ্রেরণামূলক ক্যাপশন", icon: "💪", color: "#F59E0B", order: 5, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "প্রকৃতি ও সৌন্দর্য", nameEn: "Nature & Beauty", slug: "nature", description: "প্রকৃতি ও সৌন্দর্যের ক্যাপশন", icon: "🌸", color: "#EC4899", order: 6, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "ফেসবুক ক্যাপশন", nameEn: "Facebook Caption", slug: "facebook", description: "ফেসবুকের জন্য সেরা ক্যাপশন", icon: "📱", color: "#3B82F6", order: 7, captionCount: 0, isPopular: true, createdAt: Date.now() },
    { name: "আবেগ ও অনুভূতি", nameEn: "Emotions", slug: "emotions", description: "বিভিন্ন আবেগের ক্যাপশন", icon: "😊", color: "#8B5CF6", order: 8, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "ইমোশনাল", nameEn: "Emotional", slug: "emotional", description: "ইমোশনাল ক্যাপশন ও স্ট্যাটাস", icon: "😢", color: "#0EA5E9", order: 9, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "ফানি", nameEn: "Funny", slug: "funny", description: "মজার ও ফানি ক্যাপশন", icon: "😄", color: "#F97316", order: 10, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "ছেলেদের জন্য", nameEn: "For Boys", slug: "boys", description: "ছেলেদের জন্য স্টাইলিশ ক্যাপশন", icon: "👦", color: "#14B8A6", order: 11, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "মেয়েদের জন্য", nameEn: "For Girls", slug: "girls", description: "মেয়েদের জন্য সুন্দর ক্যাপশন", icon: "👧", color: "#F472B6", order: 12, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "ফ্যাশন ও স্টাইল", nameEn: "Fashion & Style", slug: "fashion", description: "ফ্যাশন ও স্টাইল সম্পর্কিত ক্যাপশন", icon: "👗", color: "#D946EF", order: 13, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "শুভেচ্ছা", nameEn: "Greetings", slug: "greetings", description: "জন্মদিন, ঈদ ও বিভিন্ন উৎসবের শুভেচ্ছা", icon: "🎉", color: "#22C55E", order: 14, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "সোশ্যাল মিডিয়া", nameEn: "Social Media", slug: "socialmedia", description: "সোশ্যাল মিডিয়া টিপস ও ক্যাপশন", icon: "🌐", color: "#64748B", order: 15, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "প্রেম ও বিচ্ছেদ", nameEn: "Breakup", slug: "breakup", description: "ব্রেকআপ ও বিচ্ছেদের ক্যাপশন", icon: "🥀", color: "#78716C", order: 16, captionCount: 0, isPopular: false, createdAt: Date.now() },
    { name: "ঈদ", nameEn: "Eid", slug: "eid", description: "ঈদ উদযাপনের ক্যাপশন", icon: "🌙", color: "#10B981", order: 17, captionCount: 0, isPopular: false, createdAt: Date.now() },
  ];

  const categoryIdMap: Record<string, string> = {};
  const categoryUpdates: Record<string, any> = {};

  for (const cat of categories) {
    const id = await dbPost("categories", cat);
    categoryIdMap[cat.slug] = id;
    categoryUpdates[id] = true;
  }

  // Write tags
  const tags: Omit<Tag, "id">[] = [
    { name: "রোমান্টিক", slug: "romantic", captionCount: 0, createdAt: Date.now() },
    { name: "কষ্ট", slug: "pain", captionCount: 0, createdAt: Date.now() },
    { name: "মোটিভেশন", slug: "motivation", captionCount: 0, createdAt: Date.now() },
    { name: "ফেসবুক", slug: "facebook", captionCount: 0, createdAt: Date.now() },
    { name: "জীবন", slug: "life", captionCount: 0, createdAt: Date.now() },
    { name: "প্রকৃতি", slug: "nature", captionCount: 0, createdAt: Date.now() },
    { name: "বাংলা", slug: "bangla", captionCount: 0, createdAt: Date.now() },
    { name: "ইসলামিক", slug: "islamic", captionCount: 0, createdAt: Date.now() },
    { name: "ফানি", slug: "funny", captionCount: 0, createdAt: Date.now() },
    { name: "জন্মদিন", slug: "birthday", captionCount: 0, createdAt: Date.now() },
    { name: "ফুল", slug: "flower", captionCount: 0, createdAt: Date.now() },
    { name: "ভালোবাসা", slug: "love", captionCount: 0, createdAt: Date.now() },
    { name: "একাকীত্ব", slug: "loneliness", captionCount: 0, createdAt: Date.now() },
    { name: "ইমোশনাল", slug: "emotional", captionCount: 0, createdAt: Date.now() },
    { name: "সকাল", slug: "morning", captionCount: 0, createdAt: Date.now() },
    { name: "সন্ধ্যা", slug: "evening", captionCount: 0, createdAt: Date.now() },
  ];

  const tagIdMap: Record<string, string> = {};

  for (const tag of tags) {
    const id = await dbPost("tags", tag);
    tagIdMap[tag.slug] = id;
  }

  // Write sample captions
  const sampleCaptions: Array<{ text: string; categoryId: string; tags: string[]; mood: string; type: string; emojis: string; isFeatured: boolean }> = [
    { text: "জীবন তোমার জন্য অপেক্ষা করছে, শুধু একটু সাহস রাখো।", categoryId: categoryIdMap["life"], tags: [tagIdMap["motivation"], tagIdMap["life"]], mood: "motivational", type: "status", emojis: "💪🌟", isFeatured: true },
    { text: "ভালোবাসা মানে শুধু একটা শব্দ না, এটা একটা অনুভূতি যা দিলে ছড়িয়ে পড়ে।", categoryId: categoryIdMap["love"], tags: [tagIdMap["romantic"], tagIdMap["love"]], mood: "romantic", type: "caption", emojis: "❤️🌹", isFeatured: true },
    { text: "কষ্ট আসবে, কিন্তু কষ্টের সাথে তুমিও শক্ত হয়ে যাবে।", categoryId: categoryIdMap["sad"], tags: [tagIdMap["pain"], tagIdMap["life"]], mood: "sad", type: "status", emojis: "💔🥀", isFeatured: true },
    { text: "প্রতিটি সকাল নতুন সম্ভাবনার ডাক দেয়।", categoryId: categoryIdMap["motivation"], tags: [tagIdMap["motivation"], tagIdMap["morning"]], mood: "motivational", type: "status", emojis: "🌅✨", isFeatured: true },
    { text: "আল্লাহর রহমতে সব কিছু সম্ভব।", categoryId: categoryIdMap["islamic"], tags: [tagIdMap["islamic"]], mood: "motivational", type: "caption", emojis: "🕌🤲", isFeatured: true },
    { text: "ফুলের সুবাস ছড়ায় চারপাশে, ঠিক তোমার হাসির মতো।", categoryId: categoryIdMap["nature"], tags: [tagIdMap["nature"], tagIdMap["flower"]], mood: "happy", type: "caption", emojis: "🌸🌺", isFeatured: true },
    { text: "কেউ তোমাকে অবজ্ঞা করলে রেগে যেও না, নিজেকে আরও শক্তিশালী করে তুলো।", categoryId: categoryIdMap["motivation"], tags: [tagIdMap["motivation"]], mood: "motivational", type: "status", emojis: "💪🔥", isFeatured: false },
    { text: "একা থাকার মজাই আলাদা, নিজের সাথে নিজেই সময় কাটাও।", categoryId: categoryIdMap["sad"], tags: [tagIdMap["loneliness"], tagIdMap["pain"]], mood: "sad", type: "status", emojis: "😔🖤", isFeatured: false },
    { text: "তুমি আমার জীবনের সবচেয়ে সুন্দর অধ্যায়।", categoryId: categoryIdMap["love"], tags: [tagIdMap["romantic"], tagIdMap["love"]], mood: "romantic", type: "caption", emojis: "💕📖", isFeatured: false },
    { text: "হাসি মুখে থাকলে সব কিছু সহজ হয়ে যায়।", categoryId: categoryIdMap["funny"], tags: [tagIdMap["funny"]], mood: "happy", type: "status", emojis: "😄😊", isFeatured: false },
    { text: "রাতের আকাশে তারাগুলো তোমার হাসির মতো জ্বলজ্বল করে।", categoryId: categoryIdMap["nature"], tags: [tagIdMap["nature"], tagIdMap["romantic"]], mood: "romantic", type: "caption", emojis: "✨🌙", isFeatured: false },
    { text: "জীবনে সফল হতে হলে ধৈর্য ধরতে হয়, তাড়াহুড়ো করে কিছু হয় না।", categoryId: categoryIdMap["life"], tags: [tagIdMap["motivation"], tagIdMap["life"]], mood: "motivational", type: "status", emojis: "🌱⏳", isFeatured: false },
    { text: "বিদায় বলার সাহস যার আছে, সে সত্যিই ভালোবাসতে জানে।", categoryId: categoryIdMap["breakup"], tags: [tagIdMap["pain"], tagIdMap["love"]], mood: "sad", type: "status", emojis: "🥀💔", isFeatured: false },
    { text: "ফেসবুক স্ট্যাটাস দিলে লাইক আসে, কিন্তু মনের কথা বললে কেউ শোনে না।", categoryId: categoryIdMap["facebook"], tags: [tagIdMap["facebook"], tagIdMap["emotional"]], mood: "sad", type: "status", emojis: "📱💭", isFeatured: false },
    { text: "ঈদ মোবারক! আল্লাহ সবাইকে ক্ষমা করুন ও সুখী রাখুন।", categoryId: categoryIdMap["eid"], tags: [tagIdMap["islamic"]], mood: "happy", type: "greeting", emojis: "🌙🎉", isFeatured: false },
    { text: "ছেলেদের মনেও কষ্ট হয়, শুধু প্রকাশ করতে পারে না।", categoryId: categoryIdMap["boys"], tags: [tagIdMap["pain"], tagIdMap["emotional"]], mood: "sad", type: "status", emojis: "😔👦", isFeatured: false },
    { text: "তোমার হাসি দেখে আমার দিনটা সুন্দর হয়ে যায়।", categoryId: categoryIdMap["love"], tags: [tagIdMap["romantic"]], mood: "romantic", type: "caption", emojis: "😍❤️", isFeatured: false },
    { text: "প্রকৃতির মতো শান্ত হও, তবেই জীবন সহজ হবে।", categoryId: categoryIdMap["nature"], tags: [tagIdMap["nature"], tagIdMap["life"]], mood: "motivational", type: "caption", emojis: "🌿🍃", isFeatured: false },
    { text: "সুন্দর মেয়েরা শুধু দেখতে সুন্দর নয়, তাদের মনও সুন্দর।", categoryId: categoryIdMap["girls"], tags: [tagIdMap["love"], tagIdMap["romantic"]], mood: "romantic", type: "caption", emojis: "👧🌸", isFeatured: false },
    { text: "ইমোশনাল মানুষরা বেশি ভালোবাসতে জানে, তাই বেশি কষ্ট পায়।", categoryId: categoryIdMap["emotional"], tags: [tagIdMap["emotional"], tagIdMap["pain"]], mood: "sad", type: "status", emojis: "😢💔", isFeatured: false },
  ];

  const now = Date.now();
  const captionsPerCategory: Record<string, number> = {};
  const captionsPerTag: Record<string, number> = {};

  for (let index = 0; index < sampleCaptions.length; index++) {
    const cap = sampleCaptions[index];
    await dbPost("captions", {
      ...cap,
      copyCount: 0,
      likeCount: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 500) + 50,
      status: "published",
      createdAt: now - index * 3600000,
      updatedAt: now - index * 3600000,
    });

    captionsPerCategory[cap.categoryId] = (captionsPerCategory[cap.categoryId] || 0) + 1;
    cap.tags.forEach((tagId) => {
      captionsPerTag[tagId] = (captionsPerTag[tagId] || 0) + 1;
    });
  }

  // Update category caption counts
  for (const [catId, count] of Object.entries(captionsPerCategory)) {
    await dbPatch(`categories/${catId}`, { captionCount: count });
  }

  // Update tag caption counts
  for (const [tagId, count] of Object.entries(captionsPerTag)) {
    await dbPatch(`tags/${tagId}`, { captionCount: count });
  }

  // Write site config
  await dbPut("siteConfig", {
    siteName: "CaptionLover",
    tagline: "বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল",
    description: "CaptionLover হলো বাংলা ক্যাপশনের সমৃদ্ধ ভাণ্ডার। ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য সেরা ক্যাপশন।",
    socialLinks: {
      facebook: "https://facebook.com/captionlover",
      twitter: "https://twitter.com/captionlover",
      instagram: "https://instagram.com/captionlover",
      pinterest: "https://pinterest.com/captionlover",
      youtube: "https://youtube.com/@captionlover",
    },
    updatedAt: now,
  });

  return { success: true, message: "সফলভাবে ডাটাবেজ সিড করা হয়েছে! ১৭টি ক্যাটাগরি, ১৬টি ট্যাগ ও ২০টি নমুনা ক্যাপশন যোগ করা হয়েছে।" };
}

export async function clearDatabase(): Promise<{ success: boolean; message: string }> {
  await dbDelete("captions");
  await dbDelete("categories");
  await dbDelete("tags");
  await dbDelete("siteConfig");
  return { success: true, message: "সমস্ত ডাটা মুছে ফেলা হয়েছে।" };
}
