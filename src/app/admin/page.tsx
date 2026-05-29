'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DashboardStats {
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

const statCards = [
  { key: 'totalCaptions' as const, label: 'মোট ক্যাপশন', icon: 'file-text', color: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  { key: 'totalCategories' as const, label: 'ক্যাটাগরি', icon: 'folder2-open', color: 'from-pink-500 to-rose-600', iconBg: 'bg-pink-100 dark:bg-pink-900/30', iconColor: 'text-pink-600 dark:text-pink-400' },
  { key: 'totalTags' as const, label: 'ট্যাগ', icon: 'tag-fill', color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'totalViews' as const, label: 'মোট ভিউ', icon: 'eye-fill', color: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'totalLikes' as const, label: 'মোট লাইক', icon: 'heart-fill', color: 'from-red-500 to-rose-600', iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' },
  { key: 'totalCopies' as const, label: 'মোট কপি', icon: 'clipboard-check', color: 'from-blue-500 to-cyan-600', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'publishedCaptions' as const, label: 'পাবলিশড', icon: 'check-circle-fill', color: 'from-teal-500 to-emerald-600', iconBg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
  { key: 'draftCaptions' as const, label: 'ড্রাফট', icon: 'file-earmark-pen', color: 'from-gray-500 to-slate-600', iconBg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600 dark:text-gray-400' },
  { key: 'featuredCaptions' as const, label: 'ফিচার্ড', icon: 'star-fill', color: 'from-yellow-500 to-amber-600', iconBg: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' },
];

function StatCardSkeleton() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          toast.error('স্ট্যাটস লোড করতে সমস্যা হয়েছে');
        }
      } catch {
        toast.error('নেটওয়ার্ক ত্রুটি');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('bn-BD');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          ড্যাশবোর্ড
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          আপনার সাইটের সামগ্রিক পরিসংখ্যান দেখুন
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, index) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow duration-200 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {card.label}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {stats ? formatNumber(stats[card.key]) : '০'}
                        </p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <i className={`bi bi-${card.icon} ${card.iconColor}`} style={{fontSize: '24px'}}></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Summary Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Caption Status Overview */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                ক্যাপশন স্ট্যাটাস ওভারভিউ
              </h3>
              <div className="space-y-4">
                {/* Published bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">পাবলিশড</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(stats.publishedCaptions)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: stats.totalCaptions > 0
                          ? `${(stats.publishedCaptions / stats.totalCaptions) * 100}%`
                          : '0%',
                      }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Draft bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">ড্রাফট</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(stats.draftCaptions)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: stats.totalCaptions > 0
                          ? `${(stats.draftCaptions / stats.totalCaptions) * 100}%`
                          : '0%',
                      }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-gray-400 to-slate-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Featured bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">ফিচার্ড</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(stats.featuredCaptions)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: stats.totalCaptions > 0
                          ? `${(stats.featuredCaptions / stats.totalCaptions) * 100}%`
                          : '0%',
                      }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Overview */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                এনগেজমেন্ট ওভারভিউ
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <i className="bi bi-eye-fill text-blue-600 dark:text-blue-400" style={{fontSize: '20px'}}></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">মোট ভিউ</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.totalViews)}
                      </p>
                    </div>
                  </div>
                  <i className="bi bi-graph-up-arrow text-emerald-500" style={{fontSize: '20px'}}></i>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <i className="bi bi-heart-fill text-red-600 dark:text-red-400" style={{fontSize: '20px'}}></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">মোট লাইক</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.totalLikes)}
                      </p>
                    </div>
                  </div>
                  <i className="bi bi-graph-up-arrow text-emerald-500" style={{fontSize: '20px'}}></i>
                </div>

                <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <i className="bi bi-clipboard-check text-violet-600 dark:text-violet-400" style={{fontSize: '20px'}}></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">মোট কপি</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(stats.totalCopies)}
                      </p>
                    </div>
                  </div>
                  {stats.totalViews > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(stats.totalCopies / stats.totalViews * 100).toFixed(1)}% রেট
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
