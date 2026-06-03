import * as Notifications from 'expo-notifications';
import { Routine } from './store';

// 通知を受け取ったときの挙動（フォアグラウンドでも表示する）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 通知の許可をリクエスト
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 今日のルーティン通知をすべてキャンセルして再セット
export async function scheduleRoutineNotifications(routines: Routine[]): Promise<void> {
  // 既存の通知をすべてキャンセル
  await Notifications.cancelAllScheduledNotificationsAsync();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const now = new Date();

  for (const routine of routines) {
    // 就寝（minsUntilSleep === 0）と時刻範囲表示（〜を含む）以外はスキップしない
    // 時刻文字列から HH:MM を取り出す
    const rawTime = routine.time.includes('〜')
      ? routine.time.split('〜')[0].trim()  // 範囲の開始時刻
      : routine.time.trim();                // 単独時刻

    const [h, m] = rawTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) continue;

    // 今日のその時刻のDateオブジェクトを作る
    const trigger = new Date();
    trigger.setHours(h, m, 0, 0);

    // すでに過ぎた時刻はスキップ
    if (trigger <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: routine.label,
        body: routine.sub ?? 'よるまもの時間です',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
  }
}