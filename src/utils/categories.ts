import type { ScheduleCategory } from '../types';

interface CategoryConfig {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const categoryConfig: Record<ScheduleCategory, CategoryConfig> = {
  meal: {
    label: 'Meal',
    emoji: '🍽️',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
  },
  milk: {
    label: 'Milk',
    emoji: '🍼',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
  },
  nap: {
    label: 'Nap',
    emoji: '😴',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300',
  },
  sleep: {
    label: 'Sleep',
    emoji: '🌙',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-800',
    borderColor: 'border-violet-300',
  },
  walk: {
    label: 'Walk',
    emoji: '🚶',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  play: {
    label: 'Play',
    emoji: '🧸',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-300',
  },
  bath: {
    label: 'Bath Time',
    emoji: '🛁',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
  },
  tummytime: {
    label: 'Tummy Time',
    emoji: '👶',
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-800',
    borderColor: 'border-lime-300',
  },
  other: {
    label: 'Other',
    emoji: '📝',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
};
