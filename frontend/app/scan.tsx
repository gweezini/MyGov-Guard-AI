import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
// Import LanguageContext to support multi-language and get the current 'lang'
import { LanguageContext } from './_layout'; 

/**
 * Scan Screen Component
 * Handles file uploads and AI analysis with cross-platform alert fixes.
 */
export default function ScanScreen() {
  // Access global language state
  const { t, lang } = useContext(LanguageContext);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  /**
   * Universal Alert Function
   * FIXED: This replaces the problematic prompt/alert logic to prevent PC/Android crashes.
   */
  const showUniversalAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // Use browser alert for PC
      window.alert(`${title}: ${message}`);
    } else {
      // Use native alert for mobile
      Alert.alert(title, message);
    }
  };

  /**
   * Save scan result to history
   */
  const saveToHistory = async (status: string, summary: string, fileName: string, steps: string[]) => {
    try {
      const existingData = await AsyncStorage.getItem('user_history');
      const history = existingData ? JSON.parse(existingData) : [];

      const newRecord = {
        id: Date.now().toString(),
        title: fileName,
        date: new Date().toISOString(), 
        status: status,
        summary: summary,
        steps: steps, 
      };

      await AsyncStorage.setItem('user_history', JSON.stringify([newRecord, ...history]));
    } catch (error) {
      console.error("Storage Error:", error);
    }
  };

  /**
   * Upload File to Backend
   */
  const uploadFile = async (uri: string, name: string, type: string) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri, name, type });
    // Send current language to AI backend
    formData.append('language', lang); 

    try {
      const apiUrl = 'http://172.20.10.2:8000'; 
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data' 
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult({
          error: data.analysis.status === 'error',
          status: data.analysis.status,
          summary: data.analysis.summary,
          steps: data.analysis.steps
        });

        saveToHistory(data.analysis.status, data.analysis.summary, name, data.analysis.steps);
      } else {
        throw new Error("Server Error");
      }
    } catch (error) {
      // FIXED: Using universal alert instead of direct Alert.alert to avoid crashes
      showUniversalAlert("Connection Failed", "Unable to reach the AI server.");
      setResult({
        error: true,
        status: 'error',
        summary: "Connection timeout. Ensure the backend is running.",
        steps: ["Check backend terminal", "Verify local IP address"]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dynamic Header */}
      <View style={styles.headerArea}>
        <Text style={styles.title}>{t.scanTitle}</Text>
        <Text style={styles.subtitle}>{t.scanSub}</Text>
      </View>

      <View style={styles.content}>
        {/* Upload Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.uploadCard} 
            onPress={async () => {
              let res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
              if (!res.canceled) uploadFile(res.assets[0].uri, "gallery_photo.jpg", "image/jpeg");
            }}
          >
            <View style={styles.iconCircleBlue}>
              <Ionicons name="images" size={28} color="#007AFF" />
            </View>
            <Text style={styles.cardBtnText}>{t.gallery}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.uploadCard, { backgroundColor: '#F2F2F7' }]} 
            onPress={async () => {
              let res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
              if (!res.canceled) uploadFile(res.assets[0].uri, res.assets[0].name, "application/pdf");
            }}
          >
            <View style={styles.iconCirclePurple}>
              <Ionicons name="document-text" size={28} color="#5856D6" />
            </View>
            <Text style={styles.cardBtnText}>{t.pdfFile}</Text>
          </TouchableOpacity>
        </View>

        {/* Loading UI */}
        {loading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loaderText}>{t.analyzing}</Text>
          </View>
        )}

        {/* AI Result Card */}
        {result && !loading && (
          <View style={[styles.resultReport, result.status === 'scam' && styles.scamBorder]}>
            <View style={[styles.reportHeader, { backgroundColor: result.status === 'safe' ? '#34C759' : '#FF3B30' }]}>
               <Ionicons name={result.status === 'safe' ? "checkmark-circle" : "alert-circle"} size={50} color="white" />
               <Text style={styles.reportStatusText}>
                 {result.error ? "SYSTEM ERROR" : (result.status === 'safe' ? "OFFICIAL VERIFIED" : "SCAM DETECTED")}
               </Text>
            </View>

            <View style={styles.reportBody}>
              <Text style={styles.label}>AI SUMMARY</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>

              {result.steps && result.steps.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.label, { marginTop: 20 }]}>NEXT STEPS</Text>
                  {result.steps.map((step: string, i: number) => (
                    <View key={i} style={styles.stepBox}>
                       <Text style={styles.stepNum}>{i + 1}</Text>
                       <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </>
              )}
              
              <TouchableOpacity style={styles.resetBtn} onPress={() => setResult(null)}>
                <Text style={styles.resetText}>Clear and scan another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerArea: { backgroundColor: '#0A1220', padding: 30, paddingTop: 60, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 10 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#8E8E93', marginTop: 6, fontSize: 14 },
  content: { padding: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  uploadCard: { flex: 0.48, backgroundColor: '#EBF5FF', padding: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconCircleBlue: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconCirclePurple: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardBtnText: { fontWeight: 'bold', color: '#1C1C1E', fontSize: 13 },
  loaderBox: { marginTop: 40, alignItems: 'center' },
  loaderText: { marginTop: 15, color: '#8E8E93', fontSize: 14 },
  resultReport: { backgroundColor: '#FFFFFF', borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, overflow: 'hidden', marginTop: 10 },
  scamBorder: { borderWidth: 2, borderColor: '#FF3B30' },
  reportHeader: { paddingVertical: 35, alignItems: 'center' },
  reportStatusText: { color: 'white', fontSize: 20, fontWeight: '900', marginTop: 12, letterSpacing: 0.5 },
  reportBody: { padding: 25 },
  label: { fontSize: 11, fontWeight: '900', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  summaryText: { fontSize: 15, color: '#1C1C1E', lineHeight: 24, marginBottom: 5, textAlign: 'left' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginTop: 20 },
  stepBox: { flexDirection: 'row', marginTop: 16, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F2F2F7', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: 'bold', color: '#0A1220', marginRight: 12 },
  stepText: { flex: 1, fontSize: 14, color: '#48484A', lineHeight: 22 },
  resetBtn: { marginTop: 35, padding: 10, alignItems: 'center' },
  resetText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' }
});