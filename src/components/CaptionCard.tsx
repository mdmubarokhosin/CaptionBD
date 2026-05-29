'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CaptionCardProps {
  caption: {
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
  };
}

// ─── Mood → accent colour mapping ──────────────────────────────────────────

const moodColors: Record<string, string> = {
  happy: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  romantic: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  motivational: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  funny: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  angry: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  nostalgic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  friendship: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  life: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  attitude: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  love: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'breakup': 'bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function wrapWithBengaliQuotes(text: string): string {
  if (text.startsWith('❝')) return text;
  return `❝${text}❞`;
}

function getMoodColorClass(mood: string): string {
  const key = mood.toLowerCase();
  return moodColors[key] ?? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300';
}

function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function getSavedCaptionIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('saved_caption_ids');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistSavedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('saved_caption_ids', JSON.stringify([...ids]));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─── Animation variants ─────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CaptionCard({ caption }: CaptionCardProps) {
  const { id, text, category, tags, mood, emojis, isFeatured, copyCount, likeCount, views } =
    caption;

  const [liked, setLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localCopyCount, setLocalCopyCount] = useState(copyCount);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hydrate saved state from localStorage on mount
  useEffect(() => {
    setSaved(getSavedCaptionIds().has(id));
  }, [id]);

  const displayText = wrapWithBengaliQuotes(text);
  const moodClass = getMoodColorClass(mood);

  // ── Actions ────────────────────────────────────────────────────────────

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setLocalCopyCount((c) => c + 1);
      toast.success('কপি হয়েছে!', {
        description: 'ক্যাপশনটি ক্লিপবোর্ডে কপি করা হয়েছে।',
        duration: 2000,
      });

      // Fire-and-forget API call
      fetch(`/api/captions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'copy' }),
      }).catch(() => {});

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('কপি করতে সমস্যা হয়েছে');
    }
  }

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setLocalLikeCount((c) => c + 1);

    try {
      await fetch(`/api/captions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });
    } catch {
      // Revert on failure
      setLiked(false);
      setLocalLikeCount((c) => c - 1);
    }
  }

  function handleToggleSave() {
    const ids = getSavedCaptionIds();
    if (ids.has(id)) {
      ids.delete(id);
      setSaved(false);
      toast.info('সরিয়ে ফেলা হয়েছে', { description: 'সেভড লিস্ট থেকে সরানো হয়েছে।', duration: 2000 });
    } else {
      ids.add(id);
      setSaved(true);
      toast.success('সেভ হয়েছে!', { description: 'ক্যাপশনটি সেভ করা হয়েছে।', duration: 2000 });
    }
    persistSavedIds(ids);
  }

  function getShareUrl() {
    return typeof window !== 'undefined' ? `${window.location.origin}/c/${id}` : '';
  }

  function handleWhatsAppShare() {
    const shareUrl = getShareUrl();
    const shareText = text + ' - ' + shareUrl;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  async function handleShare() {
    const shareUrl = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `বাংলা ক্যাপশন – ${category.name}`,
          text: text.slice(0, 120),
          url: shareUrl,
        });
      } catch {
        // User cancelled or error — fall back to copy
        fallbackCopy(shareUrl);
      }
    } else {
      fallbackCopy(shareUrl);
    }
  }

  function fallbackCopy(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('লিংক কপি হয়েছে!', { duration: 2000 }))
      .catch(() => toast.error('শেয়ার করতে সমস্যা হয়েছে'));
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-violet-500/5 dark:border-gray-700/50 dark:bg-gray-950">
        {/* ── Category & Featured badges ────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-4">
          <Link
            href={`/categories/${category.slug}`}
            className="pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              className="border-0 text-xs font-semibold shadow-sm"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Badge>
          </Link>

          {isFeatured && (
            <Badge className="border-0 bg-amber-400/90 text-amber-950 text-xs font-bold shadow-sm">
              ⭐ ফিচার্ড
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col gap-4 px-5 pt-14 pb-2">
          {/* ── Mood pill ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${moodClass}`}
            >
              {mood}
            </span>
            {caption.type && (
              <span className="text-[11px] text-muted-foreground">{caption.type}</span>
            )}
          </div>

          {/* ── Caption text ────────────────────────────────────────────── */}
          <p className="text-lg leading-[1.85] font-medium text-gray-900 tracking-wide dark:text-gray-50">
            {displayText}
          </p>

          {/* ── Emojis ─────────────────────────────────────────────────── */}
          {emojis && (
            <div className="flex items-center gap-1 text-2xl leading-none" aria-hidden>
              {[...emojis].map((emoji, i) => (
                <motion.span
                  key={`${emoji}-${i}`}
                  initial={{ opacity: 0, rotate: -15 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="inline-block"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* ── Tags (max 3) ────────────────────────────────────────────── */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.slice(0, 3).map(({ tag }) => (
                <Link key={tag.slug} href={`/tags/${tag.slug}`} onClick={(e) => e.stopPropagation()}>
                  <Badge
                    variant="outline"
                    className="border-violet-200 text-violet-600 text-[11px] font-normal hover:bg-violet-50 dark:border-violet-700/60 dark:text-violet-400 dark:hover:bg-violet-900/30"
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
              {tags.length > 3 && (
                <span className="text-[11px] text-muted-foreground">+{tags.length - 3}</span>
              )}
            </div>
          )}

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

          {/* ── Action buttons ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Copy */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:text-gray-400 dark:hover:text-violet-400 dark:hover:bg-violet-900/30"
              >
                {copied ? (
                  <i className="bi bi-check-lg" style={{ fontSize: '16px', color: '#10B981' }}></i>
                ) : (
                  <i className="bi bi-clipboard" style={{ fontSize: '16px' }}></i>
                )}
                <span className="text-xs">{formatCount(localCopyCount)}</span>
              </Button>

              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={liked}
                className={`gap-1.5 transition-colors ${
                  liked
                    ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                    : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30'
                }`}
              >
                <i
                  className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} ${liked ? 'scale-110 transition-transform' : ''}`}
                  style={{ fontSize: '16px' }}
                ></i>
                <span className="text-xs">{formatCount(localLikeCount)}</span>
              </Button>

              {/* Bookmark / Save */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSave}
                className={`gap-1.5 transition-colors ${
                  saved
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                    : 'text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:bg-amber-900/30'
                }`}
              >
                <i
                  className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'} ${saved ? 'scale-110 transition-transform' : ''}`}
                  style={{ fontSize: '16px' }}
                ></i>
              </Button>

              {/* WhatsApp Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppShare}
                className="gap-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/30"
                aria-label="WhatsApp শেয়ার করুন"
              >
                <i className="bi bi-whatsapp" style={{ fontSize: '16px' }}></i>
              </Button>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:text-gray-400 dark:hover:text-sky-400 dark:hover:bg-sky-900/30"
              >
                <i className="bi bi-share-fill" style={{ fontSize: '16px' }}></i>
              </Button>
            </div>

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <i className="bi bi-eye-fill" style={{ fontSize: '12px' }}></i>
                {formatCount(views)}
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>📋 {formatCount(localCopyCount)}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>❤️ {formatCount(localLikeCount)}</span>
            </div>
          </div>
        </CardContent>

        {/* ── Subtle bottom accent line ─────────────────────────────────── */}
        <div
          className="h-[3px] w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, ${category.color}, #8B5CF6, ${category.color})`,
          }}
        />
      </Card>
    </motion.div>
  );
}
