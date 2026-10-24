import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Whether to pad for the status bar (false under a native header). */
  safeTop?: boolean;
}

export default function Screen({ children, scroll = true, safeTop = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = safeTop ? insets.top + 12 : 12;

  if (!scroll) {
    return (
      <View className="flex-1 bg-surface-muted px-5" style={{ paddingTop }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface-muted"
      contentContainerClassName="px-5 pb-10"
      contentContainerStyle={{ paddingTop }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
