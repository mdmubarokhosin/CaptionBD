"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  captionCount: number;
  isPopular?: boolean;
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
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

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── Page component ──────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ক্যাটাগরি লোড করতে সমস্যা হয়েছে"
        );
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const totalCaptions = categories.reduce((sum, cat) => sum + (cat.captionCount || 0), 0);

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
              <BreadcrumbPage>ক্যাটাগরি</BreadcrumbPage>
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
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <i className="bi bi-grid-3x3-gap-fill text-purple-600 dark:text-purple-400" style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50">
                সকল ক্যাটাগরি
              </h1>
              {!loading && (
                <p className="text-gray-500 text-sm mt-0.5">
                  মোট{" "}
                  <span className="font-semibold text-purple-600">
                    {toBanglaNumber(categories.length)}
                  </span>{" "}
                  টি ক্যাটাগরিতে{" "}
                  <span className="font-semibold text-purple-600">
                    {toBanglaNumber(totalCaptions)}
                  </span>{" "}
                  টি ক্যাপশন
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories Grid */}
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
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
            >
              আবার চেষ্টা করুন
            </Button>
          </motion.div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <i className="bi bi-grid-3x3-gap-fill text-gray-300 dark:text-gray-600" style={{ fontSize: '32px' }}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              কোনো ক্যাটাগরি পাওয়া যায়নি
            </h3>
            <p className="text-gray-400">এখনো কোনো ক্যাটাগরি যোগ করা হয়নি।</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/categories/${category.slug}`} className="block group">
                  <Card className="relative overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1">
                    {/* Popular badge */}
                    {category.isPopular && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-0 text-xs font-semibold shadow-sm">
                          <i className="bi bi-fire mr-1" style={{ fontSize: '12px' }}></i>
                          জনপ্রিয়
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: `${category.color}18`,
                          }}
                        >
                          {category.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg">
                              {category.name}
                            </h3>
                          </div>

                          {category.nameEn && (
                            <p
                              className="text-sm font-medium mb-1"
                              style={{ color: category.color }}
                            >
                              {category.nameEn}
                            </p>
                          )}

                          {category.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                            <span
                              className="font-semibold"
                              style={{ color: category.color }}
                            >
                              {toBanglaNumber(category.captionCount || 0)}
                            </span>
                            <span>টি ক্যাপশন</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom accent bar */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${category.color}, #8B5CF6, ${category.color})`,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
