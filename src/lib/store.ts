import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SELECTED_ROUTE: 'selectedRoute',
  SLEEP_TIME: 'sleepTime',
  COOKING_MINS: 'cookingMins',
  EATING_MINS: 'eatingMins',
  BATH_MINS: 'bathMins',
  STRETCH_MINS: 'stretchMins',
  CLASS_SCHEDULE: 'classSchedule',
  ROUTES: 'routes',
  // ↓ 追加
  WORKPLACES: 'workplaces',
  PART_TIME_JOB: 'partTimeJob',
};

export type Routine = {
  time: string;
  label: string;
  sub?: string;
  minsUntilSleep: number;
  idealMins?: number;
  science?: string;
};

export type Route = {
  id: number;
  label: string;
  mins: number;
};

// ↓ 追加
export type Workplace = {
  id: number;
  label: string; // 例：'🏪 コンビニ'
  mins: number;  // バイト先から自宅までの所要時間（分）
};

// ↓ 追加
export type PartTimeJob = {
  date: string;        // 対象日付 例：'2026-06-04'
  workplaceId: number; // Workplace の id
  startTime: string;   // 例：'17:00'
  endTime: string;     // 例：'21:00'
};

export type Settings = {
  sleepTime: string;
  cookingMins: number;
  eatingMins: number;
  bathMins: number;
  stretchMins: number;
};

export type DaySchedule = {
  hasClass: boolean;
  startTime: string;
  endTime: string;
};

export type ClassSchedule = {
  [day: string]: DaySchedule;
};

export const DAYS = ['月', '火', '水', '木', '金', '土', '日'];

export const DEFAULT_CLASS_SCHEDULE: ClassSchedule = {
  月: { hasClass: true,  startTime: '09:00', endTime: '16:30' },
  火: { hasClass: true,  startTime: '10:40', endTime: '14:30' },
  水: { hasClass: true,  startTime: '09:00', endTime: '12:20' },
  木: { hasClass: false, startTime: '',      endTime: ''       },
  金: { hasClass: true,  startTime: '13:00', endTime: '16:10' },
  土: { hasClass: false, startTime: '',      endTime: ''       },
  日: { hasClass: false, startTime: '',      endTime: ''       },
};

export const DEFAULT_SETTINGS: Settings = {
  sleepTime: '22:30',
  cookingMins: 20,
  eatingMins: 30,
  bathMins: 40,
  stretchMins: 20,
};

export const DEFAULT_ROUTES: Route[] = [
  { id: 1, label: '🚄 快速', mins: 40 },
  { id: 2, label: '🚃 普通', mins: 55 },
];

// ↓ 追加
export const DEFAULT_WORKPLACES: Workplace[] = [];

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

export function calcArrivalTime(endTime: string, mins: number): string {
  const end = timeToMinutes(endTime);
  return minutesToTime(end + mins);
}

export function getTodayDay(): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[new Date().getDay()];
}

// ↓ 追加：バイトと授業の遅い方を帰宅起点にする
export function resolveArrivalBase(
  classEndTime: string,
  job: PartTimeJob | null,
  workplace: Workplace | null,
  defaultTravelMins: number,
): { baseEndTime: string; travelMins: number } {
  if (!job || !workplace) {
    return { baseEndTime: classEndTime, travelMins: defaultTravelMins };
  }
  const classMinutes = timeToMinutes(classEndTime);
  const jobMinutes = timeToMinutes(job.endTime);

  if (jobMinutes >= classMinutes) {
    return { baseEndTime: job.endTime, travelMins: workplace.mins };
  } else {
    return { baseEndTime: classEndTime, travelMins: defaultTravelMins };
  }
}

export function calcRoutine(arrivalTime: string, settings: Settings): Routine[] {
  const arrival = timeToMinutes(arrivalTime);
  const sleep = timeToMinutes(settings.sleepTime);

  const skipCooking = settings.cookingMins === 0;
  const skipEating  = settings.eatingMins === 0;
  const skipStretch = settings.stretchMins === 0;

  const routines: Routine[] = [];
  let cursor = arrival;

  // ── ご飯を作る ──
  if (!skipCooking) {
    const start = cursor;
    const end   = cursor + settings.cookingMins;
    routines.push({
      time: `${minutesToTime(start)} 〜 ${minutesToTime(end)}`,
      label: '🍳 ご飯を作る',
      minsUntilSleep: sleep - start,
      idealMins: 180,
      science: '帰宅後すぐ取りかかることで、夜の時間を圧迫しない。料理は段取り力が必要で、脳をほどよく使う良いウォームアップにもなる。',
    });
    cursor = end;
  }

  // ── 夕ごはん ──
  if (!skipEating) {
    const start = cursor;
    const end   = cursor + settings.eatingMins;
    routines.push({
      time: `${minutesToTime(start)} 〜 ${minutesToTime(end)}`,
      label: '🍽️ 夕ごはん',
      sub: '就寝3時間前に終えるのが理想',
      minsUntilSleep: sleep - start,
      idealMins: 180,
      science: '食後は消化のために血流が胃腸に集中する。就寝3時間前までに食べ終わると、寝るころには消化が落ち着いて深い眠りにつきやすくなる。',
    });
    cursor = end;
  }

  // ── お風呂 ──
  // 食べてきた場合（skipEating）は外食時点で消化が始まっているので帰宅後すぐ入浴OK
  // 作るだけスキップ（skipCooking かつ !skipEating）も食後すぐではなく食べてから入る
  {
    const start = cursor;
    const end   = cursor + settings.bathMins;
    routines.push({
      time: `${minutesToTime(start)} 〜 ${minutesToTime(end)}`,
      label: '🛁 お風呂（38〜40℃）',
      sub: '就寝90分前に入ると寝つき改善',
      minsUntilSleep: sleep - start,
      idealMins: 90,
      science: '入浴で上がった深部体温が、90分かけてゆっくり下がる。この体温低下のタイミングで強い眠気が訪れる。38〜40℃のぬるめが効果的。',
    });
    cursor = end;
  }

  // ── ストレッチ・散歩 ──
  if (!skipStretch) {
    const start = cursor;
    const end   = cursor + settings.stretchMins;
    routines.push({
      time: `${minutesToTime(start)} 〜 ${minutesToTime(end)}`,
      label: '🏃 ストレッチ・散歩',
      minsUntilSleep: sleep - start,
      idealMins: 60,
      science: '軽いストレッチや散歩は副交感神経を優位にして、体をリラックスモードに切り替える。激しい運動は逆効果なので注意。',
    });
    cursor = end;
  }

  // ── スマホをオフ（就寝60分前固定）──
  // cursor が就寝60分前を過ぎていたらその時点で表示
  const phoneOffTime = Math.min(cursor, sleep - 60);
  routines.push({
    time: minutesToTime(phoneOffTime),
    label: '📵 スマホをオフ',
    minsUntilSleep: sleep - phoneOffTime,
    idealMins: 60,
    science: 'スマホのブルーライトは、睡眠ホルモン「メラトニン」の分泌を抑制する。就寝60分前にオフにすることでメラトニンの分泌を守れる。',
  });

  // ── 照明を暗くする（就寝30分前固定）──
  const dimLightTime = sleep - 30;
  routines.push({
    time: minutesToTime(dimLightTime),
    label: '💡 照明を暗くする',
    minsUntilSleep: sleep - dimLightTime,
    idealMins: 30,
    science: '明るい光はメラトニンの分泌を妨げる。就寝30分前から照明を暗くすることで、自然な眠気を引き出せる。間接照明や電球色がおすすめ。',
  });

  // ── 就寝 ──
  routines.push({
    time: settings.sleepTime,
    label: '🌙 就寝',
    minsUntilSleep: 0,
    science: '毎日同じ時間に寝ることで体内時計が整い、自然に眠くなる・自然に起きられるリズムができる。',
  });

  return routines;
}

export async function saveSelectedRoute(route: Route) {
  await AsyncStorage.setItem(KEYS.SELECTED_ROUTE, JSON.stringify(route));
}

export async function loadSelectedRoute(): Promise<Route | null> {
  const data = await AsyncStorage.getItem(KEYS.SELECTED_ROUTE);
  if (data) return JSON.parse(data);
  return null;
}

export async function saveRoutes(routes: Route[]) {
  await AsyncStorage.setItem(KEYS.ROUTES, JSON.stringify(routes));
}

export async function loadRoutes(): Promise<Route[]> {
  const data = await AsyncStorage.getItem(KEYS.ROUTES);
  if (data) return JSON.parse(data);
  return DEFAULT_ROUTES;
}

// ↓ 追加
export async function saveWorkplaces(workplaces: Workplace[]) {
  await AsyncStorage.setItem(KEYS.WORKPLACES, JSON.stringify(workplaces));
}

// ↓ 追加
export async function loadWorkplaces(): Promise<Workplace[]> {
  const data = await AsyncStorage.getItem(KEYS.WORKPLACES);
  if (data) return JSON.parse(data);
  return DEFAULT_WORKPLACES;
}

// ↓ 追加
export async function savePartTimeJob(job: PartTimeJob | null) {
  if (job === null) {
    await AsyncStorage.removeItem(KEYS.PART_TIME_JOB);
  } else {
    await AsyncStorage.setItem(KEYS.PART_TIME_JOB, JSON.stringify(job));
  }
}

// ↓ 追加
export async function loadPartTimeJob(): Promise<PartTimeJob | null> {
  const data = await AsyncStorage.getItem(KEYS.PART_TIME_JOB);
  if (data) return JSON.parse(data);
  return null;
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

export async function saveClassSchedule(schedule: ClassSchedule) {
  await AsyncStorage.setItem(KEYS.CLASS_SCHEDULE, JSON.stringify(schedule));
}

export async function loadClassSchedule(): Promise<ClassSchedule> {
  const data = await AsyncStorage.getItem(KEYS.CLASS_SCHEDULE);
  if (data) return JSON.parse(data);
  return DEFAULT_CLASS_SCHEDULE;
}