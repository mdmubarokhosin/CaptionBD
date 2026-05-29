# CaptionLover / CaptionBD — বাংলা ক্যাপশন পোর্টাল

> বাংলা ক্যাপশনের সমৃদ্ধ ভাণ্ডার। ফেসবুক, ইনস্টাগ্রাম ও হোয়াটসঅ্যাপের জন্য সেরা ক্যাপশন।

---

## 📋 সূচিপত্র (Table of Contents)

- [প্রজেক্ট সম্পর্কে](#-প্রজেক্ট-সম্পর্কে)
- [টেক স্ট্যাক](#-টেক-স্ট্যাক)
- [প্রয়োজনীয়তা](#-প্রয়োজনীয়তা)
- [লোকাল ডেভেলপমেন্ট সেটআপ](#-লোকাল-ডেভেলপমেন্ট-সেটআপ)
- [ফায়ারবেজ সেটআপ](#-ফায়ারবেজ-সেটআপ)
- [ফায়ারবেজ রুলস কনফিগারেশন](#-ফায়ারবেজ-রুলস-কনফিগারেশন)
- [ডাটাবেজ সিড (Seed Data)](#-ডাটাবেজ-সিড-seed-data)
- [গিটহাবে কোড পুশ করা](#-গিটহাবে-কোড-পুশ-করা)
- [ক্লাউডফ্লেয়ার পেজেস ডিপ্লয়মেন্ট](#-ক্লাউডফ্লেয়ার-পেজেস-ডিপ্লয়মেন্ট)
- [কাস্টম ডোমেইন সেটআপ](#-কাস্টম-ডোমেইন-সেটআপ)
- [প্রজেক্ট স্ট্রাকচার](#-প্রজেক্ট-স্ট্রাকচার)
- [এনভায়রনমেন্ট ভ্যারিয়েবল](#-এনভায়রনমেন্ট-ভ্যারিয়েবল)
- [ফিচার তালিকা](#-ফিচার-তালিকা)
- [সমস্যা সমাধান (Troubleshooting)](#-সমস্যা-সমাধান-troubleshooting)
- [লাইসেন্স](#-লাইসেন্স)

---

## 📖 প্রজেক্ট সম্পর্কে

**CaptionLover** হলো একটি সম্পূর্ণ বাংলা ক্যাপশন ওয়েবসাইট। এই পোর্টালে ইসলামিক, ভালোবাসা, কষ্ট, মোটিভেশন, প্রকৃতি, ফানি, ফেসবুক, ঈদ সহ বিভিন্ন ক্যাটাগরির ক্যাপশন পাওয়া যাবে। ইউজাররা ক্যাপশন কপি করতে পারবে, WhatsApp এ শেয়ার করতে পারবে, এবং বুকমার্ক করতে পারবে। অ্যাডমিন প্যানেল থেকে সহজেই ক্যাপশন, ক্যাটাগরি ও ট্যাগ ম্যানেজ করা যায়।

ডাটাবেজ হিসেবে **Firebase Realtime Database** ব্যবহার করা হয়েছে (Firestore বা Storage নয়)। ডিপ্লয়মেন্টের জন্য **Cloudflare Pages** ব্যবহার করা হয়েছে।

---

## 🛠 টেক স্ট্যাক

| টেকনোলজি | ভার্সন | ব্যবহার |
|-----------|---------|---------|
| **Next.js** | 16.x | ফ্রন্টএন্ড ও ব্যাকএন্ড ফ্রেমওয়ার্ক |
| **React** | 19.x | UI লাইব্রেরি |
| **TypeScript** | 5.x | টাইপ সেফ কোডিং |
| **Tailwind CSS** | 4.x | ইউটিলিটি-ফার্স্ট CSS ফ্রেমওয়ার্ক |
| **Bootstrap Icons** | 1.13.x | আইকন লাইব্রেরি |
| **shadcn/ui** | Latest | UI কম্পোনেন্ট লাইব্রেরি |
| **Firebase Realtime DB** | Modular SDK v12 | ডাটাবেজ (REST API) |
| **Cloudflare Pages** | — | হোস্টিং ও ডিপ্লয়মেন্ট |
| **@cloudflare/next-on-pages** | 1.x | Next.js → Cloudflare অ্যাডাপ্টার |

---

## 📦 প্রয়োজনীয়তা

ডেভেলপমেন্ট ও ডিপ্লয়মেন্টের জন্য নিম্নলিখিত টুলগুলো প্রয়োজন:

### ১. অ্যাকাউন্ট তৈরি করুন

| সার্ভিস | লিংক | কাজ |
|---------|------|------|
| **GitHub** | https://github.com/signup | কোড হোস্টিং |
| **Firebase (Google)** | https://console.firebase.google.com/ | ডাটাবেজ |
| **Cloudflare** | https://dash.cloudflare.com/sign-up | ডিপ্লয়মেন্ট |

### ২. লোকাল টুল (Termux / PC)

| টুল | কাজ | ইনস্টল (Termux) |
|-----|------|-------------------|
| **Node.js** | JavaScript রানটাইম | `pkg install nodejs` |
| **npm** / **Bun** | প্যাকেজ ম্যানেজার | Node.js এর সাথে আসে / `npm i -g bun` |
| **Git** | ভার্সন কন্ট্রোল | `pkg install git` |

> **PC (Windows/Mac/Linux) এর জন্য**: Node.js (v20+) ও Git ডাউনলোড করুন https://nodejs.org ও https://git-scm.com থেকে।

---

## 💻 লোকাল ডেভেলপমেন্ট সেটআপ

### ধাপ ১: প্রজেক্ট ক্লোন করুন

```bash
# GitHub থেকে ক্লোন করুন
git clone https://github.com/YOUR-USERNAME/captionbd.git
cd captionbd
```

### ধাপ ২: ডিপেন্ডেন্সি ইনস্টল করুন

```bash
# npm ব্যবহার করে
npm install

# অথবা bun ব্যবহার করে
bun install
```

### ধাপ ৩: Firebase কনফিগ আপডেট করুন

`src/lib/firebase.ts` ফাইলে আপনার নিজের Firebase ক্রেডেনশিয়াল দিন:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

`src/lib/database.ts` ফাইলে `DB_URL` আপডেট করুন:

```typescript
const DB_URL = "https://YOUR_PROJECT-default-rtdb.firebaseio.com";
```

### ধাপ ৪: ডেভ সার্ভার চালু করুন

```bash
# npm ব্যবহার করে
npm run dev

# অথবা bun ব্যবহার করে
bun run dev
```

ব্রাউজারে http://localhost:3000 ওপেন করে দেখুন।

### ধাপ ৫: বিল্ড টেস্ট

```bash
# লোকাল বিল্ড টেস্ট
npm run build
```

---

## 🔥 ফায়ারবেজ সেটআপ

### ধাপ ১: Firebase প্রজেক্ট তৈরি

১. [Firebase Console](https://console.firebase.google.com/) এ যান ও Google দিয়ে সাইন ইন করুন
২. **"Add project"** বা **"Create a project"** বাটনে ক্লিক করুন
৩. প্রজেক্টের নাম দিন (যেমন: `captionbd`)
৪. Google Analytics বন্ধ করে দিতে পারেন (প্রয়োজন নেই)
৫. **"Create project"** ক্লিক করুন

### ধাপ ২: Realtime Database তৈরি

১. Firebase Console এ বাম সাইডবারে **"Build"** → **"Realtime Database"** এ যান
২. **"Create Database"** বাটনে ক্লিক করুন
৩. **Location** নির্বাচন করুন (সুপারিশ: `asia-southeast1` বা আপনার কাছাকাছি)
৪. **Security rules** এর জন্য নিচের যেকোনো একটি সিলেক্ট করুন:
   - **"Start in test mode"** — সবাই পড়তে/লিখতে পারবে (শুধু ৩০ দিন, পরে লক হয়ে যাবে)
   - **"Start in locked mode"** — কেউ পড়তে/লিখতে পারবে না (রুলস আপডেট করলে কাজ করবে)
৫. **"Enable"** ক্লিক করুন

> **গুরুত্বপূর্ণ**: প্রোডাকশনের জন্য টেস্ট মোড ব্যবহার করবেন না। পরবর্তী ধাপে রুলস কনফিগার দেখানো হলো।

### ধাপ ৩: Firebase ক্রেডেনশিয়াল পান

১. Firebase Console এ বাম সাইডবারে **"⚙️ Project settings"** (গিয়ার আইকন) এ যান
২. **"General"** ট্যাবে নিচে স্ক্রল করে **"Your apps"** সেকশনে যান
৩. **Web icon (`</>`)** এ ক্লিক করে নতুন ওয়েব অ্যাপ রেজিস্টার করুন
৪. অ্যাপের নাম দিন (যেমন: `CaptionBD`)
৫. **Firebase SDK snippet** থেকে `firebaseConfig` অবজেক্টটি কপি করুন — এটি দরকার হবে `src/lib/firebase.ts` এ
৬. **Database URL** নিশ্চিত করুন — এটি Realtime Database পেজের উপরে থাকে, ফরম্যাট:
   ```
   https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
   ```

### ধাপ ৪: ক্রেডেনশিয়াল প্রজেক্টে সেট করুন

`src/lib/firebase.ts` ফাইলে আপনার ক্রেডেনশিয়াল বসান:

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBx...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { app, db };
```

`src/lib/database.ts` ফাইলে আপনার Database URL বসান:

```typescript
const DB_URL = "https://your-project-default-rtdb.firebaseio.com";
```

---

## 📜 ফায়ারবেজ রুলস কনফিগারেশন

### রুলস আপডেট করার পদ্ধতি

**উপায় ১: Firebase Console থেকে**

১. Firebase Console → Realtime Database → **"Rules"** ট্যাবে যান
২. নিচের রুলস পেস্ট করুন:
৩. **"Publish"** ক্লিক করুন

**উপায় ২: Firebase CLI দিয়ে (রিকমেন্ডেড)**

```bash
# Firebase CLI ইনস্টল
npm install -g firebase-tools

# Firebase এ লগইন
firebase login

# ইনিশিয়ালাইজ
firebase init

# রুলস ডিপ্লয়
firebase deploy --only database:rules
```

### প্রোডাকশন রুলস (প্রজেক্টের `firebase-rules.json`)

```json
{
  "rules": {
    "captions": {
      ".read": true,
      ".write": true,
      ".indexOn": ["categoryId", "status", "isFeatured", "createdAt"]
    },
    "categories": {
      ".read": true,
      ".write": true,
      ".indexOn": ["slug", "order"]
    },
    "tags": {
      ".read": true,
      ".write": true,
      ".indexOn": ["slug", "captionCount"]
    },
    "siteConfig": {
      ".read": true,
      ".write": true
    }
  }
}
```

### সিকিউরিটি নোট

> ⚠️ উপরের রুলসে `.read: true` ও `.write: true` দেওয়া আছে, যার মানে যে কেউ ডাটাবেজে পড়তে ও লিখতে পারবে। প্রোডাকশনে সিকিউর করতে নিচের মতো করুন:

```json
{
  "rules": {
    "captions": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["categoryId", "status", "isFeatured", "createdAt"]
    },
    "categories": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["slug", "order"]
    },
    "tags": {
      ".read": true,
      ".write": "auth != null",
      ".indexOn": ["slug", "captionCount"]
    },
    "siteConfig": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

> Firebase Authentication সেটআপ করলে `auth != null` রুলস কাজ করবে। অ্যাডমিন ইউজারদের জন্য Authentication সেটআপ করে Custom Claims ব্যবহার করতে পারেন।

---

## 🌱 ডাটাবেজ সিড (Seed Data)

প্রজেক্টে বিল্ট-ইন সিড ফাংশন আছে যা ডাটাবেজে নমুনা ডাটা যোগ করে।

### সিড রান করার পদ্ধতি

**উপায় ১: API এন্ডপয়েন্ট কল করে**

লোকাল ডেভ সার্ভার চালু রেখে ব্রাউজারে যান:

```
http://localhost:3000/api/admin/seed
```

**উপায় ২: curl কমান্ড**

```bash
curl http://localhost:3000/api/admin/seed
```

### সিড ডাটা কী কী যোগ করবে

| ডাটা সংখ্যা | বিবরণ |
|-------------|---------|
| **১৭টি ক্যাটাগরি** | ইসলামিক, ভালোবাসা, কষ্ট, মোটিভেশন, প্রকৃতি, ফানি, ফেসবুক, ঈদ ইত্যাদি |
| **১৬টি ট্যাগ** | রোমান্টিক, কষ্ট, মোটিভেশন, জীবন, প্রকৃতি, ফানি ইত্যাদি |
| **২০টি নমুনা ক্যাপশন** | বিভিন্ন ক্যাটাগরির বাংলা ক্যাপশন |
| **সাইট কনফিগ** | সাইটের নাম, ট্যাগলাইন, সোশ্যাল লিংক |

### ডাটাবেজ ক্লিয়ার করা

ডাটাবেজের সব ডাটা মুছতে:

```
http://localhost:3000/api/admin/seed?action=clear
```

---

## 🐙 গিটহাবে কোড পুশ করা

### ধাপ ১: GitHub এ নতুন রিপোজিটরি তৈরি

১. https://github.com/new এ যান
২. রিপোজিটরির নাম দিন: `captionbd` (অথবা যে নাম খুশি)
৩. **Public** বা **Private** সিলেক্ট করুন
৪. **"Add a README file"** — **না** দিন (আমাদের প্রজেক্টে আগে থেকেই আছে)
৫. **"Add .gitignore"** — **না** দিন (আমাদের প্রজেক্টে আগে থেকেই আছে)
৬. **"Create repository"** ক্লিক করুন

### ধাপ ২: লোকাল প্রজেক্ট GitHub এ কানেক্ট

```bash
# প্রজেক্ট ফোল্ডারে যান
cd captionbd

# গিট ইনিশিয়ালাইজ (যদি আগে না করা থাকে)
git init

# সব ফাইল স্টেজে যোগ করুন
git add .

# প্রথম কমিট
git commit -m "Initial commit: CaptionBD Bengali Caption Portal"

# GitHub রিমোট যোগ করুন (আপনার ইউজারনেম দিন)
git remote add origin https://github.com/YOUR-USERNAME/captionbd.git

# মেইন ব্রাঞ্চ পুশ করুন
git branch -M main
git push -u origin main
```

### ধাপ ৩: আপডেট পুশ করা (পরবর্তী)

```bash
# পরিবর্তন স্টেজে যোগ
git add .

# কমিট
git commit -m "Update: ফিচার আপডেট"

# পুশ
git push origin main
```

### ধাপ ৪: পাসওয়ার্ড ছাড়া পুশ (GitHub PAT)

GitHub এ SSH Key অথবা Personal Access Token (PAT) ব্যবহার করলে প্রতিবার পাসওয়ার্ড দেওয়া লাগবে না।

**SSH Key:**

```bash
# SSH কী তৈরি (Termux/PC)
ssh-keygen -t ed25519 -C "your-email@example.com"

# পাবলিক কী কপি করুন
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key
# পাবলিক কী পেস্ট করুন

# এরপর SSH URL ব্যবহার করুন
git remote set-url origin git@github.com:YOUR-USERNAME/captionbd.git
```

**Personal Access Token (PAT):**

```bash
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# "repo" স্কোপ সিলেক্ট করুন
# টোকেন কপি করুন

# এরপর পুশ করলে পাসওয়ার্ডের বদলে টোকেন ব্যবহার করুন
git push origin main
# Username: YOUR-USERNAME
# Password: ghp_xxxxxxxxxxxx
```

### Termux থেকে GitHub এ কোড পুশ — সম্পূর্ণ গাইড

```bash
# ১. গিট ইনস্টল (যদি না থাকে)
pkg install git

# ২. গিট কনফিগার
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# ৩. প্রজেক্ট ফোল্ডারে যান
cd /path/to/captionbd

# ৪. গিট ইনিশিয়ালাইজ ও কমিট
git init
git add .
git commit -m "Initial commit"

# ৫. রিমোট যোগ ও পুশ
git remote add origin https://github.com/YOUR-USERNAME/captionbd.git
git branch -M main
git push -u origin main

# পাসওয়ার্ড চাইলে GitHub PAT টোকেন পেস্ট করুন
```

---

## ☁️ ক্লাউডফ্লেয়ার পেজেস ডিপ্লয়মেন্ট

### ধাপ ১: Cloudflare এ সাইন ইন

১. https://dash.cloudflare.com/sign-up এ যান
২. ইমেইল ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করুন
৩. ইমেইল ভেরিফাই করুন

### ধাপ ২: GitHub এবং Cloudflare কানেক্ট

১. Cloudflare Dashboard → বাম সাইডবারে **"Workers & Pages"** এ যান
২. **"Create"** বাটনে ক্লিক → **"Pages"** ট্যাব → **"Connect to Git"** সিলেক্ট
৩. GitHub অথেনটিকেট করুন ও আপনার `captionbd` রিপোজিটরি সিলেক্ট করুন
৪. **Repository access** অনুমোদন দিন

### ধাপ ৩: বিল্ড কনফিগারেশন

রিপোজিটরি কানেক্ট করার পর বিল্ড সেটিংস দিন:

| সেটিং | ভ্যালু |
|--------|-------|
| **Project name** | `captionbd` (অথবা যে নাম ইচ্ছা) |
| **Production branch** | `main` |
| **Build command** | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | `/` (খালি রাখুন) |

### ধাপ ৪: এনভায়রনমেন্ট ভ্যারিয়েবল (যদি দরকার হয়)

এই প্রজেক্টে এনভায়রনমেন্ট ভ্যারিয়েবলের প্রয়োজন নেই কারণ Firebase কনফিগ সরাসরি কোডে দেওয়া আছে। তবে ভবিষ্যতে সিকিউরিটি বাড়াতে চাইলে:

> Cloudflare Dashboard → Workers & Pages → আপনার প্রজেক্ট → Settings → Environment variables
>
> উদাহরণ: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_DATABASE_URL` ইত্যাদি যোগ করতে পারেন।

### ধাপ ৫: ডিপ্লয় করুন

**"Save and Deploy"** বাটনে ক্লিক করুন। বিল্ড শুরু হবে এবং কয়েক মিনিটের মধ্যে শেষ হবে।

### ধাপ ৬: ডিপ্লয়মেন্ট স্ট্যাটাস দেখুন

- **সফল**: সবুজ ✅ দেখাবে এবং আপনার সাইটের URL পাবেন: `https://captionbd.pages.dev`
- **ব্যর্থ**: লাল ❌ দেখাবে এবং "View build log" এ ক্লিক করে এরর দেখুন

### ধাপ ৭: অটোমেটিক ডিপ্লয়মেন্ট

GitHub এ `main` ব্রাঞ্চে নতুন কমিট পুশ করলে অটোমেটিক্যালি Cloudflare Pages এ ডিপ্লয় হবে। কোনো ম্যানুয়াল অ্যাকশনের প্রয়োজন নেই।

```bash
# কোড আপডেট → পুশ → অটো ডিপ্লয়
git add .
git commit -m "Fix: বাংলা ক্যাপশন আপডেট"
git push origin main
# Cloudflare অটোমেটিক্যালি বিল্ড ও ডিপ্লয় করবে
```

---

## 🌐 কাস্টম ডোমেইন সেটআপ

### ধাপ ১: ডোমেইন কেনা

কোনো ডোমেইন রেজিস্ট্রার থেকে ডোমেইন কিনুন:
- [Namecheap](https://namecheap.com)
- [Cloudflare Registrar](https://dash.cloudflare.comRegistrar)
- [Freenom](https://freenom.com) (ফ্রি .tk, .ml, .ga ডোমেইন)

### ধাপ ২: Cloudflare এ ডোমেইন যোগ

১. Cloudflare Dashboard → **"Websites"** → **"Add a site"**
২. ডোমেইন নাম দিন
৩. Cloudflare Nameservers আপডেট করুন (ডোমেইন রেজিস্ট্রার থেকে)

### ধাপ ৩: Pages এ কাস্টম ডোমেইন যোগ

১. Workers & Pages → আপনার প্রজেক্ট → **"Custom domains"** ট্যাব
২. **"Set up a custom domain"** ক্লিক
৩. আপনার ডোমেইন দিন (যেমন: `captionbd.com` বা `www.captionbd.com`)
৪. DNS রেকর্ড অটোমেটিক্যালি তৈরি হবে
৫. SSL সার্টিফিকেট অটোমেটিক্যালি জেনারেট হবে

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
captionbd/
├── public/
│   ├── logo.svg              # সাইট লোগো
│   └── robots.txt           # SEO robots ফাইল
├── src/
│   ├── app/
│   │   ├── layout.tsx        # রুট লেআউট (মেটা, ফন্ট, থিম)
│   │   ├── page.tsx          # হোম পেজ
│   │   ├── globals.css       # গ্লোবাল স্টাইল (Bootstrap Icons)
│   │   ├── not-found.tsx     # ৪০৪ পেজ
│   │   ├── captions/
│   │   │   └── page.tsx      # সকল ক্যাপশন পেজ (মুড ফিল্টার)
│   │   ├── categories/
│   │   │   ├── page.tsx      # ক্যাটাগরি লিস্ট পেজ
│   │   │   └── [slug]/
│   │   │       ├── layout.tsx # এজ রানটাইম লেআউট
│   │   │       └── page.tsx  # স্লাগ অনুযায়ী ক্যাটাগরি
│   │   ├── tags/
│   │   │   ├── page.tsx      # ট্যাগ লিস্ট পেজ
│   │   │   └── [slug]/
│   │   │       ├── layout.tsx # এজ রানটাইম লেআউট
│   │   │       └── page.tsx  # স্লাগ অনুযায়ী ট্যাগ
│   │   ├── admin/
│   │   │   ├── layout.tsx    # অ্যাডমিন লেআউট
│   │   │   ├── page.tsx       # অ্যাডমিন ড্যাশবোর্ড
│   │   │   ├── captions/
│   │   │   │   └── page.tsx   # অ্যাডমিন ক্যাপশন ম্যানেজমেন্ট
│   │   │   ├── categories/
│   │   │   │   └── page.tsx   # অ্যাডমিন ক্যাটাগরি ম্যানেজমেন্ট
│   │   │   ├── tags/
│   │   │   │   └── page.tsx   # অ্যাডমিন ট্যাগ ম্যানেজমেন্ট
│   │   │   ├── settings/
│   │   │   │   └── page.tsx   # সাইট সেটিংস
│   │   │   └── database/
│   │   │       └── page.tsx   # ডাটাবেজ ম্যানেজমেন্ট
│   │   └── api/
│   │       ├── route.ts          # API root
│   │       ├── captions/
│   │       │   ├── route.ts      # GET /api/captions
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET/PUT/DELETE সিঙ্গেল ক্যাপশন
│   │       ├── categories/
│   │       │   ├── route.ts      # GET /api/categories
│   │       │   └── [slug]/
│   │       │       └── route.ts  # GET /api/categories/:slug
│   │       ├── tags/
│   │       │   ├── route.ts      # GET /api/tags
│   │       │   └── [slug]/
│   │       │       └── route.ts  # GET /api/tags/:slug
│   │       └── admin/
│   │           ├── route.ts       # GET /api/admin/stats
│   │           ├── seed/
│   │           │   └── route.ts  # POST /api/admin/seed
│   │           ├── captions/
│   │           │   ├── route.ts   # GET/POST অ্যাডমিন ক্যাপশন
│   │           │   └── [id]/
│   │           │       └── route.ts # PUT/DELETE
│   │           ├── categories/
│   │           │   └── route.ts   # GET/POST/DELETE ক্যাটাগরি
│   │           ├── tags/
│   │           │   └── route.ts   # GET/POST/DELETE ট্যাগ
│   │           └── settings/
│   │               └── route.ts   # GET/PUT সাইট কনফিগ
│   ├── components/
│   │   ├── BiIcon.tsx            # Bootstrap Icons কম্পোনেন্ট
│   │   ├── CaptionCard.tsx       # ক্যাপশন কার্ড (কপি, শেয়ার, বুকমার্ক)
│   │   ├── ScrollToTop.tsx       # স্ক্রল টু টপ বাটন
│   │   ├── layout/
│   │   │   ├── Header.tsx        # হেডার নেভিগেশন
│   │   │   └── Footer.tsx        # ফুটার
│   │   └── ui/                   # shadcn/ui কম্পোনেন্ট
│   ├── lib/
│   │   ├── firebase.ts           # Firebase কনফিগ
│   │   ├── database.ts           # Firebase REST API ফাংশন
│   │   └── utils.ts             # ইউটিলিটি ফাংশন
│   ├── hooks/
│   │   ├── use-toast.ts          # Toast হুক
│   │   └── use-mobile.ts         # মোবাইল ডিটেকশন হুক
│   └── types/
│       └── index.ts              # TypeScript টাইপ ডেফিনিশন
├── firebase-rules.json           # Firebase Realtime Database রুলস
├── next.config.ts                # Next.js কনফিগারেশন
├── tailwind.config.ts           # Tailwind CSS কনফিগারেশন
├── postcss.config.mjs          # PostCSS কনফিগারেশন
├── tsconfig.json                # TypeScript কনফিগারেশন
├── package.json                  # প্যাকেজ ডিপেন্ডেন্সি
├── eslint.config.mjs            # ESLint কনফিগারেশন
├── components.json              # shadcn/ui কনফিগারেশন
├── .gitignore                   # গিট ইগনোর লিস্ট
└── README.md                    # এই ফাইল
```

---

## 🔧 এনভায়রনমেন্ট ভ্যারিয়েবল

এই প্রজেক্টে বর্তমানে কোনো এনভায়রনমেন্ট ভ্যারিয়েবল দরকার নেই। Firebase কনফিগ সরাসরি সোর্স কোডে দেওয়া আছে।

ভবিষ্যতে সিকিউরিটি বাড়াতে চাইলে `.env.local` ফাইল তৈরি করতে পারেন:

```env
# .env.local (এই ফাইল .gitignore এ আছে, GitHub এ আপলোড হবে না)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBx...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
```

তারপর `src/lib/firebase.ts` এ এভাবে ব্যবহার করুন:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}..appspot.com`,
};
```

---

## ✨ ফিচার তালিকা

### ইউজার ফিচার
- ✅ হোম পেজ (ফিচার্ড ক্যাপশন, ক্যাপশন অফ দ্য ডে)
- ✅ ক্যাপশন কপি (এক ক্লিকে)
- ✅ WhatsApp শেয়ার
- ✅ বুকমার্ক (localStorage)
- ✅ র‍্যান্ডম ক্যাপশন দেখুন
- ✅ ক্যাপশন অফ দ্য ডে
- ✅ ক্যাটাগরি অনুযায়ী ব্রাউজ
- ✅ ট্যাগ অনুযায়ী ব্রাউজ
- ✅ মুড ফিল্টার (খুশি, কষ্ট, রোমান্টিক, মোটিভেশনাল)
- ✅ সার্চ (ক্যাপশন সার্চ)
- ✅ Scroll to Top বাটন
- ✅ রেসপন্সিভ ডিজাইন (মোবাইল + ডেস্কটপ)
- ✅ ডার্ক/লাইট থিম
- ✅ Bootstrap Icons আইকন
- ✅ SEO অপ্টিমাইজড

### অ্যাডমিন ফিচার
- ✅ ড্যাশবোর্ড (স্ট্যাটস, চার্ট)
- ✅ ক্যাপশন CRUD (তৈরি, পড়ুন, আপডেট, ডিলিট)
- ✅ ক্যাটাগরি CRUD
- ✅ ট্যাগ CRUD
- ✅ সাইট সেটিংস (নাম, ট্যাগলাইন, সোশ্যাল লিংক)
- ✅ ডাটাবেজ ম্যানেজমেন্ট (সিড, ক্লিয়ার, রিসেট)
- ✅ স্ট্যাটিস্টিক্স (মোট ভিউ, লাইক, কপি)

---

## 🔧 সমস্যা সমাধান (Troubleshooting)

### ১. বিল্ড এরর: `Edge Runtime` মিসিং

**সমস্যা**: Cloudflare Pages এ সব ডাইনামিক রাউটে `Edge Runtime` দরকার।

**সমাধান**: সব API রাউট ফাইলের শুরুতে এই লাইন যোগ করুন:

```typescript
export const runtime = 'edge';
```

ডাইনামিক পেজের জন্য `layout.tsx` ফাইল তৈরি করুন:

```typescript
// src/app/categories/[slug]/layout.tsx
export const runtime = 'edge';
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### ২. বিল্ড এরর: `Worker size limit exceeded`

**সমস্যা**: Cloudflare ফ্রি প্ল্যানে Worker সাইজ লিমিট 3 MiB। বড় প্রজেক্টে এটি এক্সিড হতে পারে।

**সমাধান**:
- অপ্রয়োজনীয় UI কম্পোনেন্ট সরান (`src/components/ui/` এর মধ্যে যেগুলো ব্যবহার হচ্ছে না)
- `lucide-react` সরিয়ে `bootstrap-icons` ব্যবহার করুন (ইতিমধ্যে করা হয়েছে)
- Firebase SDK এর বদলে Firebase REST API ব্যবহার করুন (ইতিমধ্যে করা হয়েছে `database.ts` এ)
- অথবা Cloudflare পেইড প্ল্যানে আপগ্রেড করুন ($5/month)

### ৩. হাইড্রেশন মিসম্যাচ এরর

**সমস্যা**: Radix UI Sheet কম্পোনেন্টে `aria-controls` অ্যাট্রিবিউট সার্ভার ও ক্লায়েন্টে মিলছে না।

**সমাধান**: Header.tsx এ Sheet কম্পোনেন্টে `suppressHydrationWarning` প্রপ যোগ করুন:

```tsx
<Sheet suppressHydrationWarning>
  ...
</Sheet>
```

### ৪. Firebase কানেক্ট করতে সমস্যা

**সমস্যা**: `PERMISSION_DENIED` বা `Network error`

**সমাধান**:
- Firebase Console → Realtime Database → Rules ট্যাবে রুলস চেক করুন
- Test mode এ রাখলে সবাই অ্যাক্সেস পাবে
- `databaseURL` সঠিক কিনা চেক করুন (Realtime Database পেজ থেকে কপি)
- ব্রাউজারে `https://your-project-default-rtdb.firebaseio.com/captions.json` ভিজিট করে চেক করুন

### ৫. Cloudflare Pages এ ডিপ্লয় ফেইল

**সমাধান**:
- Build log চেক করুন: Cloudflare → Workers & Pages → প্রজেক্ট → Deployments
- `next build` লোকালি পাস করে কিনা টেস্ট করুন
- `@cloudflare/next-on-pages@1` বিল্ড কমান্ড সঠিক কিনা চেক করুন
- Build output directory `.vercel/output/static` সঠিক কিনা চেক করুন

### ৬. ডাটাবেজে ডাটা দেখা যাচ্ছে না

**সমাধান**:
- `/api/admin/seed` এন্ডপয়েন্টে কল করে সিড ডাটা যোগ করুন
- Firebase Console → Realtime Database → Data ট্যাবে ডাটা দেখুন
- API রেসপন্স চেক করুন: `http://localhost:3000/api/captions`

---

## 📝 লাইসেন্স

এই প্রজেক্টটি MIT লাইসেন্সের অধীনে। বিস্তারিত জানতে [LICENSE](LICENSE) ফাইল দেখুন।

---

<p align="center">
  <strong>CaptionBD</strong> — বাংলা ক্যাপশন জগতের ১ নম্বর পোর্টাল<br>
  Built with ❤️ using Next.js, Tailwind CSS & Firebase
</p>
