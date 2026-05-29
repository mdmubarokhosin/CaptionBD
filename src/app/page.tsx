"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CaptionCard from "@/components/CaptionCard";

interface Caption {
  id: string;
  text: string;
  category: { name: string; color: string; icon: string; slug: string };
  tags?: { tag: { name: string; slug: string } }[];
  mood: string;
  type: string;
  emojis: string;
  isFeatured: boolean;
  copyCount: number;
  likeCount: number;
  views: number;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
  captionCount: number;
  isPopular: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  captionCount: number;
}

// Fetch data on the server-side equivalent via client fetch
async function fetchCaptions(params: string = "") {
  const res = await fetch(`/api/captions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function fetchTags() {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

// Skeleton loading for caption cards
function CaptionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [featuredCaptions, setFeaturedCaptions] = useState<Caption[]>([]);
  const [allCaptions, setAllCaptions] = useState<Caption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const popularCategories = [
    "islamic",
    "life",
    "love",
    "sad",
    "motivation",
    "nature",
    "funny",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredData, allData, catData, tagData] = await Promise.all([
          fetchCaptions("featured=true&limit=8"),
          fetchCaptions("limit=12"),
          fetchCategories(),
          fetchTags(),
        ]);

        setFeaturedCaptions(featuredData.captions || []);
        setAllCaptions(allData.captions || []);
        setCategories(catData || []);
        setTags(tagData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Caption of the Day – pick a random featured caption
  const captionOfDay = useMemo(() => {
    if (featuredCaptions.length === 0) return null;
    const idx = Math.floor(Math.random() * featuredCaptions.length);
    return featuredCaptions[idx];
  }, [featuredCaptions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/captions?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300 rounded-full opacity-10 blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-6 border-purple-200 text-purple-100 bg-purple-500/20 text-sm px-4 py-1.5"
            >
              <i className="bi bi-stars mr-1.5" style={{ fontSize: "14px" }}></i>
              ১০০০+ বাংলা ক্যাপশন ও স্ট্যাটাস
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              বাংলা ক্যাপশন জগতের
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                ১ নম্বর পোর্টাল
              </span>
            </h1>

            <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              ❝ তোমার অনুভূতি, আমাদের ক্যাপশন ❞
              <br />
              <span className="text-purple-200 text-base">
                ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য মোটিভেশন,
                রোমান্টিক, কষ্টের, ইসলামিক ক্যাপশন
              </span>
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-xl mx-auto relative"
            >
              <Input
                placeholder="ক্যাপশন সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-32 rounded-full bg-white/95 border-0 text-gray-800 placeholder:text-gray-400 text-lg shadow-xl focus-visible:ring-2 focus-visible:ring-purple-300"
              />
              <i
                className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                style={{ fontSize: "20px" }}
              ></i>
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium"
              >
                সার্চ
              </Button>
            </form>

            {/* Random Caption + Quick stats */}
            <motion.div
              className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-8 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Random Caption button */}
              <Link href="/captions?random=true">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-100 bg-purple-500/20 hover:bg-purple-500/40 hover:text-white rounded-full px-5 py-2.5 gap-2 transition-all"
                >
                  <i className="bi bi-shuffle" style={{ fontSize: "16px" }}></i>
                  র‍্যান্ডম ক্যাপশন
                </Button>
              </Link>

              {/* Divider (visible on sm+) */}
              <span className="hidden sm:block w-px h-6 bg-purple-300/50"></span>

              {/* Quick stats */}
              {[
                { icon: "bi-book", label: "ক্যাপশন", value: "১০০০+" },
                { icon: "bi-heart", label: "ক্যাটাগরি", value: "১৩+" },
                { icon: "bi-graph-up-arrow", label: "ট্যাগ", value: "১৫+" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 text-purple-100"
                >
                  <i className={`bi ${stat.icon}`} style={{ fontSize: "16px" }}></i>
                  <span className="text-sm">
                    {stat.value} {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Caption of the Day */}
      <section className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <i className="bi bi-clock-fill text-purple-600" style={{ fontSize: "24px" }}></i>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              আজকের ক্যাপশন
            </h2>
          </div>
          {loading ? (
            <CaptionCardSkeleton />
          ) : captionOfDay ? (
            <CaptionCard key={captionOfDay.id} caption={captionOfDay} />
          ) : (
            <Card className="border border-gray-100">
              <CardContent className="p-8 text-center text-gray-400">
                <p>আজকের ক্যাপশন লোড হচ্ছে...</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </section>

      {/* Popular Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <i className="bi bi-graph-up-arrow text-purple-600" style={{ fontSize: "24px" }}></i>
              এক নজরে জনপ্রিয় বিষয়
            </h2>
            <p className="text-gray-500 mt-1">
              ক্যাটাগরি অনুযায়ী সেরা ক্যাপশন খুঁজুন
            </p>
          </div>
          <Link href="/categories">
            <Button
              variant="ghost"
              className="text-purple-600 hover:text-purple-700 hidden sm:flex"
            >
              সব দেখুন <i className="bi bi-arrow-right ml-1" style={{ fontSize: "16px" }}></i>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/categories/${cat.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden">
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cat.captionCount} ক্যাপশন
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Captions with Tabs */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <i className="bi bi-stars text-amber-500" style={{ fontSize: "24px" }}></i>
              ফিচার্ড ক্যাপশন
            </h2>
            <p className="text-gray-500 mt-1">
              সেরা বাছাইকৃত ক্যাপশন এখানে
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg px-4 py-2">
              সব
            </TabsTrigger>
            {popularCategories.slice(0, 5).map((catSlug) => {
              const cat = categories.find((c) => c.slug === catSlug);
              return (
                <TabsTrigger
                  key={catSlug}
                  value={catSlug}
                  className="rounded-lg px-4 py-2"
                >
                  {cat?.icon} {cat?.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CaptionCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {featuredCaptions.map((caption) => (
                    <CaptionCard key={caption.id} caption={caption} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {popularCategories.slice(0, 5).map((catSlug) => (
            <TabsContent key={catSlug} value={catSlug} className="mt-6">
              <CategoryCaptionsTab categorySlug={catSlug} />
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Latest Captions */}
      <section className="bg-gray-50/80 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <i className="bi bi-quote text-purple-600" style={{ fontSize: "24px" }}></i>
                সাম্প্রতিক ক্যাপশন
              </h2>
              <p className="text-gray-500 mt-1">
                নতুন যোগ হওয়া ক্যাপশনসমূহ
              </p>
            </div>
            <Link href="/captions">
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hidden sm:flex"
              >
                আরো দেখুন <i className="bi bi-arrow-right ml-1" style={{ fontSize: "16px" }}></i>
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CaptionCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCaptions.map((caption) => (
                <CaptionCard key={caption.id} caption={caption} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/captions">
              <Button
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                সব ক্যাপশন দেখুন <i className="bi bi-arrow-right ml-1" style={{ fontSize: "16px" }}></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tag Cloud */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            জনপ্রিয় ট্যাগ
          </h2>
          <p className="text-gray-500 mt-1">আপনার পছন্দের ট্যাগ দিয়ে ক্যাপশন খুঁজুন</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag, i) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/tags/${tag.slug}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 border-gray-200 text-gray-600"
                >
                  #{tag.name}
                  <span className="ml-2 text-xs text-gray-400">
                    ({tag.captionCount})
                  </span>
                </Badge>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  আপনার মনের কথা প্রকাশ করুন
                </h3>
                <p className="text-purple-100 text-lg max-w-xl">
                  সোশ্যাল মিডিয়ায় নিজের ব্যক্তিত্ব ফুটিয়ে তুলতে একটি
                  যাতসই ক্যাপশনের বিকল্প নেই।
                </p>
              </div>
              <Link href="/captions">
                <Button
                  size="lg"
                  className="rounded-full bg-white text-purple-700 hover:bg-purple-50 font-semibold text-lg px-8 shadow-lg"
                >
                  এখনই দেখুন
                  <i className="bi bi-chevron-right ml-1" style={{ fontSize: "20px" }}></i>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

// Separate component for category tab content
function CategoryCaptionsTab({ categorySlug }: { categorySlug: string }) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCaptions(`category=${categorySlug}&limit=6`);
        setCaptions(data.captions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CaptionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (captions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">এই ক্যাটাগরিতে এখনো ক্যাপশন যোগ হয়নি।</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {captions.map((caption) => (
        <CaptionCard key={caption.id} caption={caption} />
      ))}
    </div>
  );
}
