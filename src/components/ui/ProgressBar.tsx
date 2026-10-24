import { View } from 'react-native';

interface ProgressBarProps {
  /** 0 to 1. */
  value: number;
  barClassName?: string;
  trackClassName?: string;
}

export default function ProgressBar({
  value,
  barClassName = 'bg-brand-500',
  trackClassName = 'bg-locked-light',
}: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <View className={`h-2.5 w-full overflow-hidden rounded-full ${trackClassName}`}>
      <View className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
    </View>
  );
}
