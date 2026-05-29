'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../layout';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TagItem {
  id: string;
  name: string;
  slug: string;
  captionCount: number;
  createdAt: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminTags() {
  useAdminAuth();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        setTags(await res.json());
      }
    } catch {
      toast.error('ট্যাগ লোড করতে সমস্যা');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTags = tags.filter((tag) => {
    if (!searchQuery) return true;
    return (
      tag.name.includes(searchQuery) ||
      tag.slug.includes(searchQuery.toLowerCase())
    );
  });

  const handleCreate = async () => {
    if (!tagName.trim()) {
      toast.error('ট্যাগের নাম দিন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim() }),
      });

      if (res.ok) {
        toast.success('ট্যাগ সফলভাবে যোগ হয়েছে!');
        setCreateOpen(false);
        setTagName('');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'ট্যাগ যোগ করতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('ট্যাগ মুছে ফেলা হয়েছে');
        fetchData();
      } else {
        toast.error('মুছে ফেলতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('bn-BD');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            ট্যাগ ম্যানেজমেন্ট
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            সকল ট্যাগ দেখুন, যোগ করুন ও মুছুন
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setTagName(''); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25">
              <i className="bi bi-plus-lg mr-2" style={{fontSize: '16px'}}></i>
              নতুন ট্যাগ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">নতুন ট্যাগ যোগ করুন</DialogTitle>
              <DialogDescription>ট্যাগের নাম দিন</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label htmlFor="tag-name">ট্যাগের নাম</Label>
              <Input
                id="tag-name"
                placeholder="যেমন: ভালোবাসা"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="mt-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                স্লাগ অটো-জেনারেট হবে
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); setTagName(''); }}>
                বাতিল
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting || !tagName.trim()}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              >
                {submitting && <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>}
                যোগ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '16px'}}></i>
        <Input
          placeholder="ট্যাগ সার্চ করুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i className="bi bi-x-lg" style={{fontSize: '16px'}}></i>
          </button>
        )}
      </div>

      {/* Tags Count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          <i className="bi bi-tag-fill mr-1" style={{fontSize: '12px'}}></i>
          মোট {formatNumber(tags.length)}টি ট্যাগ
        </Badge>
        {searchQuery && (
          <Badge variant="outline" className="px-3 py-1">
            {formatNumber(filteredTags.length)}টি ফলাফল
          </Badge>
        )}
      </div>

      {/* Tags Table */}
      {loading ? (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : filteredTags.length === 0 ? (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="py-12 text-center">
            <i className="bi bi-tag-fill text-gray-300 dark:text-gray-600 mx-auto mb-3" style={{fontSize: '48px'}}></i>
            <p className="text-gray-500 dark:text-gray-400">কোনো ট্যাগ পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            <AnimatePresence>
              {filteredTags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="text-sm font-medium">
                            #{tag.name}
                          </Badge>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                              {tag.slug}
                            </code>
                            <Badge variant="outline" className="text-[10px]">
                              {formatNumber(tag.captionCount)} ক্যাপশন
                            </Badge>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 shrink-0">
                              <i className="bi bi-trash3-fill" style={{fontSize: '16px'}}></i>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;#{tag.name}&quot; ট্যাগটি মুছে ফেলা হবে।
                                {tag.captionCount > 0 && (
                                  <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                                    ⚠️ এই ট্যাগে {formatNumber(tag.captionCount)}টি ক্যাপশন আছে।
                                  </span>
                                )}
                                এই কাজ বাতিল করা যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(tag.id, tag.name)} className="bg-red-600 hover:bg-red-700">
                                হ্যাঁ, মুছুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Table View */}
          <Card className="hidden sm:block border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead>ট্যাগ নাম</TableHead>
                    <TableHead>স্লাগ</TableHead>
                    <TableHead className="text-center">ক্যাপশন সংখ্যা</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredTags.map((tag, index) => (
                      <motion.tr
                        key={tag.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <TableCell>
                          <Badge variant="secondary" className="text-sm font-medium">
                            #{tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {tag.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(tag.captionCount)} ক্যাপশন
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500 hover:text-red-600">
                                <i className="bi bi-trash3-fill mr-1" style={{fontSize: '14px'}}></i>
                                মুছুন
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;#{tag.name}&quot; ট্যাগটি মুছে ফেলা হবে।
                                  {tag.captionCount > 0 && (
                                    <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                                      ⚠️ এই ট্যাগে {formatNumber(tag.captionCount)}টি ক্যাপশন আছে।
                                    </span>
                                  )}
                                  এই কাজ বাতিল করা যাবে না।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(tag.id, tag.name)} className="bg-red-600 hover:bg-red-700">
                                  হ্যাঁ, মুছুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
