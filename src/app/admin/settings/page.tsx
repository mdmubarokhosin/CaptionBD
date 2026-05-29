'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../layout';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    pinterest?: string;
    youtube?: string;
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminSettings() {
  useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    tagline: '',
    description: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      pinterest: '',
      youtube: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            siteName: data.siteName || '',
            tagline: data.tagline || '',
            description: data.description || '',
            socialLinks: data.socialLinks || {},
          });
        }
      } catch {
        toast.error('সেটিংস লোড করতে সমস্যা');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateSocialLink = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!settings.siteName.trim()) {
      toast.error('সাইটের নাম আবশ্যক');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('সেটিংস সফলভাবে সংরক্ষণ হয়েছে!');
      } else {
        toast.error('সেটিংস সংরক্ষণ করতে সমস্যা');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    } finally {
      setSaving(false);
    }
  };

  const socialLinksConfig = [
    { key: 'facebook', label: 'ফেসবুক', placeholder: 'https://facebook.com/...', icon: 'bi-facebook', color: 'text-blue-600' },
    { key: 'twitter', label: 'টুইটার / X', placeholder: 'https://twitter.com/...', icon: 'bi-twitter-x', color: 'text-sky-500' },
    { key: 'instagram', label: 'ইনস্টাগ্রাম', placeholder: 'https://instagram.com/...', icon: 'bi-instagram', color: 'text-pink-600' },
    { key: 'pinterest', label: 'পিন্টারেস্ট', placeholder: 'https://pinterest.com/...', icon: 'bi-pinterest', color: 'text-red-600' },
    { key: 'youtube', label: 'ইউটিউব', placeholder: 'https://youtube.com/...', icon: 'bi-youtube', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          সাইট সেটিংস
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          সাইটের সাধারণ সেটিংস ও সোশ্যাল লিংক কনফিগার করুন
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="bi bi-globe2 text-purple-600" style={{fontSize: '20px'}}></i>
                  সাধারণ সেটিংস
                </CardTitle>
                <CardDescription>সাইটের মূল তথ্য কনফিগার করুন</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name">সাইটের নাম *</Label>
                  <Input
                    id="site-name"
                    placeholder="CaptionLover"
                    value={settings.siteName}
                    onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="site-tagline">ট্যাগলাইন</Label>
                  <Input
                    id="site-tagline"
                    placeholder="বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল"
                    value={settings.tagline}
                    onChange={(e) => setSettings((p) => ({ ...p, tagline: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="site-description">বিবরণ</Label>
                  <Textarea
                    id="site-description"
                    placeholder="সাইট সম্পর্কে বিস্তারিত বিবরণ..."
                    value={settings.description}
                    onChange={(e) => setSettings((p) => ({ ...p, description: e.target.value }))}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="bi bi-link-45deg text-purple-600" style={{fontSize: '20px'}}></i>
                  সোশ্যাল মিডিয়া লিংক
                </CardTitle>
                <CardDescription>আপনার সোশ্যাল মিডিয়া প্রোফাইল লিংক যোগ করুন</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialLinksConfig.map((platform, index) => (
                  <div key={platform.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className={`bi ${platform.icon} ${platform.color}`} style={{fontSize: '16px'}}></i>
                      <Label htmlFor={`social-${platform.key}`} className="text-sm">
                        {platform.label}
                      </Label>
                    </div>
                    <Input
                      id={`social-${platform.key}`}
                      placeholder={platform.placeholder}
                      value={(settings.socialLinks as Record<string, string>)[platform.key] || ''}
                      onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                      className="pl-9"
                    />
                    {index < socialLinksConfig.length - 1 && (
                      <Separator className="mt-4 bg-gray-100 dark:bg-gray-800" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25 px-8"
            >
              {saving ? (
                <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>
              ) : (
                <i className="bi bi-floppy mr-2" style={{fontSize: '16px'}}></i>
              )}
              সংরক্ষণ করুন
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
