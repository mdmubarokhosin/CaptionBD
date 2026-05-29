'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { motion } from 'framer-motion';
import { useAdminAuth } from '../layout';

export default function AdminDatabase() {
  useAdminAuth();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: string; message: string; time: string } | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'ডাটা সফলভাবে সিড করা হয়েছে!');
        setLastAction({
          type: 'success',
          message: data.message,
          time: new Date().toLocaleString('bn-BD'),
        });
      } else {
        toast.error(data.error || 'ডাটা সিড করতে সমস্যা');
        setLastAction({
          type: 'error',
          message: data.error || 'সিড করতে সমস্যা',
          time: new Date().toLocaleString('bn-BD'),
        });
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
      setLastAction({
        type: 'error',
        message: 'নেটওয়ার্ক ত্রুটি',
        time: new Date().toLocaleString('bn-BD'),
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'সব ডাটা মুছে ফেলা হয়েছে!');
        setLastAction({
          type: 'success',
          message: data.message,
          time: new Date().toLocaleString('bn-BD'),
        });
      } else {
        toast.error(data.error || 'ডাটা মুছে ফেলতে সমস্যা');
        setLastAction({
          type: 'error',
          message: data.error || 'মুছে ফেলতে সমস্যা',
          time: new Date().toLocaleString('bn-BD'),
        });
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
      setLastAction({
        type: 'error',
        message: 'নেটওয়ার্ক ত্রুটি',
        time: new Date().toLocaleString('bn-BD'),
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          ডাটাবেজ ম্যানেজমেন্ট
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          ডাটাবেজ সিড ও ক্লিয়ার করুন
        </p>
      </div>

      {/* Status Display */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-l-4 ${
            lastAction.type === 'success'
              ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
          }`}>
            <CardContent className="p-4 flex items-start gap-3">
              {lastAction.type === 'success' ? (
                <i className="bi bi-check-circle-fill text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" style={{fontSize: '20px'}}></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill text-red-600 dark:text-red-400 shrink-0 mt-0.5" style={{fontSize: '20px'}}></i>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {lastAction.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {lastAction.time}
                </p>
              </div>
              <button
                onClick={() => setLastAction(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
              >
                <i className="bi bi-x-lg" style={{fontSize: '14px'}}></i>
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Seed Data Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <i className="bi bi-stars text-emerald-600 dark:text-emerald-400" style={{fontSize: '20px'}}></i>
              </div>
              <div>
                <CardTitle className="text-lg">ডাটা সিড করুন</CardTitle>
                <CardDescription>স্যাম্পল ডাটা দিয়ে ডাটাবেজ পূরণ করুন</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-start gap-3">
              <i className="bi bi-info-circle-fill text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" style={{fontSize: '20px'}}></i>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">সিড ডাটা তথ্য:</p>
                <ul className="mt-1.5 space-y-1 text-blue-600 dark:text-blue-400">
                  <li>• ১৩টি ক্যাটাগরি</li>
                  <li>• ১৫টি ট্যাগ</li>
                  <li>• ২০টি স্যাম্পল ক্যাপশন</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
              size="lg"
            >
              {seeding ? (
                <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>
              ) : (
                <i className="bi bi-stars mr-2" style={{fontSize: '16px'}}></i>
              )}
              {seeding ? 'সিড হচ্ছে...' : 'ডাটা সিড করুন'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clear Data Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i className="bi bi-trash3-fill text-red-600 dark:text-red-400" style={{fontSize: '20px'}}></i>
              </div>
              <div>
                <CardTitle className="text-lg">সব ডাটা মুছুন</CardTitle>
                <CardDescription>সম্পূর্ণ ডাটাবেজ খালি করুন</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-start gap-3">
              <i className="bi bi-exclamation-triangle-fill text-red-600 dark:text-red-400 shrink-0 mt-0.5" style={{fontSize: '20px'}}></i>
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-medium">সতর্কতা!</p>
                <p className="mt-1">
                  এই কাজটি সম্পূর্ণ ডাটাবেজ মুছে ফেলবে। এর মধ্যে সকল ক্যাপশন, ক্যাটাগরি, ট্যাগ, ইউজার ডাটা অন্তর্ভুক্ত।
                  এই কাজ বাতিল করা যাবে না।
                </p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={clearing}
                  className="w-full"
                  size="lg"
                >
                  {clearing ? (
                    <i className="bi bi-arrow-repeat bi-spin mr-2" style={{fontSize: '16px'}}></i>
                  ) : (
                    <i className="bi bi-trash3-fill mr-2" style={{fontSize: '16px'}}></i>
                  )}
                  {clearing ? 'মুছে ফেলা হচ্ছে...' : 'সব ডাটা মুছুন'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি সম্পূর্ণ নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    সম্পূর্ণ ডাটাবেজ মুছে যাবে — ক্যাপশন, ক্যাটাগরি, ট্যাগ, ইউজার সবকিছু।
                    এই কাজ বাতিল করা যাবে <strong>না</strong>।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClear}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    হ্যাঁ, সব মুছুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
