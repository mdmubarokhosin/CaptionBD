"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CaptionCard from "@/components/CaptionCard";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Mood filter options ────────────────────────────────────────────────────

const moodFilters = [
  { label: "সব", value: "" },
  { label: "সুখী", value: "happy" },
  { label: "কষ্ট", value: "sad" },
  { label: "রোমান্টিক", value: "romantic" },
  { label: "মোটিভেশন", value: "motivational" },
  { label: "ফানি", value: "funny" },
  { label: "ইসলামিক", value: "islamic" },
] as const;

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function CaptionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-6 w-24" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-10 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CaptionCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Main page component (wrapped in Suspense for useSearchParams) ───────────

function CaptionsContent() {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialMood = searchParams.get("mood") || "";
  const initialCategory = searchParams.get("category") || "";

  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeMood, setActiveMood] = useState(initialMood);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch captions ──────────────────────────────────────────────────────

  const fetchCaptions = useCallback(
    async (pageNum: number, append: boolean = false) => {
      const isLoadMore = append;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        params.set("limit", "12");

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }
        if (activeMood) {
          params.set("mood", activeMood);
        }
        if (initialCategory) {
          params.set("category", initialCategory);
        }

        const res = await fetch(`/api/captions?${params.toString()}`);
        if (!res.ok) throw new Error("ক্যাপশন লোড করতে সমস্যা হয়েছে");

        const data = await res.json();

        if (append) {
          setCaptions((prev) => [...prev, ...(data.captions || [])]);
        } else {
          setCaptions(data.captions || []);
        }

        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ক্যাপশন লোড করতে সমস্যা হয়েছে"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, activeMood, initialCategory]
  );

  // ── Initial load and on filter change ───────────────────────────────────

  useEffect(() => {
    fetchCaptions(1, false);
  }, [fetchCaptions]);

  // ── Search handler ─────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCaptions(1, false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setPage(1);
  };

  // ── Mood filter handler ─────────────────────────────────────────────────

  const handleMoodFilter = (moodValue: string) => {
    setActiveMood(moodValue);
    setPage(1);
  };

  // ── Load more handler ──────────────────────────────────────────────────

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchCaptions(page + 1, true);
    }
  };

  // ── Format Bangla numbers ───────────────────────────────────────────────

  const toBanglaNumber = (n: number): string => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(n).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">হোম</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>ক্যাপশন</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <section className="container mx-auto px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <i className="bi bi-book text-purple-600" style={{fontSize: '28px'}}></i>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
              বাংলা ক্যাপশন সংগ্রহ
            </h1>
          </div>
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm"
            >
              মোট <span className="font-semibold text-purple-600">{toBanglaNumber(total)}</span>টি
              ক্যাপশন পাওয়া গেছে
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 pb-4">
        <motion.form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Input
            placeholder="ক্যাপশন সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-11 pr-24 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 shadow-sm focus-visible:ring-2 focus-visible:ring-purple-400"
          />
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '16px'}}></i>

          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-20 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <i className="bi bi-x-lg" style={{fontSize: '16px'}}></i>
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm"
          >
            {loading && !loadingMore ? (
              <i className="bi bi-arrow-repeat bi-spin" style={{fontSize: '16px'}}></i>
            ) : (
              "সার্চ"
            )}
          </Button>
        </motion.form>
      </section>

      {/* Mood Filter Bar */}
      <section className="container mx-auto px-4 pb-6">
        <motion.div
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {moodFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeMood === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleMoodFilter(filter.value)}
              className={
                activeMood === filter.value
                  ? "bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5"
                  : "rounded-full px-5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }
            >
              {filter.label}
            </Button>
          ))}
        </motion.div>
      </section>

      {/* Captions Grid */}
      <section className="container mx-auto px-4 pb-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <i className="bi bi-question-circle-fill text-gray-300 mx-auto mb-4" style={{fontSize: '64px'}}></i>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              সমস্যা হয়েছে!
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => fetchCaptions(1, false)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              আবার চেষ্টা করুন
            </Button>
          </motion.div>
        ) : loading ? (
          <GridSkeleton count={12} />
        ) : captions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <i className="bi bi-search text-purple-300 dark:text-purple-500" style={{fontSize: '32px'}}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              কোনো ক্যাপশন পাওয়া যায়নি
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery
                ? `"${searchQuery}" দিয়ে কোনো ক্যাপশন খুঁজে পাওয়া যায়নি। ভিন্ন শব্দ দিয়ে আবার চেষ্টা করুন।`
                : "এই ফিল্টারে কোনো ক্যাপশন পাওয়া যায়নি। অন্য মুড বা ক্যাটাগরি দেখুন।"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/captions">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                >
                  সব ক্যাপশন দেখুন
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full"
                >
                  <i className="bi bi-arrow-right mr-1" style={{fontSize: '16px'}}></i>
                  ক্যাটাগরি
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {captions.map((caption) => (
                <CaptionCard key={caption.id} caption={caption} />
              ))}
            </motion.div>

            {/* Load More Button */}
            {page < totalPages && (
              <motion.div
                className="flex justify-center mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/20"
                >
                  {loadingMore ? (
                    <>
                      <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>
                      লোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      আরো ক্যাপশন দেখুন
                      <i className="bi bi-chevron-right ml-1" style={{fontSize: '16px'}}></i>
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                পেজ {toBanglaNumber(page)} / {toBanglaNumber(totalPages)}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ─── Page with Suspense boundary for useSearchParams ────────────────────────

export default function CaptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="container mx-auto px-4 pt-6">
            <Skeleton className="h-5 w-40 mb-6" />
          </div>
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-80 mx-auto rounded-xl mb-6" />
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-16 rounded-full" />
              ))}
            </div>
            <GridSkeleton count={12} />
          </div>
        </div>
      }
    >
      <CaptionsContent />
    </Suspense>
  );
}
