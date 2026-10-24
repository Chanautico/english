import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface StatChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
}

export default function StatChip({ icon, iconColor, label }: StatChipProps) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5">
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text className="text-sm font-semibold text-ink">{label}</Text>
    </View>
  );
}
