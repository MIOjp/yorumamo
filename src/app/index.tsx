import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { calcRoutine, loadSelectedTrain, loadSettings, Routine, Train, TRAINS } from './store';

export default function TodayScreen() {
  const [selectedTrain, setSelectedTrain] = useState<Train>(TRAINS[0]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadSelectedTrain(), loadSettings()]).then(([train, settings]) => {
        setSelectedTrain(train);
        setRoutines(calcRoutine(train.arrivalTime, settings));
      });
    }, [])
  );

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.dateText}>月曜日 · 6月2日</Text>
        <Text style={styles.titleText}>今日のよるまも</Text>
      </View>

      {/* 帰宅予定カード */}
      <View style={styles.homeCard}>
        <Text style={styles.homeCardLabel}>帰宅予定</Text>
        <Text style={styles.homeCardTime}>{selectedTrain.arrivalTime}</Text>
        <Text style={styles.homeCardSub}>{selectedTrain.dep} → 帰宅</Text>
      </View>

      {/* 授業 */}
      <Text style={styles.sectionLabel}>授業</Text>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>08:10</Text>
        <Text style={styles.labelText}>🚃 家を出る</Text>
        <Text style={styles.subText}>最寄り駅 8:18発</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>09:00 〜 16:30</Text>
        <Text style={styles.labelText}>📚 授業</Text>
      </View>

      {/* 帰宅後ルーティン */}
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
            {/* 時刻とラベル */}
            <Text style={styles.timeText}>{routine.time}</Text>
            <Text style={styles.labelText}>{routine.label}</Text>

            {/* 就寝まで◯分・理想◯分前 */}
            {routine.minsUntilSleep > 0 && (
              <View style={styles.countRow}>
                <Text style={styles.countText}>
                  ⏰ 就寝まで{routine.minsUntilSleep}分
                </Text>
                {routine.idealMins && (
                  <Text style={styles.idealText}>
                    　理想：{routine.idealMins}分前
                  </Text>
                )}
              </View>
            )}

            {/* 科学的解説（タップで開く） */}
            {isOpen && routine.science && (
              <View style={styles.scienceBox}>
                <Text style={styles.scienceText}>🔬 {routine.science}</Text>
              </View>
            )}

            {/* タップヒント */}
            {routine.science && (
              <Text style={styles.tapHint}>{isOpen ? '▲ 閉じる' : '▼ 解説を見る'}</Text>
            )}
          </TouchableOpacity>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
  },
  homeCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  homeCardLabel: {
    fontSize: 11,
    color: '#888',
  },
  homeCardTime: {
    fontSize: 28,
    fontWeight: '500',
    color: '#185FA5',
  },
  homeCardSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    textTransform: 'uppercase',
  },
  timelineItem: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  countText: {
    fontSize: 12,
    color: '#185FA5',
    fontWeight: '500',
  },
  idealText: {
    fontSize: 12,
    color: '#888',
  },
  scienceBox: {
    marginTop: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 10,
  },
  scienceText: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
  },
  tapHint: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 6,
    textAlign: 'right',
  },
});