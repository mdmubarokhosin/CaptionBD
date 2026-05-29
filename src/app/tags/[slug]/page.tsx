"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export default function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [tagName, setTagName] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch captions by tag ────────────────────────────────────────────────

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
        params.set("tag", slug);
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

        // Extract tag name from first caption's tags
        if (!append && data.captions && data.captions.length > 0) {
          const firstCaption = data.captions[0];
          if (firstCaption.tags) {
            const matchedTag = firstCaption.tags.find(
              (t: { tag: { slug: string } }) => t.tag.slug === slug
            );
            if (matchedTag) {
              setTagName(matchedTag.tag.name);
            }
          }
        }
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
    fetchCaptions(1, false);
  }, [fetchCaptions]);

  // ── Derive display name ─────────────────────────────────────────────────

  // slug like "love-status" -> "Love Status" as fallback
  const fallbackName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const displayName = tagName || fallbackName;

  // ── Load more handler ──────────────────────────────────────────────────

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
                <Link href="/tags">ট্যাগ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>#{displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Tag Header */}
      <section className="container mx-auto px-4 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <i className="bi bi-hash text-violet-600 dark:text-violet-400" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
                #{displayName}
              </h1>
              {!loading && (
                <p className="text-gray-500 text-sm mt-0.5">
                  মোট{" "}
                  <span className="font-semibold text-violet-600">
                    {toBanglaNumber(total)}
                  </span>{" "}
                  টি ক্যাপশন
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Captions Grid */}
      <section className="container mx-auto px-4 pb-12">
        {error ? (
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
              <Link href="/tags">
                <Button
                  variant="outline"
                  className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-full"
                >
                  সকল ট্যাগ দেখুন
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
        ) : loading ? (
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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <i className="bi bi-hash text-violet-300 dark:text-violet-500" style={{ fontSize: '32px' }}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              এই ট্যাগে কোনো ক্যাপশন নেই
            </h3>
            <p className="text-gray-400 mb-6">
              &quot;#{displayName}&quot; ট্যাগে খুব শীঘ্রই ক্যাপশন যোগ করা হবে।
            </p>
            <Link href="/tags">
              <Button
                variant="outline"
                className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-full"
              >
                <i className="bi bi-arrow-left mr-1" style={{ fontSize: '16px' }}></i>
                অন্য ট্যাগ দেখুন
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
                  className="rounded-full px-8 border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 dark:border-violet-700 dark:hover:bg-violet-900/20"
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
    </div>
  );
}
