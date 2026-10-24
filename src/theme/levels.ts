import type { Ionicons } from '@expo/vector-icons';

import type { LevelId } from '@/data/schema';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Visual identity of each level. Class names are written out in full so the
 * Tailwind compiler can find them.
 */
export const levelTheme: Record<
  LevelId,
  { icon: IconName; banner: string; node: string; nodeBorder: string; text: string; bar: string; hex: string }
> = {
  basic: {
    icon: 'leaf',
    banner: 'bg-basic',
    node: 'bg-basic',
    nodeBorder: 'border-basic-dark',
    text: 'text-basic-dark',
    bar: 'bg-basic',
    hex: '#22C55E',
  },
  intermediate: {
    icon: 'rocket',
    banner: 'bg-intermediate',
    node: 'bg-intermediate',
    nodeBorder: 'border-intermediate-dark',
    text: 'text-intermediate-dark',
    bar: 'bg-intermediate',
    hex: '#3B82F6',
  },
  advanced: {
    icon: 'trophy',
    banner: 'bg-advanced',
    node: 'bg-advanced',
    nodeBorder: 'border-advanced-dark',
    text: 'text-advanced-dark',
    bar: 'bg-advanced',
    hex: '#A855F7',
  },
};

export const colors = {
  brand: '#3B6EF5',
  inkMuted: '#6B7280',
  locked: '#9CA3AF',
  white: '#FFFFFF',
};
