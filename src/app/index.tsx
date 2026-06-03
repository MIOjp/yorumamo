import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { requestNotificationPermission, scheduleRoutineNotifications } from '../lib/notifications';
import {
  calcArrivalTime,
  calcRoutine,
  DEFAULT_SETTINGS,
  getTodayDay,
  loadClassSchedule,
  loadPartTimeJob,
  loadRoutes,
  loadSettings,
  loadWorkplaces,
  PartTimeJob,
  resolveArrivalBase,
  Route,
  Routine,
  saveSelectedRoute,
  Settings,
  Workplace,
} from '../lib/store';

type SkipState = {
  cooking: boolean;
  eating: boolean;
  stretch: boolean;
};

function applySkip(settings: Settings, skip: SkipState): Settings {
  return {
    ...settings,
    cookingMins: skip.eating || skip.cooking ? 0 : settings.cookingMins,
    eatingMins:  skip.eating ? 0 : settings.eatingMins,
    stretchMins: skip.stretch ? 0 : settings.stretchMins,
  };
}

export default function TodayScreen() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [todayDay, setTodayDay] = useState('');
  const [hasClass, setHasClass] = useState(true);
  const [classStart, setClassStart] = useState('');
  const [classEnd, setClassEnd] = useState('');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [todayJob, setTodayJob] = useState<PartTimeJob | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [skip, setSkip] = useState<SkipState>({ cooking: false, eating: false, stretch: false });

  useFocusEffect(
    useCallback(() => {
      const day = getTodayDay();
      setTodayDay(day);

      Promise.all([
        loadSettings(),
        loadClassSchedule(),
        loadRoutes(),
        loadPartTimeJob(),
        loadWorkplaces(),
      ]).then(([s, schedule, r, job, wps]) => {
        setSettings(s);
        setRoutes(r);
        setWorkplaces(wps);

        const todaySchedule = schedule[day];
        setHasClass(todaySchedule?.hasClass ?? true);
        setClassStart(todaySchedule?.startTime ?? '');
        setClassEnd(todaySchedule?.endTime ?? '');

        const todayStr = new Date().toISOString().split('T')[0];
        const activeJob = job?.date === todayStr ? job : null;
        setTodayJob(activeJob);

        setSelectedRoute(null);
        setRoutines([]);
        setSkip({ cooking: false, eating: false, stretch: false });

        requestNotificationPermission();
      });
    }, [])
  );

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    saveSelectedRoute(route);
    const todayWorkplace = workplaces.find((w) => w.id === todayJob?.workplaceId) ?? null;
    const { baseEndTime, travelMins } = resolveArrivalBase(
      classEnd, todayJob, todayWorkplace, route.mins,
    );
    const arrival = calcArrivalTime(baseEndTime, travelMins);
    const newRoutines = calcRoutine(arrival, applySkip(settings, skip));
    setRoutines(newRoutines);
    scheduleRoutineNotifications(newRoutines);
  };

  const toggleSkip = (key: keyof SkipState) => {
    if (!selectedRoute) return;
    setSkip((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const todayWorkplace = workplaces.find((w) => w.id === todayJob?.workplaceId) ?? null;
      const { baseEndTime, travelMins } = resolveArrivalBase(
        classEnd, todayJob, todayWorkplace, selectedRoute.mins,
      );
      const arrival = calcArrivalTime(baseEndTime, travelMins);
      scheduleRoutineNotifications(calcRoutine(arrival, applySkip(settings, next)));
      return next;
    });
  };

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const dayNames: { [key: string]: string } = {
    月: '月曜日', 火: '火曜日', 水: '水曜日', 木: '木曜日',
    金: '金曜日', 土: '土曜日', 日: '日曜日',
  };

  const arrivalTime = selectedRoute
    ? (() => {
        const todayWorkplace = workplaces.find((w) => w.id === todayJob?.workplaceId) ?? null;
        const { baseEndTime, travelMins } = resolveArrivalBase(
          classEnd, todayJob, todayWorkplace, selectedRoute.mins,
        );
        return calcArrivalTime(baseEndTime, travelMins);
      })()
    : '';

  const skipButtons: { key: keyof SkipState; label: string }[] = [
    { key: 'eating',  label: '🍽️ 食べてきた' },
    { key: 'cooking', label: '🍳 作るだけスキップ' },
    { key: 'stretch', label: '🏃 散歩スキップ' },
  ];

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.dateText}>
          {dayNames[todayDay]} · {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
        </Text>
        <Text style={styles.titleText}>今日のよるまも</Text>
      </View>

      {!hasClass && (
        <View style={styles.noClassBanner}>
          <Text style={styles.noClassText}>🌿 今日は授業なし。ゆっくり過ごす日。</Text>
        </View>
      )}

      {hasClass && (
        <>
          {todayJob && (() => {
            const wp = workplaces.find((w) => w.id === todayJob.workplaceId);
            return (
              <View style={styles.jobBadge}>
                <Text style={styles.jobBadgeText}>
                  🏪 {wp?.label ?? 'バイト'}　{todayJob.startTime} 〜 {todayJob.endTime}
                </Text>
              </View>
            );
          })()}

          {arrivalTime !== '' ? (
            <View style={styles.homeCard}>
              <Text style={styles.homeCardLabel}>帰宅予定</Text>
              <Text style={styles.homeCardTime}>{arrivalTime}</Text>
              <Text style={styles.homeCardSub}>{selectedRoute?.label}　所要{selectedRoute?.mins}分</Text>
            </View>
          ) : (
            <View style={styles.selectBanner}>
              <Text style={styles.selectBannerText}>👇 今日乗る電車を選んでください</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>今日の帰り方</Text>
          {routes.map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            const todayWorkplace = workplaces.find((w) => w.id === todayJob?.workplaceId) ?? null;
            const { baseEndTime, travelMins } = resolveArrivalBase(
              classEnd, todayJob, todayWorkplace, route.mins,
            );
            const arrival = calcArrivalTime(baseEndTime, travelMins);
            return (
              <TouchableOpacity
                key={route.id}
                style={[styles.routeOption, isSelected && styles.routeSelected]}
                onPress={() => handleSelectRoute(route)}
              >
                <Text style={styles.routeLabel}>{route.label}</Text>
                <Text style={styles.routeMins}>所要{route.mins}分</Text>
                <View style={isSelected ? styles.arrivalBadgeSelected : styles.arrivalBadge}>
                  <Text style={isSelected ? styles.arrivalBadgeTextSelected : styles.arrivalBadgeText}>
                    帰宅 {arrival}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionLabel}>授業</Text>
          <View style={styles.timelineItem}>
            <Text style={styles.labelText}>🚃 家を出る</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timeText}>{classStart} 〜 {classEnd}</Text>
            <Text style={styles.labelText}>📚 授業</Text>
          </View>
        </>
      )}

      {routines.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>今日のカスタマイズ</Text>
          <View style={styles.skipRow}>
            {skipButtons.map(({ key, label }) => {
              if (key === 'cooking' && skip.eating) return null;
              const isOn = skip[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.skipBtn, isOn && styles.skipBtnOn]}
                  onPress={() => toggleSkip(key)}
                >
                  <Text style={[styles.skipBtnText, isOn && styles.skipBtnTextOn]}>
                    {isOn ? '✓ ' : ''}{label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {routines.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>帰宅後のルーティン</Text>
          {routines.map((routine, index) => {
            const isOpen = openIndex === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.timelineItem}
                onPress={() => toggleOpen(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.timeText}>{routine.time}</Text>
                <Text style={styles.labelText}>{routine.label}</Text>
                {routine.minsUntilSleep > 0 && (
                  <View style={styles.countRow}>
                    <Text style={styles.countText}>⏰ 就寝まで{routine.minsUntilSleep}分</Text>
                    {routine.idealMins && (
                      <Text style={styles.idealText}>　理想：{routine.idealMins}分前</Text>
                    )}
                  </View>
                )}
                {isOpen && routine.science && (
                  <View style={styles.scienceBox}>
                    <Text style={styles.scienceText}>🔬 {routine.science}</Text>
                  </View>
                )}
                {routine.science && (
                  <Text style={styles.tapHint}>{isOpen ? '▲ 閉じる' : '▼ 解説を見る'}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#ddd',
  },
  dateText: { fontSize: 12, color: '#888', marginBottom: 2 },
  titleText: { fontSize: 18, fontWeight: '500' },
  jobBadge: {
    marginHorizontal: 12, marginTop: 10, marginBottom: 2,
    paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: '#FFF3CD', borderRadius: 8,
    borderWidth: 0.5, borderColor: '#FFE082',
  },
  jobBadgeText: { fontSize: 13, color: '#856404', fontWeight: '500' },
  homeCard: {
    backgroundColor: '#fff', margin: 12, padding: 14,
    borderRadius: 12, borderWidth: 0.5, borderColor: '#ddd',
  },
  homeCardLabel: { fontSize: 11, color: '#888' },
  homeCardTime: { fontSize: 28, fontWeight: '500', color: '#185FA5' },
  homeCardSub: { fontSize: 12, color: '#666', marginTop: 2 },
  selectBanner: {
    margin: 12, padding: 14, backgroundColor: '#FFF8E1',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#FFE082',
  },
  selectBannerText: { fontSize: 13, color: '#854F0B' },
  noClassBanner: {
    margin: 12, padding: 14, backgroundColor: '#EAF3DE',
    borderRadius: 12, borderWidth: 0.5, borderColor: '#c5e0a0',
  },
  noClassText: { fontSize: 14, color: '#3B6D11' },
  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: '#888',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
    textTransform: 'uppercase',
  },
  routeOption: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    padding: 12, borderRadius: 10, borderWidth: 0.5, borderColor: '#ddd',
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  routeSelected: { borderColor: '#185FA5', borderWidth: 1.5, backgroundColor: '#E6F1FB' },
  routeLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
  routeMins: { fontSize: 12, color: '#888' },
  arrivalBadge: {
    backgroundColor: '#E6F1FB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  arrivalBadgeText: { fontSize: 11, color: '#185FA5' },
  arrivalBadgeSelected: {
    backgroundColor: '#185FA5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  arrivalBadgeTextSelected: { fontSize: 11, color: '#fff' },
  timelineItem: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    padding: 12, borderRadius: 10, borderWidth: 0.5, borderColor: '#ddd',
  },
  timeText: { fontSize: 12, color: '#888', marginBottom: 2 },
  labelText: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  countRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  countText: { fontSize: 12, color: '#185FA5', fontWeight: '500' },
  idealText: { fontSize: 12, color: '#888' },
  scienceBox: {
    marginTop: 10, backgroundColor: '#f0f4ff',
    borderRadius: 8, padding: 10,
  },
  scienceText: { fontSize: 12, color: '#444', lineHeight: 18 },
  tapHint: { fontSize: 11, color: '#aaa', marginTop: 6, textAlign: 'right' },
  skipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 12, marginBottom: 4,
  },
  skipBtn: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 0.5, borderColor: '#ddd', backgroundColor: '#fff',
  },
  skipBtnOn: { backgroundColor: '#185FA5', borderColor: '#185FA5' },
  skipBtnText: { fontSize: 12, color: '#666' },
  skipBtnTextOn: { color: '#fff', fontWeight: '500' },
});