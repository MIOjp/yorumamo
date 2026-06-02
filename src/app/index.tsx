import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadSelectedTrain, Train, TRAINS } from './store';

export default function TodayScreen() {
  const [selectedTrain, setSelectedTrain] = useState<Train>(TRAINS[0]);

  // 今日タブを開くたびに最新の電車情報を読み込む
  useFocusEffect(
    useCallback(() => {
      loadSelectedTrain().then(setSelectedTrain);
    }, [])
  );

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
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>{selectedTrain.arrivalTime} 〜 19:30</Text>
        <Text style={styles.labelText}>🛋 自由時間</Text>
        <Text style={styles.subText}>勉強・趣味・休憩など</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>19:30 までに</Text>
        <Text style={styles.labelText}>🍽️ 夕ごはん</Text>
        <Text style={styles.subText}>就寝3時間前に終える</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>21:00 までに</Text>
        <Text style={styles.labelText}>🛁 お風呂（38〜40℃）</Text>
        <Text style={styles.subText}>就寝90分前に入ると寝つき改善</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>21:30</Text>
        <Text style={styles.labelText}>📵 スマホをオフ</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>22:00</Text>
        <Text style={styles.labelText}>💡 照明を暗くする</Text>
      </View>
      <View style={styles.timelineItem}>
        <Text style={styles.timeText}>22:30</Text>
        <Text style={styles.labelText}>🌙 就寝</Text>
      </View>

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
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});