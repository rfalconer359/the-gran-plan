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
  nap: {
    label: 'Nap',
    emoji: '😴',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300',
  },
  play: {
    label: 'Play',
    emoji: '🎮',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-300',
  },
  outdoor: {
    label: 'Outdoor',
    emoji: '🌳',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
  },
  learning: {
    label: 'Learning',
    emoji: '📚',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
  },
  bath: {
    label: 'Bath',
    emoji: '🛁',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
  },
  medicine: {
    label: 'Medicine',
    emoji: '💊',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
  },
  other: {
    label: 'Other',
    emoji: '📝',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
  },
};
