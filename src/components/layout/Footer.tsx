"use client";

import Link from "next/link";

/* ─── Data ──────────────────────────────────────────────────────────────── */

interface CategoryLink {
  label: string;
  slug: string;
}

const categoryLinks: CategoryLink[] = [
  { label: "ইসলামিক", slug: "islamic" },
  { label: "জীবন", slug: "life" },
  { label: "ভালোবাসা", slug: "love" },
  { label: "কষ্ট", slug: "sad" },
  { label: "মোটিভেশন", slug: "motivation" },
  { label: "ফানি", slug: "funny" },
];

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    href: "https://facebook.com/captionlover",
    icon: <i className="bi bi-facebook" style={{ fontSize: "16px" }}></i>,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/captionlover",
    icon: <i className="bi bi-twitter-x" style={{ fontSize: "16px" }}></i>,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/captionlover",
    icon: <i className="bi bi-instagram" style={{ fontSize: "16px" }}></i>,
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com/captionlover",
    icon: <i className="bi bi-pinterest" style={{ fontSize: "16px" }}></i>,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@captionlover",
    icon: <i className="bi bi-youtube" style={{ fontSize: "16px" }}></i>,
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1a1a2e] text-gray-300">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#8B5CF6]/10 blur-3xl" />

      {/* ── Main footer content ─────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          {/* ── Column 1: Brand ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex w-fit items-center gap-2">
              <i
                className="bi bi-heart-fill"
                style={{ fontSize: "24px", color: "#8B5CF6" }}
              ></i>
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa] bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                CaptionLover
              </span>
            </Link>

            <p className="text-lg font-semibold leading-relaxed text-white">
              বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল
            </p>

            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              CaptionLover হলো বাংলা ক্যাপশনের সমৃদ্ধ ভাণ্ডার। আমরা
              আপনাদের জন্য সেরা বাংলা ক্যাপশন, স্ট্যাটাস এবং কোটস
              সংগ্রহ করে থাকি। সোশ্যাল মিডিয়ায় আপনার পোস্টকে
              আরও আকর্ষণীয় করতে আমাদের ক্যাপশনগুলো ব্যবহার করুন।
            </p>
          </div>

          {/* ── Column 2: Categories ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              ক্যাটাগরি
            </h3>

            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {categoryLinks.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[#a78bfa]"
                  >
                    <span className="inline-block size-1 rounded-full bg-[#8B5CF6]/60 transition-transform group-hover:scale-125" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Social Media ─────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              সোশ্যাল মিডিয়া
            </h3>

            <p className="text-sm text-gray-400">
              আমাদের সাথে সোশ্যাল মিডিয়ায় যুক্ত থাকুন এবং নতুন ক্যাপশন
              পেতে আমাদের ফলো করুন।
            </p>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-[#a78bfa]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-sm text-gray-500 sm:flex-row sm:px-6 sm:text-left lg:px-16">
          <p>© ২০২৬ CaptionLover. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 text-gray-500">
            ভালোবাসায় তৈরি করা হয়েছে
            <i
              className="bi bi-heart-fill"
              style={{ fontSize: "14px", color: "#8B5CF6" }}
            ></i>
            বাংলাদেশে
          </p>
        </div>
      </div>
    </footer>
  );
}
