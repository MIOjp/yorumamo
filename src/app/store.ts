import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存するデータのキー名
const KEYS = {
  SELECTED_TRAIN: 'selectedTrain',
};

// 電車データの型定義
export type Train = {
  id: number;
  dep: string;
  info: string;
  arrivalTime: string;
};

// 電車の選択肢
export const TRAINS: Train[] = [
  { id: 1, dep: '16:55発 → 快速急行', info: '乗換1回 · 所要46分', arrivalTime: '18:42' },
  { id: 2, dep: '17:25発 → 急行',     info: '乗換1回 · 所要47分', arrivalTime: '19:12' },
  { id: 3, dep: '17:52発 → 普通',     info: '乗換なし · 所要46分', arrivalTime: '19:38' },
];

// 選んだ電車を保存する
export async function saveSelectedTrain(train: Train) {
  await AsyncStorage.setItem(KEYS.SELECTED_TRAIN, JSON.stringify(train));
}

// 保存した電車を読み込む
export async function loadSelectedTrain(): Promise<Train> {
  const data = await AsyncStorage.getItem(KEYS.SELECTED_TRAIN);
  if (data) {
    return JSON.parse(data);
  }
  // 保存データがなければ最初の電車を返す
  return TRAINS[0];
}