import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    DEFAULT_WORKPLACES,
    loadPartTimeJob,
    loadWorkplaces,
    PartTimeJob,
    savePartTimeJob,
    Workplace,
} from '../lib/store';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function InputScreen() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>(DEFAULT_WORKPLACES);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | null>(null);
  const [targetDate, setTargetDate] = useState<'today' | 'tomorrow'>('tomorrow');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [savedJob, setSavedJob] = useState<PartTimeJob | null>(null);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const wps = await loadWorkplaces();
        setWorkplaces(wps);

        const job = await loadPartTimeJob();
        setSavedJob(job);

        if (job) {
          setStartTime(job.startTime);
          setEndTime(job.endTime);
          setTargetDate(job.date === getTodayDate() ? 'today' : 'tomorrow');
          const matched = wps.find((w) => w.id === job.workplaceId) ?? null;
          setSelectedWorkplace(matched);
        }
      })();
    }, [])
  );

  const handleSave = async () => {
    if (!selectedWorkplace) {
      Alert.alert('バイト先を選んでください');
      return;
    }
    if (!startTime.match(/^\d{1,2}:\d{2}$/) || !endTime.match(/^\d{1,2}:\d{2}$/)) {
      Alert.alert('時刻を HH:MM 形式で入力してください（例：17:00）');
      return;
    }
    const job: PartTimeJob = {
      date: targetDate === 'today' ? getTodayDate() : getTomorrowDate(),
      workplaceId: selectedWorkplace.id,
      startTime,
      endTime,
    };
    await savePartTimeJob(job);
    setSavedJob(job);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    Alert.alert('バイトを削除', '保存中のバイト情報を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await savePartTimeJob(null);
          setSavedJob(null);
          setSelectedWorkplace(null);
          setStartTime('');
          setEndTime('');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>入力</Text>
        <Text style={styles.subText}>今日の帰り方は「今日」タブから選んでください</Text>
      </View>

      {/* バイト */}
      <Text style={styles.sectionLabel}>明日のバイト（任意）</Text>

      {/* 対象日の切り替え */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, targetDate === 'tomorrow' && styles.toggleBtnActive]}
          onPress={() => setTargetDate('tomorrow')}
        >
          <Text style={[styles.toggleText, targetDate === 'tomorrow' && styles.toggleTextActive]}>
            明日
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, targetDate === 'today' && styles.toggleBtnActive]}
          onPress={() => setTargetDate('today')}
        >
          <Text style={[styles.toggleText, targetDate === 'today' && styles.toggleTextActive]}>
            今日
          </Text>
        </TouchableOpacity>
      </View>

      {/* バイト先選択 */}
      {workplaces.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>設定タブでバイト先を登録してください</Text>
        </View>
      ) : (
        <View style={styles.workplaceCard}>
          {workplaces.map((w, i) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.workplaceRow,
                i === workplaces.length - 1 && { borderBottomWidth: 0 },
                selectedWorkplace?.id === w.id && styles.workplaceRowActive,
              ]}
              onPress={() => setSelectedWorkplace(w)}
            >
              <Text style={[
                styles.workplaceLabel,
                selectedWorkplace?.id === w.id && styles.workplaceLabelActive,
              ]}>
                {w.label}
              </Text>
              <Text style={[
                styles.workplaceMins,
                selectedWorkplace?.id === w.id && styles.workplaceLabelActive,
              ]}>
                帰宅 {w.mins}分
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 時刻入力 */}
      <View style={styles.card}>
        <View style={styles.timeRow}>
          <Text style={styles.timeRowLabel}>開始</Text>
          <TextInput
            style={styles.timeInput}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="17:00"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={[styles.timeRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.timeRowLabel}>終了</Text>
          <TextInput
            style={styles.timeInput}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="21:00"
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {/* 保存ボタン */}
      <TouchableOpacity
        style={[styles.saveButton, saved && styles.saveButtonDone]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          {saved ? '✅ 保存しました' : '保存する'}
        </Text>
      </TouchableOpacity>

      {/* 保存済み表示 */}
      {savedJob && (
        <View style={styles.savedCard}>
          <Text style={styles.savedLabel}>📌 保存中のバイト</Text>
          <Text style={styles.savedText}>
            {savedJob.date}　
            {workplaces.find((w) => w.id === savedJob.workplaceId)?.label ?? '不明'}
          </Text>
          <Text style={styles.savedText}>
            {savedJob.startTime} 〜 {savedJob.endTime}
          </Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>削除する</Text>
          </TouchableOpacity>
        </View>
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
  titleText: { fontSize: 18, fontWeight: '500' },
  subText: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: '#888',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    borderRadius: 10, borderWidth: 0.5, borderColor: '#ddd', padding: 12,
  },
  emptyText: { fontSize: 13, color: '#bbb', textAlign: 'center', paddingVertical: 8 },
  toggleRow: {
    flexDirection: 'row', marginHorizontal: 12, marginBottom: 6, gap: 8,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 0.5, borderColor: '#ddd',
    backgroundColor: '#fff', alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#185FA5', borderColor: '#185FA5' },
  toggleText: { fontSize: 14, color: '#666', fontWeight: '500' },
  toggleTextActive: { color: '#fff' },
  workplaceCard: {
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    borderRadius: 10, borderWidth: 0.5, borderColor: '#ddd', overflow: 'hidden',
  },
  workplaceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  workplaceRowActive: { backgroundColor: '#185FA5' },
  workplaceLabel: { fontSize: 14, color: '#222', fontWeight: '500' },
  workplaceLabelActive: { color: '#fff' },
  workplaceMins: { fontSize: 12, color: '#888' },
  timeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  timeRowLabel: { fontSize: 13, color: '#666' },
  timeInput: {
    fontSize: 15, color: '#185FA5', fontWeight: '500',
    backgroundColor: '#E6F1FB', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, minWidth: 70, textAlign: 'center',
  },
  saveButton: {
    margin: 12, marginTop: 8, padding: 14, backgroundColor: '#185FA5',
    borderRadius: 12, alignItems: 'center',
  },
  saveButtonDone: { backgroundColor: '#3B6D11' },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  savedCard: {
    marginHorizontal: 12, marginBottom: 12, padding: 14,
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#ddd', gap: 4,
  },
  savedLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 2 },
  savedText: { fontSize: 14, color: '#333' },
  clearText: { fontSize: 12, color: '#E05050', marginTop: 6, textDecorationLine: 'underline' },
});