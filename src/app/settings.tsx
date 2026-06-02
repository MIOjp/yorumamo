import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
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
          <Text style={styles.settingValue}>22:30 ›</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>起床時間</Text>
          <Text style={styles.settingValue}>07:00 ›</Text>
        </View>
      </View>

      {/* 曜日ごとの授業時間 */}
      <Text style={styles.sectionLabel}>曜日ごとの授業時間</Text>
      <View style={styles.card}>
        {[
          { day: '月曜日', time: '09:00 〜 16:30' },
          { day: '火曜日', time: '10:40 〜 14:30' },
          { day: '水曜日', time: '09:00 〜 12:20' },
          { day: '木曜日', time: '授業なし' },
          { day: '金曜日', time: '13:00 〜 16:10' },
          { day: '土曜日', time: '授業なし' },
          { day: '日曜日', time: '授業なし' },
        ].map((item) => (
          <View key={item.day} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{item.day}</Text>
            <Text style={item.time === '授業なし' ? styles.settingMuted : styles.settingValue}>
              {item.time}
            </Text>
          </View>
        ))}
      </View>

      {/* 通学 */}
      <Text style={styles.sectionLabel}>通学</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>自宅最寄り駅</Text>
          <Text style={styles.settingValue}>金山 ›</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>学校最寄り駅</Text>
          <Text style={styles.settingValue}>栄 ›</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>駅までの徒歩</Text>
          <Text style={styles.settingValue}>8分 ›</Text>
        </View>
      </View>

      {/* ルーティン所要時間 */}
      <Text style={styles.sectionLabel}>帰宅後ルーティン（所要時間）</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>夕ごはん</Text>
          <Text style={styles.settingValue}>30分 ›</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>お風呂</Text>
          <Text style={styles.settingValue}>40分 ›</Text>
        </View>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.settingLabel}>ストレッチ・散歩</Text>
          <Text style={styles.settingValue}>20分 ›</Text>
        </View>
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
  titleText: {
    fontSize: 18,
    fontWeight: '500',
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
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 14,
    color: '#222',
  },
  settingValue: {
    fontSize: 14,
    color: '#888',
  },
  settingMuted: {
    fontSize: 14,
    color: '#bbb',
  },
});