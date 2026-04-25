import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LanguageContext } from './_layout';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

type Alert = {
  id: string;
  level: string;
  time: string;
  title: string;
  desc: string;
};

export default function NotificationsScreen() {
  const { t, lang } = useContext(LanguageContext);
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [lang]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const hostUri = Constants.expoConfig?.hostUri;
      const hostIp = hostUri?.split(':')[0];
      const apiUrl = hostIp ? `http://${hostIp}:8000` : 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/alerts?lang=${lang}`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return '#FF3B30';
      case 'High': return '#FF9500';
      case 'Medium': return '#FFCC00';
      default: return '#34C759';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Critical': return 'alert-circle';
      case 'High': return 'warning';
      default: return 'information-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.notifTitle}</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>{t.notifSub}</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.notifEmpty}</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(alert.level) + '20' }]}>
                <Ionicons name={getLevelIcon(alert.level)} size={20} color={getLevelColor(alert.level)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDesc}>{alert.desc}</Text>
              </View>
              <View style={styles.alertMeta}>
                <View style={[styles.levelTag, { backgroundColor: getLevelColor(alert.level) }]}>
                  <Text style={styles.levelTagText}>{alert.level}</Text>
                </View>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  headerArea: { backgroundColor: '#0A1220', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 6 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: '#8E8E93', fontSize: 14, marginTop: 8 },
  list: { padding: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 12 },
  alertCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  levelBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertContent: { flex: 1, marginRight: 8 },
  alertTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', lineHeight: 20 },
  alertDesc: { fontSize: 13, color: '#8E8E93', marginTop: 4, lineHeight: 18 },
  alertMeta: { alignItems: 'flex-end', justifyContent: 'space-between' },
  levelTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelTagText: { color: 'white', fontSize: 10, fontWeight: '700' },
  alertTime: { color: '#8E8E93', fontSize: 11, marginTop: 6 },
});
