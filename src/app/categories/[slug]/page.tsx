"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  captionCount: number;
}

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

// ─── Bangla number helper ────────────────────────────────────────────────────

function toBanglaNumber(n: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [category, setCategory] = useState<Category | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch category + captions ────────────────────────────────────────────

  const fetchCaptions = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("category", slug);
        params.set("page", String(pageNum));
        params.set("limit", "12");

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
    [slug]
  );

  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("ক্যাটাগরি পাওয়া যায়নি");
          } else {
            throw new Error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে");
          }
          return;
        }
        const data = await res.json();
        setCategory(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ক্যাটাগরি লোড করতে সমস্যা হয়েছে"
        );
      }
    }

    loadCategory();
    fetchCaptions(1, false);
  }, [slug, fetchCaptions]);

  // ── Load more handler ────────────────────────────────────────────────────

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchCaptions(page + 1, true);
    }
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
              <BreadcrumbLink asChild>
                <Link href="/categories">ক্যাটাগরি</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category?.name || slug}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Header */}
      <section className="container mx-auto px-4 pt-6 pb-8">
        {error && !category ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <i className="bi bi-exclamation-circle-fill text-gray-300 mx-auto mb-4 block" style={{ fontSize: '64px' }}></i>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              সমস্যা হয়েছে!
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/categories">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                >
                  সকল ক্যাটাগরি দেখুন
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full"
                >
                  <i className="bi bi-house-fill mr-1" style={{ fontSize: '16px' }}></i>
                  হোমে যান
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              className="overflow-hidden border-0 shadow-lg"
              style={{
                borderTop: `4px solid ${category?.color || "#8B5CF6"}`,
              }}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shrink-0"
                    style={{
                      backgroundColor: `${category?.color || "#8B5CF6"}18`,
                    }}
                  >
                    {category?.icon || "📁"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                        {category?.name || "লোড হচ্ছে..."}
                      </h1>
                      {category?.nameEn && (
                        <span
                          className="hidden sm:inline-block text-sm font-medium px-3 py-0.5 rounded-full"
                          style={{
                            color: category.color,
                            backgroundColor: `${category.color}15`,
                          }}
                        >
                          {category.nameEn}
                        </span>
                      )}
                    </div>

                    {category?.description && (
                      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3 text-sm md:text-base leading-relaxed">
                        {category.description}
                      </p>
                    )}

                    {!loading && (
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${category?.color || "#8B5CF6"}15`,
                            color: category?.color || "#8B5CF6",
                          }}
                        >
                          {toBanglaNumber(total)} টি ক্যাপশন
                        </Badge>
                        {totalPages > 1 && (
                          <span>
                            {toBanglaNumber(totalPages)} পেজ
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>

      {/* Captions Grid */}
      {!error && (
        <section className="container mx-auto px-4 pb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <CaptionCardSkeleton key={i} />
              ))}
            </div>
          ) : captions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: `${category?.color || "#8B5CF6"}15`,
                }}
              >
                {category?.icon || "📁"}
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                এই ক্যাটাগরিতে এখনো ক্যাপশন নেই
              </h3>
              <p className="text-gray-400 mb-6">
                &quot;{category?.name}&quot; ক্যাটাগরিতে খুব শীঘ্রই ক্যাপশন যোগ করা হবে।
              </p>
              <Link href="/categories">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                >
                  <i className="bi bi-arrow-left mr-1" style={{ fontSize: '16px' }}></i>
                  অন্য ক্যাটাগরি দেখুন
                </Button>
              </Link>
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
                        <i className="bi bi-arrow-repeat bi-spin mr-2" style={{ fontSize: '16px' }}></i>
                        লোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        আরো ক্যাপশন দেখুন
                        <i className="bi bi-chevron-right ml-1" style={{ fontSize: '16px' }}></i>
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
      )}
    </div>
  );
}
