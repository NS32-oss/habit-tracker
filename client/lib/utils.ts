import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number, format: string = "MMM D, YYYY"): string {
  return dayjs(date).format(format);
}

export function formatStreak(days: number): string {
  if (days === 0) return "No streak";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getStreakBadgeColor(days: number): string {
  if (days === 0) return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  if (days < 7) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  if (days < 30) return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
  if (days < 100) return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300";
  return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ✅ FIX #10, #15: Mobile platform detection for haptic feedback
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor;
  // Check for common mobile identifiers
  return /android|webos|iphone|ipad|ipot|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

// ✅ FIX #15: Haptic feedback (mobile only)
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (!isMobileDevice()) return; // Only on mobile
  
  // Check if Vibration API is available
  if (!navigator.vibrate) return;
  
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };
  
  navigator.vibrate(patterns[type]);
}
