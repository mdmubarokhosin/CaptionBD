import { db } from "@/lib/firebase";
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
  limitToLast,
  startAt,
  endAt,
} from "firebase/database";
import type { Caption, Category, Tag, SiteConfig, DashboardStats, CaptionWithCategory, CaptionWithCategoryAndTags } from "@/types";

// ─── Helper: Convert Firebase snapshot to array ──────────────────────────────

function snapshotToArray<T>(snapshot: any): (T & { id: string })[] {
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([key, value]: [string, any]) => ({
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
  const captionsRef = ref(db, "captions");
  let snapshot;

  if (options?.category) {
    const q = query(captionsRef, orderByChild("categoryId"), equalTo(options.category));
    snapshot = await get(q);
  } else {
    snapshot = await get(captionsRef);
  }

  let captions = snapshotToArray<Caption>(snapshot);

  // Filter by status
  captions = captions.filter((c) => c.status === (options?.status || "published"));

  // Filter by featured
  if (options?.featured) {
    captions = captions.filter((c) => c.isFeatured);
  }

  // Filter by mood
  if (options?.mood) {
    captions = captions.filter((c) => c.mood === options.mood);
  }

  // Sort by createdAt descending
  captions.sort((a, b) => b.createdAt - a.createdAt);

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
      .map((tagId) => allTags[tagId])
      .filter(Boolean),
  }));
}

export async function getCaptionById(id: string): Promise<CaptionWithCategoryAndTags | null> {
  const snap = await get(ref(db, `captions/${id}`));
  if (!snap.exists()) return null;

  const caption = { id, ...(snap.val() as Omit<Caption, "id">) };
  const allCategories = await getAllCategoriesMap();
  const allTags = await getAllTagsMap();

  return {
    ...caption,
    category: allCategories[caption.categoryId] || { name: "অজানা", color: "#8B5CF6", icon: "📝", slug: "unknown" },
    tagsList: (caption.tags || [])
      .map((tagId) => allTags[tagId])
      .filter(Boolean),
  };
}

export async function searchCaptions(searchTerm: string, limitCount: number = 50): Promise<CaptionWithCategoryAndTags[]> {
  const allCaptions = await getAllCaptions(); // Already has tagsList and category attached
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
  const newRef = push(ref(db, "captions"));
  const now = Date.now();
  await set(newRef, {
    ...data,
    copyCount: 0,
    likeCount: 0,
    views: 0,
    createdAt: now,
    updatedAt: now,
  });

  // Update category caption count
  await update(ref(db, `categories/${data.categoryId}`), {
    captionCount: (await getCategoryCaptionCount(data.categoryId)) + 1,
  });

  // Update tag caption counts
  for (const tagId of data.tags || []) {
    const tagSnap = await get(ref(db, `tags/${tagId}`));
    if (tagSnap.exists()) {
      const tagData = tagSnap.val() as Tag;
      await update(ref(db, `tags/${tagId}`), {
        captionCount: (tagData.captionCount || 0) + 1,
      });
    }
  }

  return newRef.key!;
}

export async function updateCaption(id: string, data: Partial<Caption>): Promise<void> {
  await update(ref(db, `captions/${id}`), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteCaption(id: string): Promise<void> {
  const snap = await get(ref(db, `captions/${id}`));
  if (snap.exists()) {
    const caption = snap.val() as Caption;
    // Decrement category count
    await update(ref(db, `categories/${caption.categoryId}`), {
      captionCount: Math.max(0, (await getCategoryCaptionCount(caption.categoryId)) - 1),
    });
  }
  await remove(ref(db, `captions/${id}`));
}

export async function incrementCaptionField(id: string, field: "copyCount" | "likeCount" | "views", amount: number = 1): Promise<void> {
  const snap = await get(ref(db, `captions/${id}`));
  if (snap.exists()) {
    const current = snap.val()[field] || 0;
    await update(ref(db, `captions/${id}`), {
      [field]: current + amount,
    });
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const snap = await get(ref(db, "categories"));
  const categories = snapshotToArray<Category>(snap);
  return categories.sort((a, b) => a.order - b.order);
}

async function getAllCategoriesMap(): Promise<Record<string, Pick<Category, "name" | "color" | "icon" | "slug">>> {
  const snap = await get(ref(db, "categories"));
  if (!snap.exists()) return {};
  const map: Record<string, Pick<Category, "name" | "color" | "icon" | "slug">> = {};
  Object.entries(snap.val()).forEach(([key, value]: [string, any]) => {
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
  const snap = await get(ref(db, `categories/${categoryId}/captionCount`));
  return snap.exists() ? (snap.val() as number) : 0;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await get(ref(db, "categories"));
  if (!snap.exists()) return null;

  const categories = snapshotToArray<Category>(snap);
  return categories.find((c) => c.slug === slug) || null;
}

export async function createCategory(data: Omit<Category, "id" | "captionCount" | "createdAt">): Promise<string> {
  const newRef = push(ref(db, "categories"));
  await set(newRef, {
    ...data,
    captionCount: 0,
    createdAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  await update(ref(db, `categories/${id}`), data);
}

export async function deleteCategory(id: string): Promise<void> {
  // Move captions to uncategorized or delete them
  const captionsSnap = await get(ref(db, "captions"));
  if (captionsSnap.exists()) {
    const updates: Record<string, any> = {};
    Object.entries(captionsSnap.val()).forEach(([key, value]: [string, any]) => {
      if (value.categoryId === id) {
        updates[`captions/${key}/categoryId`] = "uncategorized";
      }
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  }
  await remove(ref(db, `categories/${id}`));
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const snap = await get(ref(db, "tags"));
  return snapshotToArray<Tag>(snap).sort((a, b) => b.captionCount - a.captionCount);
}

async function getAllTagsMap(): Promise<Record<string, Tag>> {
  const snap = await get(ref(db, "tags"));
  if (!snap.exists()) return {};
  const map: Record<string, Tag> = {};
  Object.entries(snap.val()).forEach(([key, value]: [string, any]) => {
    map[key] = { id: key, ...value } as Tag;
  });
  return map;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const snap = await get(ref(db, "tags"));
  if (!snap.exists()) return null;

  const tags = snapshotToArray<Tag>(snap);
  return tags.find((t) => t.slug === slug) || null;
}

export async function createTag(data: Omit<Tag, "id" | "captionCount" | "createdAt">): Promise<string> {
  const newRef = push(ref(db, "tags"));
  await set(newRef, {
    ...data,
    captionCount: 0,
    createdAt: Date.now(),
  });
  return newRef.key!;
}

export async function deleteTag(id: string): Promise<void> {
  // Remove tag from all captions
  const captionsSnap = await get(ref(db, "captions"));
  if (captionsSnap.exists()) {
    const updates: Record<string, any> = {};
    Object.entries(captionsSnap.val()).forEach(([key, value]: [string, any]) => {
      if (value.tags && Array.isArray(value.tags) && value.tags.includes(id)) {
        updates[`captions/${key}/tags`] = (value.tags as string[]).filter((t) => t !== id);
      }
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  }
  await remove(ref(db, `tags/${id}`));
}

// ─── Site Config ─────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const snap = await get(ref(db, "siteConfig"));
  if (!snap.exists()) {
    return {
      siteName: "CaptionLover",
      tagline: "বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল",
      description: "বাংলা ক্যাপশনের সমৃদ্ধ ভাণ্ডার",
      socialLinks: {},
      updatedAt: Date.now(),
    };
  }
  return snap.val() as SiteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  await update(ref(db, "siteConfig"), {
    ...data,
    updatedAt: Date.now(),
  });
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const [captionsSnap, categoriesSnap, tagsSnap] = await Promise.all([
    get(ref(db, "captions")),
    get(ref(db, "categories")),
    get(ref(db, "tags")),
  ]);

  const captions = captionsSnap.exists()
    ? Object.values(captionsSnap.val() as Record<string, Caption>)
    : [];

  return {
    totalCaptions: captions.length,
    totalCategories: categoriesSnap.exists() ? Object.keys(categoriesSnap.val()).length : 0,
    totalTags: tagsSnap.exists() ? Object.keys(tagsSnap.val()).length : 0,
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
  // Check if data already exists
  const existingCategories = await get(ref(db, "categories"));
  if (existingCategories.exists()) {
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

  // Write categories
  const categoryUpdates: Record<string, any> = {};
  const categoryIdMap: Record<string, string> = {};

  for (const cat of categories) {
    const newRef = push(ref(db, "categories"));
    const id = newRef.key!;
    categoryIdMap[cat.slug] = id;
    categoryUpdates[`categories/${id}`] = cat;
  }
  await update(ref(db), categoryUpdates);

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

  const tagUpdates: Record<string, any> = {};
  const tagIdMap: Record<string, string> = {};

  for (const tag of tags) {
    const newRef = push(ref(db, "tags"));
    const id = newRef.key!;
    tagIdMap[tag.slug] = id;
    tagUpdates[`tags/${id}`] = tag;
  }
  await update(ref(db), tagUpdates);

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

  const captionUpdates: Record<string, any> = {};
  const now = Date.now();

  sampleCaptions.forEach((cap, index) => {
    const newRef = push(ref(db, "captions"));
    captionUpdates[`captions/${newRef.key}`] = {
      ...cap,
      copyCount: 0,
      likeCount: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 500) + 50,
      status: "published",
      createdAt: now - index * 3600000,
      updatedAt: now - index * 3600000,
    };
  });

  await update(ref(db), captionUpdates);

  // Update category caption counts
  const categoryCountUpdates: Record<string, any> = {};
  const captionsPerCategory: Record<string, number> = {};

  sampleCaptions.forEach((cap) => {
    captionsPerCategory[cap.categoryId] = (captionsPerCategory[cap.categoryId] || 0) + 1;
  });

  Object.entries(captionsPerCategory).forEach(([catId, count]) => {
    categoryCountUpdates[`categories/${catId}/captionCount`] = count;
  });

  if (Object.keys(categoryCountUpdates).length > 0) {
    await update(ref(db), categoryCountUpdates);
  }

  // Update tag caption counts
  const tagCountUpdates: Record<string, any> = {};
  const captionsPerTag: Record<string, number> = {};

  sampleCaptions.forEach((cap) => {
    cap.tags.forEach((tagId) => {
      captionsPerTag[tagId] = (captionsPerTag[tagId] || 0) + 1;
    });
  });

  Object.entries(captionsPerTag).forEach(([tagId, count]) => {
    tagCountUpdates[`tags/${tagId}/captionCount`] = count;
  });

  if (Object.keys(tagCountUpdates).length > 0) {
    await update(ref(db), tagCountUpdates);
  }

  // Write site config
  await update(ref(db), {
    siteConfig: {
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
    },
  });

  return { success: true, message: "সফলভাবে ডাটাবেজ সিড করা হয়েছে! ১৭টি ক্যাটাগরি, ১৬টি ট্যাগ ও ২০টি নমুনা ক্যাপশন যোগ করা হয়েছে।" };
}

export async function clearDatabase(): Promise<{ success: boolean; message: string }> {
  await remove(ref(db, "captions"));
  await remove(ref(db, "categories"));
  await remove(ref(db, "tags"));
  await remove(ref(db, "siteConfig"));
  return { success: true, message: "সমস্ত ডাটা মুছে ফেলা হয়েছে।" };
}
