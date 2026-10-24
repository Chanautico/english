import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';
import { getLessonById } from '@/data/curriculum';
import LessonScreen from '@/screens/lesson/LessonScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={({ route }) => ({
            title: getLessonById(route.params.lessonId)?.title ?? '',
            headerBackTitle: t('common.back'),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
