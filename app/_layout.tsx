import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '../src/settings-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
