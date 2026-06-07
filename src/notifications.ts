import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDERS_KEY = '@promessas/reminders-enabled';
const REMINDER_ID_KEY = '@promessas/reminder-id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function isRemindersEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  return raw === '1';
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Lembretes',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function requestPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function enableWeeklyReminder(): Promise<boolean> {
  const granted = await requestPermission();
  if (!granted) return false;
  await ensureAndroidChannel();
  await cancelWeeklyReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '✨ Suas promessas tão te chamando',
      body: 'Dá uma olhada no progresso e marca o que você cumpriu essa semana.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      // expo-notifications usa 1=domingo ... 7=sábado, então segunda-feira é 2.
      weekday: 2,
      hour: 19,
      minute: 0,
      channelId: 'default',
    },
  });

  await AsyncStorage.multiSet([
    [REMINDERS_KEY, '1'],
    [REMINDER_ID_KEY, id],
  ]);

  // Confirmação imediata pra deixar claro que ativou (o lembrete em si só chega na segunda).
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete ativado ✅',
      body: 'Combinado! Te aviso toda segunda às 19h pra revisar suas promessas.',
    },
    trigger: null,
  });

  return true;
}

export async function cancelWeeklyReminder() {
  const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // already gone
    }
  }
  await AsyncStorage.multiRemove([REMINDERS_KEY, REMINDER_ID_KEY]);
}
