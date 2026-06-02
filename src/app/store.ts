import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SELECTED_TRAIN: 'selectedTrain',
  SLEEP_TIME: 'sleepTime',
  COOKING_MINS: 'cookingMins',
  EATING_MINS: 'eatingMins',
  BATH_MINS: 'bathMins',
  STRETCH_MINS: 'stretchMins',
};

export type Train = {
  id: number;
  dep: string;
  info: string;
  arrivalTime: string;
};

export type Routine = {
  time: string;
  label: string;
  sub?: string;
  minsUntilSleep: number;   // 実際の就寝まで何分
  idealMins?: number;        // 理想の就寝前分数
  science?: string;
};

export type Settings = {
  sleepTime: string;
  cookingMins: number;
  eatingMins: number;
  bathMins: number;
  stretchMins: number;
};

export const DEFAULT_SETTINGS: Settings = {
  sleepTime: '22:30',
  cookingMins: 20,
  eatingMins: 30,
  bathMins: 40,
  stretchMins: 20,
};

export const TRAINS: Train[] = [
  { id: 1, dep: '16:55発 → 快速急行', info: '乗換1回 · 所要46分', arrivalTime: '18:42' },
  { id: 2, dep: '17:25発 → 急行',     info: '乗換1回 · 所要47分', arrivalTime: '19:12' },
  { id: 3, dep: '17:52発 → 普通',     info: '乗換なし · 所要46分', arrivalTime: '19:38' },
];

function timeToMinutes(time: string): number {
  const parts = time.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calcRoutine(arrivalTime: string, settings: Settings): Routine[] {
  const arrival = timeToMinutes(arrivalTime);
  const sleep = timeToMinutes(settings.sleepTime);

  const cookingStart = arrival;
  const cookingEnd = cookingStart + settings.cookingMins;
  const eatingEnd = cookingEnd + settings.eatingMins;
  const bathEnd = eatingEnd + settings.bathMins;
  const stretchEnd = bathEnd + settings.stretchMins;
  const phoneOff = stretchEnd;
  const dimLight = sleep - 30;

  return [
    {
      time: `${minutesToTime(cookingStart)} 〜 ${minutesToTime(cookingEnd)}`,
      label: '🍳 ご飯を作る',
      minsUntilSleep: sleep - cookingStart,
      idealMins: 180,
      science: '帰宅後すぐ取りかかることで、夜の時間を圧迫しない。料理は段取り力が必要で、脳をほどよく使う良いウォームアップにもなる。',
    },
    {
      time: `${minutesToTime(cookingEnd)} 〜 ${minutesToTime(eatingEnd)}`,
      label: '🍽️ 夕ごはん',
      minsUntilSleep: sleep - cookingEnd,
      idealMins: 180,
      science: '食後は消化のために血流が胃腸に集中する。就寝3時間前までに食べ終わると、寝るころには消化が落ち着いて深い眠りにつきやすくなる。',
    },
    {
      time: `${minutesToTime(eatingEnd)} 〜 ${minutesToTime(bathEnd)}`,
      label: '🛁 お風呂（38〜40℃）',
      minsUntilSleep: sleep - eatingEnd,
      idealMins: 90,
      science: '入浴で上がった深部体温が、90分かけてゆっくり下がる。この体温低下のタイミングで強い眠気が訪れる。38〜40℃のぬるめが効果的。',
    },
    {
      time: `${minutesToTime(bathEnd)} 〜 ${minutesToTime(stretchEnd)}`,
      label: '🏃 ストレッチ・散歩',
      minsUntilSleep: sleep - bathEnd,
      idealMins: 60,
      science: '軽いストレッチや散歩は副交感神経を優位にして、体をリラックスモードに切り替える。激しい運動は逆効果なので注意。',
    },
    {
      time: minutesToTime(phoneOff),
      label: '📵 スマホをオフ',
      minsUntilSleep: sleep - phoneOff,
      idealMins: 60,
      science: 'スマホのブルーライトは、睡眠ホルモン「メラトニン」の分泌を抑制する。就寝60分前にオフにすることでメラトニンの分泌を守れる。',
    },
    {
      time: minutesToTime(dimLight),
      label: '💡 照明を暗くする',
      minsUntilSleep: sleep - dimLight,
      idealMins: 30,
      science: '明るい光はメラトニンの分泌を妨げる。就寝30分前から照明を暗くすることで、自然な眠気を引き出せる。間接照明や電球色がおすすめ。',
    },
    {
      time: settings.sleepTime,
      label: '🌙 就寝',
      minsUntilSleep: 0,
      science: '毎日同じ時間に寝ることで体内時計が整い、自然に眠くなる・自然に起きられるリズムができる。',
    },
  ];
}

export async function saveSelectedTrain(train: Train) {
  await AsyncStorage.setItem(KEYS.SELECTED_TRAIN, JSON.stringify(train));
}

export async function loadSelectedTrain(): Promise<Train> {
  const data = await AsyncStorage.getItem(KEYS.SELECTED_TRAIN);
  if (data) return JSON.parse(data);
  return TRAINS[0];
}

export async function saveSettings(settings: Settings) {
  await AsyncStorage.setItem(KEYS.SLEEP_TIME, settings.sleepTime);
  await AsyncStorage.setItem(KEYS.COOKING_MINS, String(settings.cookingMins));
  await AsyncStorage.setItem(KEYS.EATING_MINS, String(settings.eatingMins));
  await AsyncStorage.setItem(KEYS.BATH_MINS, String(settings.bathMins));
  await AsyncStorage.setItem(KEYS.STRETCH_MINS, String(settings.stretchMins));
}

export async function loadSettings(): Promise<Settings> {
  const [sleepTime, cookingMins, eatingMins, bathMins, stretchMins] = await Promise.all([
    AsyncStorage.getItem(KEYS.SLEEP_TIME),
    AsyncStorage.getItem(KEYS.COOKING_MINS),
    AsyncStorage.getItem(KEYS.EATING_MINS),
    AsyncStorage.getItem(KEYS.BATH_MINS),
    AsyncStorage.getItem(KEYS.STRETCH_MINS),
  ]);

  return {
    sleepTime: sleepTime ?? DEFAULT_SETTINGS.sleepTime,
    cookingMins: cookingMins ? parseInt(cookingMins, 10) : DEFAULT_SETTINGS.cookingMins,
    eatingMins: eatingMins ? parseInt(eatingMins, 10) : DEFAULT_SETTINGS.eatingMins,
    bathMins: bathMins ? parseInt(bathMins, 10) : DEFAULT_SETTINGS.bathMins,
    stretchMins: stretchMins ? parseInt(stretchMins, 10) : DEFAULT_SETTINGS.stretchMins,
  };
}