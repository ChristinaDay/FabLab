import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert timestamp to natural language format
 * Examples: "2 hours ago", "yesterday", "last week", "on July 15"
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Within last hour
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  }
  
  // Within last 24 hours
  if (diffHours < 24) {
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }
  
  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'yesterday';
  }
  
  // This week
  if (diffDays < 7) {
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }
  
  // Last week
  if (diffDays < 14) {
    return 'last week';
  }
  
  // Older - show specific date
  return `on ${date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;
}
