'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  captionCount: number;
  isPopular: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isPopular: boolean;
}

const emptyForm: FormData = {
  name: '',
  nameEn: '',
  slug: '',
  description: '',
  icon: '📌',
  color: '#8B5CF6',
  order: 0,
  isPopular: false,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminCategories() {
  useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {
      toast.error('ক্যাটাগরি লোড করতে সমস্যা');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    return (
      cat.name.includes(searchQuery) ||
      cat.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.includes(searchQuery)
    );
  });

  const handleNameEnChange = (value: string) => {
    setFormData((p) => ({
      ...p,
      nameEn: value,
      slug: value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    }));
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.nameEn.trim() || !formData.slug.trim()) {
      toast.error('ক্যাটাগরি নাম, ইংরেজি নাম এবং স্লাগ আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('ক্যাটাগরি সফলভাবে যোগ হয়েছে!');
        setCreateOpen(false);
        setFormData(emptyForm);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'ক্যাটাগরি যোগ করতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '📌',
      color: cat.color || '#8B5CF6',
      order: cat.order || 0,
      isPopular: cat.isPopular || false,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    if (!formData.name.trim() || !formData.nameEn.trim() || !formData.slug.trim()) {
      toast.error('ক্যাটাগরি নাম, ইংরেজি নাম এবং স্লাগ আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCategory.id, ...formData }),
      });

      if (res.ok) {
        toast.success('ক্যাটাগরি সফলভাবে আপডেট হয়েছে!');
        setEditOpen(false);
        setEditingCategory(null);
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
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success('ক্যাটাগরি মুছে ফেলা হয়েছে');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'মুছে ফেলতে সমস্যা');
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
            ক্যাটাগরি ম্যানেজমেন্ট
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            সকল ক্যাটাগরি দেখুন, এডিট ও মুছুন
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setFormData(emptyForm); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25">
              <i className="bi bi-plus-lg mr-2" style={{fontSize: '16px'}}></i>
              নতুন ক্যাটাগরি
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">নতুন ক্যাটাগরি যোগ করুন</DialogTitle>
              <DialogDescription>নিচের ফর্ম পূরণ করে নতুন ক্যাটাগরি তৈরি করুন</DialogDescription>
            </DialogHeader>
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              handleNameEnChange={handleNameEnChange}
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
          placeholder="ক্যাটাগরি সার্চ করুন..."
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

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Card className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-200 overflow-hidden group">
                  <div className="h-1.5" style={{ backgroundColor: cat.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon || '📌'}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{cat.nameEn}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {cat.isPopular && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px]">
                            জনপ্রিয়
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{cat.slug}</code>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: cat.color }} />
                        <span>{cat.color}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {formatNumber(cat.captionCount)} ক্যাপশন
                      </Badge>
                    </div>

                    {cat.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{cat.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
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
                              &quot;{cat.name}&quot; ({cat.nameEn}) ক্যাটাগরিটি মুছে ফেলা হবে।
                              {cat.captionCount > 0 && (
                                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                  ⚠️ এই ক্যাটাগরিতে {formatNumber(cat.captionCount)}টি ক্যাপশন আছে।
                                </span>
                              )}
                              এই কাজ বাতিল করা যাবে না।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-red-600 hover:bg-red-700">
                              হ্যাঁ, মুছুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-gray-500 hover:text-purple-600"
                        onClick={() => handleEdit(cat)}
                      >
                        <i className="bi bi-pencil-fill mr-1" style={{fontSize: '14px'}}></i>
                        এডিট
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditingCategory(null); setFormData(emptyForm); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">ক্যাটাগরি এডিট করুন</DialogTitle>
            <DialogDescription>ক্যাটাগরির তথ্য পরিবর্তন করুন</DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            handleNameEnChange={handleNameEnChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditingCategory(null); setFormData(emptyForm); }}>
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

// ─── Category Form ────────────────────────────────────────────────────────

function CategoryForm({
  formData,
  setFormData,
  handleNameEnChange,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleNameEnChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cat-name">ক্যাটাগরি নাম (বাংলা) *</Label>
          <Input
            id="cat-name"
            placeholder="যেমন: ভালোবাসা"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="cat-name-en">ক্যাটাগরি নাম (ইংরেজি) *</Label>
          <Input
            id="cat-name-en"
            placeholder="e.g. Love"
            value={formData.nameEn}
            onChange={(e) => handleNameEnChange(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cat-slug">স্লাগ *</Label>
        <Input
          id="cat-slug"
          placeholder="love"
          value={formData.slug}
          onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cat-icon">আইকন (ইমোজি)</Label>
          <Input
            id="cat-icon"
            placeholder="📌"
            value={formData.icon}
            onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
            className="mt-1.5 text-lg"
          />
        </div>
        <div>
          <Label htmlFor="cat-color">রঙ (Hex)</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 shrink-0" style={{ backgroundColor: formData.color }} />
            <Input
              id="cat-color"
              placeholder="#8B5CF6"
              value={formData.color}
              onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="cat-order">অর্ডার</Label>
          <Input
            id="cat-order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cat-desc">বিবরণ</Label>
        <Textarea
          id="cat-desc"
          placeholder="ক্যাটাগরি সম্পর্কে সংক্ষিপ্ত বিবরণ..."
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className="mt-1.5"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="cat-popular"
          checked={formData.isPopular}
          onCheckedChange={(checked) => setFormData((p) => ({ ...p, isPopular: checked }))}
        />
        <Label htmlFor="cat-popular" className="cursor-pointer">জনপ্রিয় ক্যাটাগরি</Label>
      </div>
    </div>
  );
}
