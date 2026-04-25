import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LanguageContext } from './_layout'; 

/**
 * History Screen Component
 * - Fixed: 'Warning' grouped under 'Scam' for consistent statistics.
 * - Added: Clear All History function with a red trash icon.
 */
export default function HistoryScreen() {
  const { t } = useContext(LanguageContext);
  
  const [fullHistory, setFullHistory] = useState([]); 
  const [displayHistory, setDisplayHistory] = useState([]); 
  const [filter, setFilter] = useState('All'); 
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isFocused = useIsFocused();

  /**
   * 🌟 Stats Logic: Syncs 'Scam' and 'Warning' together
   */
  const stats = {
    total: fullHistory.length,
    safe: fullHistory.filter((item: any) => item.status === 'safe').length,
    scam: fullHistory.filter((item: any) => item.status === 'scam' || item.status === 'warning').length,
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      const recordDate = new Date(dateString);
      const today = new Date();
      if (recordDate.toDateString() === today.toDateString()) return "Today";
      return recordDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch (e) { return dateString; }
  };

  /**
   * Load Data from Local Storage
   */
  const getHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('user_history');
      if (data) {
        const parsed = JSON.parse(data);
        setFullHistory(parsed);
        setDisplayHistory(parsed);
      } else {
        setFullHistory([]);
        setDisplayHistory([]);
      }
    } catch (error) { console.error("History Load Error:", error); }
  };

  useEffect(() => {
    if (isFocused) getHistory();
  }, [isFocused]);

  /**
   * 🌟 Filtering Logic: Includes 'Warning' under the 'Scam' tab
   */
  useEffect(() => {
    if (filter === 'All') {
      setDisplayHistory(fullHistory);
    } else if (filter === 'Scam') {
      const filtered = fullHistory.filter((item: any) => 
        item.status === 'scam' || item.status === 'warning'
      );
      setDisplayHistory(filtered);
    } else {
      const filtered = fullHistory.filter((item: any) => item.status === filter.toLowerCase());
      setDisplayHistory(filtered);
    }
  }, [filter, fullHistory]);

  /**
   * 🌟 NEW: Clear All History with Confirmation Alert
   */
  const handleClearHistory = () => {
    Alert.alert(
      t.historyTitle,
      "Delete all scan history? This action cannot be reversed.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('user_history');
            setFullHistory([]);
            setDisplayHistory([]);
            setFilter('All');
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Area with Trash Icon */}
      <View style={styles.headerArea}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.title}>{t.historyTitle}</Text>
            <Text style={styles.headerSubtitle}>{t.historySub}</Text>
          </View>
          
          {/* Only show trash icon if there's history to delete */}
          {fullHistory.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.trashBtn}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentBody}>
        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {['All', 'Safe', 'Scam'].map((type) => {
            const label = type === 'All' ? t.all : (type === 'Safe' ? t.safe : t.scam);
            const count = type === 'All' ? stats.total : (type === 'Safe' ? stats.safe : stats.scam);
            return (
              <TouchableOpacity 
                key={type}
                onPress={() => setFilter(type)}
                style={[styles.whiteChip, filter === type && styles.activeWhiteChip]}
              >
                <Text style={[styles.whiteChipText, filter === type && styles.activeWhiteChipText]}>
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={displayHistory}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>{t.all} {t.historyTitle} (0)</Text>}
          renderItem={({ item }: any) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconCircle, { backgroundColor: item.status === 'safe' ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Ionicons 
                    name={item.status === 'safe' ? "shield-checkmark" : "warning"} 
                    size={18} 
                    color={item.status === 'safe' ? "#34C759" : "#FF3B30"} 
                  />
                </View>
                <View style={styles.titleArea}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardDate}>{formatDisplayDate(item.date)}</Text>
                </View>
                
                <View style={[styles.miniBadge, { backgroundColor: item.status === 'safe' ? '#E8F5E9' : '#FFEBEE' }]}>
                   <Text style={[styles.miniBadgeText, { color: item.status === 'safe' ? '#34C759' : '#FF3B30' }]}>
                      {item.status === 'safe' ? t.safe.toUpperCase() : (item.status === 'warning' ? "WARNING" : t.scam.toUpperCase())}
                   </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#C7C7CC" style={{marginLeft: 8}} />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Detail Modal connected to full language context */}
      <Modal animationType="slide" transparent={true} visible={selectedItem !== null} onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalOverlay}>
          {selectedItem && (
            <View style={styles.modalContent}>
               <View style={[styles.modalHeader, { backgroundColor: selectedItem.status === 'safe' ? '#34C759' : (selectedItem.status === 'warning' ? '#FF9500' : '#FF3B30') }]}>
                 <Ionicons name={selectedItem.status === 'safe' ? "checkmark-circle" : "alert-circle"} size={60} color="white" />
                 <Text style={styles.modalStatusText}>
                    {selectedItem.status === 'safe' ? "OFFICIAL VERIFIED" : (selectedItem.status === 'warning' ? "POTENTIAL RISK" : "SCAM DETECTED")}
                 </Text>
               </View>
               <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                 <Text style={styles.modalLabel}>FILE NAME</Text>
                 <Text style={styles.modalFileName}>{selectedItem.title}</Text>
                 <View style={styles.divider} />
                 <Text style={styles.modalLabel}>AI SUMMARY</Text>
                 <Text style={styles.modalSummary}>{selectedItem.summary}</Text>
                 
                 {selectedItem.steps && selectedItem.steps.length > 0 && (
                   <>
                     <View style={[styles.divider, { marginTop: 25 }]} />
                     <Text style={styles.modalLabel}>NEXT STEPS</Text>
                     {selectedItem.steps.map((step: string, i: number) => (
                       <View key={i} style={styles.stepBox}>
                          <Text style={styles.stepNum}>{i + 1}</Text>
                          <Text style={styles.stepText}>{step}</Text>
                       </View>
                     ))}
                   </>
                 )}
               </ScrollView>
               <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedItem(null)}>
                  <Text style={styles.closeBtnText}>{t.back}</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerArea: { backgroundColor: '#0A1220', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { color: '#8E8E93', fontSize: 13, marginTop: 8, lineHeight: 18 },
  trashBtn: { padding: 8, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 10 },
  contentBody: { flex: 1, paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 25, marginBottom: 15 },
  whiteChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  activeWhiteChip: { backgroundColor: '#0A1220', borderColor: '#0A1220' },
  whiteChipText: { color: '#8E8E93', fontWeight: 'bold', fontSize: 13 },
  activeWhiteChipText: { color: '#FFFFFF' },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#8E8E93' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleArea: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  cardDate: { color: '#8E8E93', fontSize: 11, marginTop: 2 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  miniBadgeText: { fontSize: 10, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', overflow: 'hidden' },
  modalHeader: { padding: 40, alignItems: 'center' },
  modalStatusText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  modalBody: { padding: 25 },
  modalLabel: { color: '#8E8E93', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 8 },
  modalFileName: { fontSize: 16, color: '#1C1C1E', marginBottom: 20, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginBottom: 20 },
  modalSummary: { fontSize: 15, color: '#48484A', lineHeight: 24, textAlign: 'left' },
  stepBox: { flexDirection: 'row', marginTop: 15, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F2F2F7', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: 'bold', color: '#0A1220', marginRight: 10 },
  stepText: { flex: 1, fontSize: 14, color: '#48484A', lineHeight: 22, marginTop: 2 },
  closeBtn: { margin: 25, backgroundColor: '#0A1220', padding: 18, borderRadius: 15, alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});