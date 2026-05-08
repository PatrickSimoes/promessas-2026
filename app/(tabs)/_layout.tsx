import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { PromisesProvider } from '../../src/promises-context';
import { useThemeColors } from '../../src/theme';

export default function TabsLayout() {
  const c = useThemeColors();

  return (
    <PromisesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.text,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            backgroundColor: c.tabBar,
            borderTopColor: c.border,
            height: 58,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Promessas',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text>,
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Relatório',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
          }}
        />
      </Tabs>
    </PromisesProvider>
  );
}
