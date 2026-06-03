import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    ClassSchedule,
    DAYS,
    DEFAULT_CLASS_SCHEDULE,
    DEFAULT_ROUTES,
    DEFAULT_SETTINGS,
    DEFAULT_WORKPLACES, // ↓ 追加
    loadClassSchedule,
    loadRoutes,
    loadSettings,
    loadWorkplaces, // ↓ 追加
    Route,
    saveClassSchedule,
    saveRoutes,
    saveSettings,
    saveWorkplaces, // ↓ 追加
    Settings,
    Workplace, // ↓ 追加
} from '../lib/store';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [schedule, setSchedule] = useState<ClassSchedule>(DEFAULT_CLASS_SCHEDULE);
  const [routes, setRoutes] = useState<Route[]>(DEFAULT_ROUTES);
  const [workplaces, setWorkplaces] = useState<Workplace[]>(DEFAULT_WORKPLACES); // ↓ 追加
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadSettings(), loadClassSchedule(), loadRoutes(), loadWorkplaces()]).then( // ↓ 追加
        ([s, c, r, w]) => {
          setSettings(s);
          setSchedule(c);
          setRoutes(r);
          setWorkplaces(w); // ↓ 追加
        }
      );
    }, [])
  );

  const updateSetting = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: key === 'sleepTime' ? value : parseInt(value, 10) || 0,
    }));
    setSaved(false);
  };

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], hasClass: !prev[day].hasClass },
    }));
    setSaved(false);
  };

  const updateDayTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSaved(false);
  };

  const addRoute = () => {
    const newId = Date.now();
    setRoutes((prev) => [...prev, { id: newId, label: '', mins: 40 }]);
    setSaved(false);
  };

  const removeRoute = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    setSaved(false);
  };

  const updateRoute = (id: number, field: keyof Route, value: string) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'label' ? value : parseInt(value, 10) || 0 }
          : r
      )
    );
    setSaved(false);
  };

  // ↓ 追加：バイト先の操作
  const addWorkplace = () => {
    const newId = Date.now();
    setWorkplaces((prev) => [...prev, { id: newId, label: '', mins: 30 }]);
    setSaved(false);
  };

  const removeWorkplace = (id: number) => {
    setWorkplaces((prev) => prev.filter((w) => w.id !== id));
    setSaved(false);
  };

  const updateWorkplace = (id: number, field: keyof Workplace, value: string) => {
    setWorkplaces((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, [field]: field === 'label' ? value : parseInt(value, 10) || 0 }
          : w
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    await Promise.all([
      saveSettings(settings),
      saveClassSchedule(schedule),
      saveRoutes(routes),
      saveWorkplaces(workplaces), // ↓ 追加
    ]);
    setSaved(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>設定</Text>
      </View>

      {/* 基本 */}
      <Text style={styles.sectionLabel}>基本</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>就寝時間</Text>
          <TextInput
            style={styles.input}
            value={settings.sleepTime}
            onChangeText={(v) => updateSetting('sleepTime', v)}
            placeholder="22:30"
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {/* 帰りの路線 */}
      <Text style={styles.sectionLabel}>帰りの路線（所要時間）</Text>
      <View style={styles.card}>
        {routes.map((r, i) => (
          <View key={r.id} style={[styles.routeRow, i === routes.length - 1 && { borderBottomWidth: 0 }]}>
            <TextInput
              style={styles.routeLabelInput}
              value={r.label}
              onChangeText={(v) => updateRoute(r.id, 'label', v)}
              placeholder="快速"
            />
            <TextInput
              style={styles.minsInput}
              value={String(r.mins)}
              onChangeText={(v) => updateRoute(r.id, 'mins', v)}
              keyboardType="number-pad"
            />
            <Text style={styles.minsLabel}>分</Text>
            <TouchableOpacity onPress={() => removeRoute(r.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addRoute}>
          <Text style={styles.addBtnText}>＋ 路線を追加</Text>
        </TouchableOpacity>
      </View>

      {/* ↓ 追加：バイト先 */}
      <Text style={styles.sectionLabel}>バイト先（帰宅までの所要時間）</Text>
      <View style={styles.card}>
        {workplaces.map((w, i) => (
          <View key={w.id} style={[styles.routeRow, i === workplaces.length - 1 && { borderBottomWidth: 0 }]}>
            <TextInput
              style={styles.routeLabelInput}
              value={w.label}
              onChangeText={(v) => updateWorkplace(w.id, 'label', v)}
              placeholder="🏪 コンビニ"
            />
            <TextInput
              style={styles.minsInput}
              value={String(w.mins)}
              onChangeText={(v) => updateWorkplace(w.id, 'mins', v)}
              keyboardType="number-pad"
            />
            <Text style={styles.minsLabel}>分</Text>
            <TouchableOpacity onPress={() => removeWorkplace(w.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={addWorkplace}>
          <Text style={styles.addBtnText}>＋ バイト先を追加</Text>
        </TouchableOpacity>
      </View>

      {/* 曜日ごとの授業時間 */}
      <Text style={styles.sectionLabel}>曜日ごとの授業時間</Text>
      <View style={styles.card}>
        {DAYS.map((day, i) => {
          const d = schedule[day];
          return (
            <View key={day} style={[styles.dayRow, i === DAYS.length - 1 && { borderBottomWidth: 0 }]}>
              <TouchableOpacity
                style={[styles.dayToggle, d.hasClass && styles.dayToggleOn]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayToggleText, d.hasClass && styles.dayToggleTextOn]}>
                  {day}
                </Text>
              </TouchableOpacity>
              {d.hasClass ? (
                <View style={styles.dayTimes}>
                  <TextInput
                    style={styles.timeInput}
                    value={d.startTime}
                    onChangeText={(v) => updateDayTime(day, 'startTime', v)}
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={styles.timeSep}>〜</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={d.endTime}
                    onChangeText={(v) => updateDayTime(day, 'endTime', v)}
                    placeholder="16:30"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              ) : (
                <Text style={styles.noClassLabel}>授業なし</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ルーティン所要時間 */}
      <Text style={styles.sectionLabel}>帰宅後ルーティン（所要時間・分）</Text>
      <View style={styles.card}>
        {[
          { label: '🍳 ご飯を作る', key: 'cookingMins' },
          { label: '🍽️ 夕ごはん',   key: 'eatingMins'  },
          { label: '🛁 お風呂',     key: 'bathMins'    },
          { label: '🏃 ストレッチ', key: 'stretchMins' },
        ].map(({ label, key }, i, arr) => (
          <View key={key} style={[styles.settingRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabel}>{label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputMins}
                value={String(settings[key as keyof Settings])}
                onChangeText={(v) => updateSetting(key as keyof Settings, v)}
                keyboardType="number-pad"
              />
              <Text style={styles.minsLabel}>分</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saved && styles.saveButtonDone]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {saved ? '✅ 保存しました' : '保存する'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#ddd',
  },
  titleText: { fontSize: 18, fontWeight: '500' },
  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: '#888',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    borderRadius: 10, borderWidth: 0.5, borderColor: '#ddd', overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  settingLabel: { fontSize: 14, color: '#222' },
  input: {
    fontSize: 15, color: '#185FA5', fontWeight: '500',
    backgroundColor: '#E6F1FB', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, minWidth: 60, textAlign: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inputMins: {
    fontSize: 15, color: '#185FA5', fontWeight: '500',
    backgroundColor: '#E6F1FB', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, minWidth: 50, textAlign: 'center',
  },
  minsLabel: { fontSize: 13, color: '#888' },
  routeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  routeLabelInput: {
    fontSize: 14, color: '#222', backgroundColor: '#f5f5f5',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    flex: 1,
  },
  minsInput: {
    fontSize: 14, color: '#185FA5', fontWeight: '500',
    backgroundColor: '#E6F1FB', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 44, textAlign: 'center',
  },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 14, color: '#aaa' },
  addBtn: { padding: 12, alignItems: 'center' },
  addBtnText: { fontSize: 14, color: '#185FA5' },
  dayRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee', gap: 10,
  },
  dayToggle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
  },
  dayToggleOn: { backgroundColor: '#185FA5' },
  dayToggleText: { fontSize: 13, fontWeight: '500', color: '#888' },
  dayToggleTextOn: { color: '#fff' },
  dayTimes: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  timeInput: {
    fontSize: 14, color: '#185FA5', fontWeight: '500',
    backgroundColor: '#E6F1FB', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, minWidth: 56, textAlign: 'center',
  },
  timeSep: { fontSize: 13, color: '#888' },
  noClassLabel: { fontSize: 13, color: '#bbb' },
  saveButton: {
    margin: 16, padding: 14, backgroundColor: '#185FA5',
    borderRadius: 12, alignItems: 'center',
  },
  saveButtonDone: { backgroundColor: '#3B6D11' },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});