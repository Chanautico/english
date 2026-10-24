import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function PrimaryButton({ label, onPress, icon }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-4 active:bg-brand-700"
    >
      {icon && <Ionicons name={icon} size={20} color="#FFFFFF" />}
      <Text className="text-base font-bold text-white" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
