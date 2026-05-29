"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tag {
  id: string;
  name: string;
  slug: string;
  captionCount: number;
}

// ─── Bangla number helper ────────────────────────────────────────────────────

function toBanglaNumber(n: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

// ─── Page component ──────────────────────────────────────────────────────────

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("ট্যাগ লোড করতে সমস্যা হয়েছে");
        const data = await res.json();
        setTags(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ট্যাগ লোড করতে সমস্যা হয়েছে"
        );
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  const totalCaptions = tags.reduce((sum, tag) => sum + (tag.captionCount || 0), 0);

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
              <BreadcrumbPage>ট্যাগ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <section className="container mx-auto px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <i className="bi bi-tags text-violet-600 dark:text-violet-400" style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
                সকল ট্যাগ
              </h1>
              {!loading && (
                <p className="text-gray-500 text-sm mt-0.5">
                  মোট{" "}
                  <span className="font-semibold text-violet-600">
                    {toBanglaNumber(tags.length)}
                  </span>{" "}
                  টি ট্যাগে{" "}
                  <span className="font-semibold text-violet-600">
                    {toBanglaNumber(totalCaptions)}
                  </span>{" "}
                  টি ক্যাপশন
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Tags Grid / Flex */}
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
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors text-sm font-medium"
            >
              আবার চেষ্টা করুন
            </button>
          </motion.div>
        ) : loading ? (
          <div className="flex flex-wrap gap-3 justify-center py-8">
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <i className="bi bi-tags text-violet-300 dark:text-violet-500" style={{ fontSize: '32px' }}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              কোনো ট্যাগ পাওয়া যায়নি
            </h3>
            <p className="text-gray-400">এখনো কোনো ট্যাগ যোগ করা হয়নি।</p>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-wrap gap-3 justify-center py-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tags.map((tag, index) => (
              <motion.div key={tag.id} variants={itemVariants}>
                <Link href={`/tags/${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className="px-5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 dark:hover:bg-violet-900/20 dark:hover:border-violet-600 dark:hover:text-violet-400"
                    style={
                      tag.captionCount > 10
                        ? {
                            borderColor: "rgba(139, 92, 246, 0.3)",
                            color: "#7c3aed",
                          }
                        : undefined
                    }
                  >
                    #{tag.name}
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      ({toBanglaNumber(tag.captionCount || 0)})
                    </span>
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
