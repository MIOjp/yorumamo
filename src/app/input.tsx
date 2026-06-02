import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InputScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>入力</Text>
        <Text style={styles.subText}>電車を選ぶ＋バイトがあれば前日に追加</Text>
      </View>

      {/* 電車選択 */}
      <Text style={styles.sectionLabel}>帰りの電車を選ぶ</Text>
      <View style={[styles.trainOption, styles.trainSelected]}>
        <View>
          <Text style={styles.trainDep}>16:55発 → 快速急行</Text>
          <Text style={styles.trainArr}>乗換1回 · 所要46分</Text>
        </View>
        <View style={styles.trainBadgeSelected}>
          <Text style={styles.trainBadgeTextSelected}>帰宅 18:42</Text>
        </View>
      </View>
      <View style={styles.trainOption}>
        <View>
          <Text style={styles.trainDep}>17:25発 → 急行</Text>
          <Text style={styles.trainArr}>乗換1回 · 所要47分</Text>
        </View>
        <View style={styles.trainBadge}>
          <Text style={styles.trainBadgeText}>帰宅 19:12</Text>
        </View>
      </View>
      <View style={styles.trainOption}>
        <View>
          <Text style={styles.trainDep}>17:52発 → 普通</Text>
          <Text style={styles.trainArr}>乗換なし · 所要46分</Text>
        </View>
        <View style={styles.trainBadge}>
          <Text style={styles.trainBadgeText}>帰宅 19:38</Text>
        </View>
      </View>

      {/* バイト */}
      <Text style={styles.sectionLabel}>明日のバイト（任意）</Text>
      <View style={styles.card}>
        <View style={styles.timeRow}>
          <Text style={styles.timeRowLabel}>開始</Text>
          <Text style={styles.timeRowEmpty}>-- : --</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeRowLabel}>終了</Text>
          <Text style={styles.timeRowEmpty}>-- : --</Text>
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
  subText: {
    fontSize: 12,
    color: '#888',
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
  trainOption: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainSelected: {
    borderColor: '#185FA5',
    borderWidth: 1.5,
    backgroundColor: '#E6F1FB',
  },
  trainDep: {
    fontSize: 14,
    fontWeight: '500',
  },
  trainArr: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  trainBadge: {
    backgroundColor: '#E6F1FB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trainBadgeText: {
    fontSize: 11,
    color: '#185FA5',
  },
  trainBadgeSelected: {
    backgroundColor: '#185FA5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trainBadgeTextSelected: {
    fontSize: 11,
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  timeRowLabel: {
    fontSize: 13,
    color: '#666',
  },
  timeRowEmpty: {
    fontSize: 14,
    color: '#bbb',
  },
});