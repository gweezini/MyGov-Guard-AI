import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LanguageContext } from './_layout'; 

/**
 * The Dashboard (Home) Screen.
 * Fully integrated with LanguageContext and real-time scan stats.
 */
export default function HomeScreen() {
  const { t } = useContext(LanguageContext);
  
  const [stats, setStats] = useState({ total: 0, scams: 0 });
  const [userName, setUserName] = useState('User'); 
  const isFocused = useIsFocused(); 

  // Refresh data whenever user navigates back to Home tab
  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused]);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch live scan history stats
      const historyData = await AsyncStorage.getItem('user_history');
      if (historyData) {
        const history = JSON.parse(historyData);
        setStats({
          total: history.length,
          scams: history.filter((item: any) => item.status === 'scam').length
        });
      }

      // 2. Fetch user name from Profile settings
      const savedName = await AsyncStorage.getItem('user_name');
      if (savedName) setUserName(savedName);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Header */}
      <View style={styles.headerArea}>
        <View style={styles.topRow}>
          <View style={styles.logoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <Text style={styles.brandName}>MyGov-Guard AI</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications" size={22} color="white" />
          </TouchableOpacity>
        </View>

  
        <Text style={styles.welcomeText}>{t.welcome}</Text>
        <Text style={styles.userName}>{userName} 👋</Text>

        <View style={styles.activeShield}>
          <View style={styles.pulseDot} />
  
          <Text style={styles.shieldStatus}>{t.shieldActive}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* AI Insight Card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>⚡ AI INSIGHT — LIVE UPDATES</Text>
  
          <Text style={styles.insightTitle}>{t.secPerformance}</Text>
  
          <Text style={styles.insightDesc}>{t.aiInsight}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              {/* 🌟 使用翻译：Scanned */}
              <Text style={styles.statLabel}>{t.scanned}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats.scams}</Text>
              {/* 🌟 使用翻译：Blocked */}
              <Text style={styles.statLabel}>{t.blocked}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>98%</Text>
              {/* 🌟 使用翻译：Accuracy */}
              <Text style={styles.statLabel}>{t.accuracy}</Text>
            </View>
          </View>
        </View>


        <Text style={styles.sectionHeader}>{t.quickGuide}</Text>
        <View style={styles.guideCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.guideText}>{t.guideDesc}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerArea: { backgroundColor: '#0A1220', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 35, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  logoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  brandName: { color: 'white', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  notifBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 50 },
  welcomeText: { color: '#8E8E93', fontSize: 16 },
  userName: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  activeShield: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginTop: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#34C759' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', marginRight: 8 },
  shieldStatus: { color: '#34C759', fontSize: 12, fontWeight: 'bold' },
  content: { padding: 25 },
  insightCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  insightLabel: { color: '#34C759', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  insightTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  insightDesc: { color: '#8E8E93', fontSize: 13, marginTop: 8, lineHeight: 18 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#8E8E93', fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#1C1C1E' },
  guideCard: { flexDirection: 'row', backgroundColor: '#F2F2F7', padding: 20, borderRadius: 18, alignItems: 'center' },
  guideText: { flex: 1, marginLeft: 12, color: '#48484A', fontSize: 14, lineHeight: 20 }
});