import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "বাংলা ক্যাপশন সেরাটা [২০২৬ আপডেট] – 1000+ Bangla Caption | CaptionLover",
  description:
    "বাংলা ক্যাপশন খুঁজছেন? Caption Lover-এ পাবেন ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য মোটিভেশন, রোমান্টিক, কষ্টের, ইসলামিক ১০০০+ ক্যাপশন ও স্ট্যাটাস।",
  keywords: [
    "বাংলা ক্যাপশন",
    "bangla caption",
    "caption",
    "স্ট্যাটাস",
    "ফেসবুক ক্যাপশন",
    "ভালোবাসার ক্যাপশন",
    "ইসলামিক ক্যাপশন",
  ],
  openGraph: {
    title: "CaptionLover - বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল",
    description:
      "ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য ১০০০+ বাংলা ক্যাপশন ও স্ট্যাটাস।",
    type: "website",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaptionLover - বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল",
    description:
      "ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য ১০০০+ বাংলা ক্যাপশন ও স্ট্যাটাস।",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
        <Toaster />
      </body>
    </html>
  );
}
