import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
};

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

// Format price
export const formatPrice = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

// Format large numbers
export const formatCount = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// Truncate text
export const truncate = (text, maxLen = 100) =>
  text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;

// Get initials for avatar fallback
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Generate random color from string (for avatar backgrounds)
export const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

// Category config
export const CATEGORIES = [
  { id: 'artwork', label: 'Artwork', emoji: '🎨', description: 'Canvas prints, posters, framed art' },
  { id: 'clothing', label: 'Clothing', emoji: '👕', description: 'T-shirts, hoodies, caps, bags' },
  { id: 'accessories', label: 'Accessories', emoji: '📱', description: 'Phone cases, mugs, pillows' },
];

export const getCategoryConfig = (categoryId) =>
  CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

// Status badge config
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  paid: { label: 'Paid', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  shipped: { label: 'Shipped', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  refund_eligible: { label: 'Refund Eligible', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  refunded: { label: 'Refunded', color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
};

export const REFUND_STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  under_review: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-400/10' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10' },
  processed: { label: 'Processed', color: 'text-teal-400', bg: 'bg-teal-400/10' },
};

// Canvas dimensions per category
export const CANVAS_DIMENSIONS = {
  artwork: { width: 800, height: 600, label: '4:3 (Standard)' },
  clothing: { width: 600, height: 750, label: '4:5 (Garment)' },
  accessories: { width: 600, height: 600, label: '1:1 (Square)' },
};

// Debounce utility
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Error message extractor
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';
