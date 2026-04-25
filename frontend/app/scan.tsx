import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LanguageContext } from './_layout'; 
import Constants from 'expo-constants';

export default function ScanScreen() {
  const { t, lang } = useContext(LanguageContext);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  // --- Save to Local History ---
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
    } catch (error) { console.error("Storage Error:", error); }
  };

  // --- File Upload Logic ---
  const uploadFile = async (uri: string, name: string, type: string) => {
    setLoading(true);
    setResult(null);
    if (sound) { await sound.unloadAsync(); setSound(null); setPosition(0); setDuration(0); }

    const hostUri = Constants.expoConfig?.hostUri;
    const hostIp = hostUri?.split(':')[0];
    const apiUrl = hostIp ? `http://${hostIp}:8000` : 'http://localhost:8000';

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri, name, type });
    formData.append('language', lang); 

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      if (data.status === "success") {
        setResult({
          error: data.analysis.status === 'error',
          status: data.analysis.status,
          summary: data.analysis.summary,
          steps: data.analysis.steps
        });
        if (data.analysis.status !== 'error') {
          saveToHistory(data.analysis.status, data.analysis.summary, name, data.analysis.steps);
        }
      }
    } catch (error) {
      setResult({ error: true, status: 'error', summary: "⚠️ Connection Failed: Check WiFi and Backend.", steps: ["Ensure server is running"] });
    } finally { setLoading(false); }
  };

  // --- Audio Logic ---
  useEffect(() => {
    return () => { if (sound) { sound.unloadAsync(); } };
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
      setPosition(status.positionMillis || 0);

      // iOS Fix: Estimate duration for streaming if it returns 0/-1
      if (status.durationMillis && status.durationMillis > 0) {
        setDuration(status.durationMillis);
      } else if (status.positionMillis > 0 && duration === 0) {
        const estimatedDur = result?.summary ? result.summary.length * 180 : 10000;
        setDuration(estimatedDur);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (sound) {
        const status: any = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      // Load new sound
      const hostUri = Constants.expoConfig?.hostUri;
      const hostIp = hostUri?.split(':')[0];
      const apiUrl = hostIp ? `http://${hostIp}:8000` : 'http://localhost:8000';
      const ttsUrl = `${apiUrl}/tts?text=${encodeURIComponent(result.summary)}&language=${lang}`;
      
      setIsBuffering(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: ttsUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsBuffering(false);
    } catch (error) {
      console.error("Playback Error:", error);
      setIsBuffering(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setPosition(0);
      setIsPlaying(false);
    }
  };

  const onSliderValueChange = async (value: number) => {
    if (sound) { await sound.setPositionAsync(value); }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerArea}>
        <Text style={styles.title}>{t.scanTitle}</Text>
        <Text style={styles.subtitle}>{t.scanSub}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.uploadCard} onPress={async () => {
              let res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
              if (!res.canceled) uploadFile(res.assets[0].uri, "gallery.jpg", "image/jpeg");
          }}>
            <View style={styles.iconCircleBlue}><Ionicons name="images" size={28} color="#007AFF" /></View>
            <Text style={styles.cardBtnText}>{t.gallery}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.uploadCard, { backgroundColor: '#F2F2F7' }]} onPress={async () => {
              let res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
              if (!res.canceled) uploadFile(res.assets[0].uri, res.assets[0].name, "application/pdf");
          }}>
            <View style={styles.iconCirclePurple}><Ionicons name="document-text" size={28} color="#5856D6" /></View>
            <Text style={styles.cardBtnText}>{t.pdfFile}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loaderText}>{t.analyzing}</Text>
          </View>
        )}

        {result && !loading && (
          <View style={[styles.resultReport, result.status === 'scam' && styles.scamBorder]}>
            {/* 🌟 INTELLIGENT HEADER COLORS FIX */}
            <View style={[
              styles.reportHeader, 
              { backgroundColor: result.error ? '#4A4A4A' : (result.status === 'safe' ? '#34C759' : (result.status === 'warning' ? '#FF9500' : '#FF3B30')) }
            ]}>
               <Ionicons 
                  name={result.error ? "search-outline" : (result.status === 'safe' ? "checkmark-circle" : "alert-circle")} 
                  size={50} color="white" 
               />
               <Text style={styles.reportStatusText}>
                 {result.error 
                    ? (result.summary.includes("text") || result.summary.includes("文字") ? "SCAN FAILED" : "SYSTEM ERROR") 
                    : (result.status === 'safe' ? "OFFICIAL VERIFIED" : (result.status === 'warning' ? "POTENTIAL RISK" : "SCAM DETECTED"))}
               </Text>
            </View>

            <View style={styles.reportBody}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>AI ANALYSIS PLAYER</Text>
                <View style={styles.audioControls}>
                  <TouchableOpacity onPress={handlePlayPause} style={styles.speakerBtn}>
                    {isBuffering ? <ActivityIndicator size="small" /> : <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#007AFF" />}
                    <Text style={styles.speakerText}>{isPlaying ? "Pause" : "Play"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={stopSound} style={[styles.speakerBtn, { marginLeft: 8, backgroundColor: '#FFE5E5' }]}>
                    <Ionicons name="stop" size={18} color="#FF3B30" /><Text style={[styles.speakerText, { color: '#FF3B30' }]}>Stop</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration > 0 ? duration : 100}
                  value={position}
                  onSlidingComplete={onSliderValueChange}
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#F2F2F7"
                  thumbTintColor="#007AFF"
                />
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{Math.floor(position / 1000)}s</Text>
                  <Text style={styles.timeText}>{duration > 0 ? Math.floor(duration / 1000) : "--"}s</Text>
                </View>
              </View>

              <Text style={styles.summaryText}>{result.summary}</Text>

              {result.steps && result.steps.length > 0 && (
                <>
                  <View style={styles.divider} /><Text style={[styles.label, { marginTop: 20 }]}>NEXT STEPS</Text>
                  {result.steps.map((step: string, i: number) => (
                    <View key={i} style={styles.stepBox}><Text style={styles.stepNum}>{i + 1}</Text><Text style={styles.stepText}>{step}</Text></View>
                  ))}
                </>
              )}
              <TouchableOpacity style={styles.resetBtn} onPress={() => setResult(null)}><Text style={styles.resetText}>Clear and scan another</Text></TouchableOpacity>
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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  audioControls: { flexDirection: 'row', alignItems: 'center' },
  speakerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  speakerText: { fontSize: 11, fontWeight: 'bold', color: '#007AFF', marginLeft: 4 },
  sliderContainer: { marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  timeText: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold' },
  resetBtn: { marginTop: 35, padding: 10, alignItems: 'center' },
  resetText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' }
});