'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../layout';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  color: string;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  captionCount: number;
}

interface Caption {
  id: string;
  text: string;
  categoryId: string;
  tags?: { tag: TagItem }[];
  mood: string;
  type: string;
  emojis: string;
  isFeatured: boolean;
  copyCount: number;
  likeCount: number;
  views: number;
  status: string;
  createdAt: string;
  category?: Category;
}

interface FormData {
  text: string;
  categoryId: string;
  mood: string;
  type: string;
  emojis: string;
  tags: string[];
  isFeatured: boolean;
  status: string;
}

const MOODS = [
  { value: 'general', label: 'সাধারণ' },
  { value: 'happy', label: 'খুশি' },
  { value: 'sad', label: 'দুঃখি' },
  { value: 'romantic', label: 'রোমান্টিক' },
  { value: 'motivational', label: 'অনুপ্রেরণামূলক' },
  { value: 'funny', label: 'মজার' },
  { value: 'angry', label: 'রাগি' },
  { value: 'islamic', label: 'ইসলামিক' },
];

const TYPES = [
  { value: 'caption', label: 'ক্যাপশন' },
  { value: 'quote', label: 'কোটস' },
  { value: 'status', label: 'স্ট্যাটাস' },
  { value: 'shayari', label: 'শায়ারি' },
];

const STATUS_OPTIONS = [
  { value: 'published', label: 'পাবলিশড' },
  { value: 'draft', label: 'ড্রাফট' },
  { value: 'archived', label: 'আর্কাইভড' },
];

const emptyForm: FormData = {
  text: '',
  categoryId: '',
  mood: 'general',
  type: 'caption',
  emojis: '',
  tags: [],
  isFeatured: false,
  status: 'published',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminCaptions() {
  useAdminAuth();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsList, setTagsList] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCaption, setEditingCaption] = useState<Caption | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [captionsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/captions?limit=200'),
        fetch('/api/categories'),
        fetch('/api/tags'),
      ]);

      if (captionsRes.ok) {
        const data = await captionsRes.json();
        setCaptions(data.captions || []);
      }
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }
      if (tagsRes.ok) {
        setTagsList(await tagsRes.json());
      }
    } catch {
      toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCaptions = captions.filter((c) => {
    if (activeTab !== 'all' && c.status !== activeTab) return false;
    if (searchQuery && !c.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCategoryName = (caption: Caption) => {
    if (caption.category?.name) return caption.category.name;
    const cat = categories.find((c) => c.id === caption.categoryId);
    return cat?.name || 'অজানা';
  };

  const getCategoryColor = (caption: Caption) => {
    if (caption.category?.color) return caption.category.color;
    const cat = categories.find((c) => c.id === caption.categoryId);
    return cat?.color || '#8B5CF6';
  };

  const getCaptionTags = (caption: Caption) => {
    if ((caption as any).tagsList && (caption as any).tagsList.length > 0) {
      return (caption as any).tagsList.map((t: any) => t.name);
    }
    if (caption.tags && caption.tags.length > 0) {
      return caption.tags.map((t) => t.tag.name);
    }
    return [];
  };

  const getCaptionTagIds = (caption: Caption) => {
    if ((caption as any).tagsList && (caption as any).tagsList.length > 0) {
      return (caption as any).tagsList.map((t: any) => t.id);
    }
    return [];
  };

  const handleCreate = async () => {
    if (!formData.text.trim() || !formData.categoryId) {
      toast.error('ক্যাপশন টেক্সট এবং ক্যাটাগরি আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('ক্যাপশন সফলভাবে যোগ হয়েছে!');
        setCreateOpen(false);
        setFormData(emptyForm);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'ক্যাপশন যোগ করতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (caption: Caption) => {
    setEditingCaption(caption);
    setFormData({
      text: caption.text,
      categoryId: caption.categoryId,
      mood: caption.mood,
      type: caption.type,
      emojis: caption.emojis,
      tags: getCaptionTagIds(caption),
      isFeatured: caption.isFeatured,
      status: caption.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCaption) return;
    if (!formData.text.trim() || !formData.categoryId) {
      toast.error('ক্যাপশন টেক্সট এবং ক্যাটাগরি আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/captions/${editingCaption.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('ক্যাপশন সফলভাবে আপডেট হয়েছে!');
        setEditOpen(false);
        setEditingCaption(null);
        setFormData(emptyForm);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'আপডেট করতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/captions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('ক্যাপশন মুছে ফেলা হয়েছে');
        fetchData();
      } else {
        toast.error('মুছে ফেলতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    }
  };

  const handleToggleStatus = async (caption: Caption) => {
    const newStatus = caption.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/captions/${caption.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`ক্যাপশন ${newStatus === 'published' ? 'পাবলিশড' : 'ড্রাফট'} করা হয়েছে`);
        fetchData();
      }
    } catch {
      toast.error('স্ট্যাটাস পরিবর্তন করতে সমস্যা');
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-0">পাবলিশড</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-0">ড্রাফট</Badge>;
      case 'archived':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-0">আর্কাইভড</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('bn-BD');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            ক্যাপশন ম্যানেজমেন্ট
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            সকল ক্যাপশন দেখুন, এডিট ও মুছুন
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setFormData(emptyForm); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25">
              <i className="bi bi-plus-lg mr-2" style={{fontSize: '16px'}}></i>
              নতুন ক্যাপশন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">নতুন ক্যাপশন যোগ করুন</DialogTitle>
              <DialogDescription>নিচের ফর্ম পূরণ করে নতুন ক্যাপশন যোগ করুন</DialogDescription>
            </DialogHeader>
            <CaptionForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              tagsList={tagsList}
              toggleTag={toggleTag}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); setFormData(emptyForm); }}>
                বাতিল
              </Button>
              <Button
                onClick={handleCreate}
                disabled={submitting}
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
          placeholder="ক্যাপশন সার্চ করুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="bi bi-x-lg" style={{fontSize: '16px'}}></i>
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all">সব ({formatNumber(captions.length)})</TabsTrigger>
          <TabsTrigger value="published">পাবলিশড ({formatNumber(captions.filter((c) => c.status === 'published').length)})</TabsTrigger>
          <TabsTrigger value="draft">ড্রাফট ({formatNumber(captions.filter((c) => c.status === 'draft').length)})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredCaptions.length === 0 ? (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">কোনো ক্যাপশন পাওয়া যায়নি</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                <AnimatePresence>
                  {filteredCaptions.map((caption) => (
                    <motion.div
                      key={caption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          {/* Caption text */}
                          <div className="flex items-start gap-2">
                            <p className="text-sm line-clamp-2 text-gray-800 dark:text-gray-200 flex-1" title={caption.text}>
                              {caption.text.length > 100 ? caption.text.substring(0, 100) + '...' : caption.text}
                            </p>
                            {caption.isFeatured && (
                              <i className="bi bi-star-fill text-amber-500 shrink-0 mt-0.5" style={{fontSize: '14px'}}></i>
                            )}
                          </div>

                          {/* Badges row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className="border-0 text-white text-xs"
                              style={{ backgroundColor: getCategoryColor(caption) }}
                            >
                              {getCategoryName(caption)}
                            </Badge>
                            <button onClick={() => handleToggleStatus(caption)}>
                              {statusBadge(caption.status)}
                            </button>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <i className="bi bi-eye-fill" style={{fontSize: '12px'}}></i>{formatNumber(caption.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="bi bi-clipboard-check" style={{fontSize: '12px'}}></i>{formatNumber(caption.copyCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="bi bi-heart" style={{fontSize: '12px'}}></i>{formatNumber(caption.likeCount)}
                            </span>
                          </div>

                          {/* Tags (max 3) */}
                          {getCaptionTags(caption).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {getCaptionTags(caption).slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                  #{tag}
                                </Badge>
                              ))}
                              {getCaptionTags(caption).length > 3 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{getCaptionTags(caption).length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs flex-1"
                              onClick={() => handleEdit(caption)}
                            >
                              <i className="bi bi-pencil-fill mr-1 text-gray-500" style={{fontSize: '14px'}}></i>
                              এডিট
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <i className="bi bi-trash3-fill mr-1" style={{fontSize: '14px'}}></i>
                                  মুছুন
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    এই ক্যাপশনটি মুছে ফেলা হবে: &quot;{caption.text.substring(0, 50)}...&quot;
                                    <br />এই কাজ বাতিল করা যাবে না।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(caption.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
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
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="min-w-[200px]">ক্যাপশন</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead className="hidden sm:table-cell">মুড</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="hidden md:table-cell text-center">ভিউ</TableHead>
                      <TableHead className="hidden md:table-cell text-center">কপি</TableHead>
                      <TableHead className="hidden md:table-cell text-center">লাইক</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredCaptions.map((caption) => (
                        <motion.tr
                          key={caption.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <TableCell className="max-w-[300px]">
                            <div className="flex items-start gap-2">
                              <p className="text-sm line-clamp-2" title={caption.text}>
                                {caption.text.length > 80 ? caption.text.substring(0, 80) + '...' : caption.text}
                              </p>
                              {caption.isFeatured && (
                                <i className="bi bi-star-fill text-amber-500 shrink-0 mt-0.5" style={{fontSize: '14px'}}></i>
                              )}
                            </div>
                            {getCaptionTags(caption).length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {getCaptionTags(caption).slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                    #{tag}
                                  </Badge>
                                ))}
                                {getCaptionTags(caption).length > 2 && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    +{getCaptionTags(caption).length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="border-0 text-white text-xs"
                              style={{ backgroundColor: getCategoryColor(caption) }}
                            >
                              {getCategoryName(caption)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {MOODS.find((m) => m.value === caption.mood)?.label || caption.mood}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => handleToggleStatus(caption)}>
                              {statusBadge(caption.status)}
                            </button>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <span className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <i className="bi bi-eye-fill" style={{fontSize: '14px'}}></i>{formatNumber(caption.views)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <span className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <i className="bi bi-clipboard-check" style={{fontSize: '14px'}}></i>{formatNumber(caption.copyCount)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <span className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <i className="bi bi-heart" style={{fontSize: '14px'}}></i>{formatNumber(caption.likeCount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(caption)}
                              >
                                <i className="bi bi-pencil-fill text-gray-500 hover:text-purple-600" style={{fontSize: '14px'}}></i>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <i className="bi bi-trash3-fill text-gray-500 hover:text-red-600" style={{fontSize: '14px'}}></i>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      এই ক্যাপশনটি মুছে ফেলা হবে: &quot;{caption.text.substring(0, 50)}...&quot;
                                      <br />এই কাজ বাতিল করা যাবে না।
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(caption.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      হ্যাঁ, মুছুন
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingCaption(null); setFormData(emptyForm); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">ক্যাপশন এডিট করুন</DialogTitle>
            <DialogDescription>ক্যাপশনের তথ্য পরিবর্তন করুন</DialogDescription>
          </DialogHeader>
          <CaptionForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            tagsList={tagsList}
            toggleTag={toggleTag}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditingCaption(null); setFormData(emptyForm); }}>
              বাতিল
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              {submitting && <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>}
              আপডেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Caption Form Component ─────────────────────────────────────────────────

function CaptionForm({
  formData,
  setFormData,
  categories,
  tagsList,
  toggleTag,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  categories: Category[];
  tagsList: TagItem[];
  toggleTag: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="caption-text">ক্যাপশন টেক্সট *</Label>
        <Textarea
          id="caption-text"
          placeholder="বাংলা ক্যাপশন লিখুন..."
          value={formData.text}
          onChange={(e) => setFormData((p) => ({ ...p, text: e.target.value }))}
          rows={4}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="caption-category">ক্যাটাগরি *</Label>
          <Select value={formData.categoryId} onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}>
            <SelectTrigger className="w-full mt-1.5" id="caption-category">
              <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="caption-mood">মুড</Label>
          <Select value={formData.mood} onValueChange={(v) => setFormData((p) => ({ ...p, mood: v }))}>
            <SelectTrigger className="w-full mt-1.5" id="caption-mood">
              <SelectValue placeholder="মুড নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {MOODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="caption-type">টাইপ</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
            <SelectTrigger className="w-full mt-1.5" id="caption-type">
              <SelectValue placeholder="টাইপ নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="caption-status">স্ট্যাটাস</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
            <SelectTrigger className="w-full mt-1.5" id="caption-status">
              <SelectValue placeholder="স্ট্যাটাস নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="caption-emojis">ইমোজি</Label>
          <Input
            id="caption-emojis"
            placeholder="🌹❤️💡"
            value={formData.emojis}
            onChange={(e) => setFormData((p) => ({ ...p, emojis: e.target.value }))}
            className="mt-1.5 text-lg"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="caption-featured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData((p) => ({ ...p, isFeatured: checked }))}
          />
          <Label htmlFor="caption-featured" className="cursor-pointer">
            ফিচার্ড ক্যাপশন
          </Label>
        </div>
      </div>

      {tagsList.length > 0 && (
        <div>
          <Label>ট্যাগ</Label>
          <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {tagsList.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Checkbox
                  checked={formData.tags.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  #{tag.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
