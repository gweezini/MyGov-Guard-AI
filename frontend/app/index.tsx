import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function ScamGuardScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // --- 1. Unified Upload Function (Handled by both buttons) ---
  const uploadFile = async (uri: string, name: string, type: string) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri, name, type });

    try {
      // Use your current Hotspot IP!
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:8000';
      
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      
      // Target the 'analysis' object from backend
      if (data.analysis) {
        setResult(data.analysis);
      } else {
        setResult(data); 
      }
    } catch (error) {
      console.error(error);
      // Friendly alert for common hackathon network issues
      Alert.alert("Connection Error", "Is backend running? Is Firewall OFF?");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Action: Pick from Gallery ---
  const pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const asset = pickerResult.assets[0];
      uploadFile(asset.uri, asset.fileName || "image.jpg", "image/jpeg");
    }
  };

  // --- 3. Action: Pick PDF Document ---
  const pickDocument = async () => {
    let docResult = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!docResult.canceled) {
      const asset = docResult.assets[0];
      uploadFile(asset.uri, asset.name, "application/pdf");
    }
  };

  // --- UI Logic: Handle 3 states (Safe, Scam, Error) ---
  const isScam = result?.status === 'scam';
  const isError = result?.status === 'error';

  return (
    <ScrollView style={[styles.container, isScam && styles.scamContainer]}>
      <View style={styles.content}>
        <Text style={styles.header}>🛡️ MyGov-Guard AI</Text>
        <Text style={styles.subHeader}>Malaysia's First Security Gateway</Text>

        {/* --- THE TWO BUTTONS YOU WANTED --- */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Text style={styles.btnText}>📸 Photo/Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#6c757d'}]} onPress={pickDocument}>
            <Text style={styles.btnText}>📄 Upload PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Spinner */}
        {loading && <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 40}} />}

        {/* Results Card */}
        {result && !loading && (
          <View style={styles.resultCard}>
            <Text style={[
              styles.statusTitle, 
              isScam ? styles.redText : 
              isError ? styles.orangeText : styles.greenText
            ]}>
              {isScam ? "⚠️ WARNING: SCAM DETECTED" : 
               isError ? "❌ PROCESSING ERROR" : "✅ OFFICIAL VERIFIED"}
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionLabel}>Summary (What it is):</Text>
            <Text style={styles.bodyText}>{result.summary}</Text>

            <Text style={styles.sectionLabel}>Recommended Actions:</Text>
            {result.steps?.map((step: string, index: number) => (
              <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
            ))}

            {result.official_links?.length > 0 && (
              <View style={{marginTop: 10}}>
                <Text style={styles.sectionLabel}>Safe Official Links:</Text>
                {result.official_links.map((link: string, i: number) => (
                  <Text key={i} style={styles.linkText}>{link}</Text>
                ))}
              </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity 
              style={{marginTop: 20, alignItems: 'center'}} 
              onPress={() => setResult(null)}
            >
              <Text style={{color: '#6c757d', fontSize: 12}}>Clear result and try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scamContainer: { backgroundColor: '#FFDADA' }, // Red tint for scam warning
  content: { padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#212529', textAlign: 'center' },
  subHeader: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginBottom: 30 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, flex: 0.48, alignItems: 'center', elevation: 2 },
  btnText: { color: '#fff', fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.1, shadowRadius:4 },
  statusTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  redText: { color: '#DC3545' },
  greenText: { color: '#28A745' },
  orangeText: { color: '#FF9500' }, // Orange for Timeout/Error
  divider: { height: 1, backgroundColor: '#E9ECEF', marginBottom: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#495057', marginTop: 10, marginBottom: 5 },
  bodyText: { fontSize: 15, color: '#343A40', lineHeight: 22 },
  stepText: { fontSize: 14, color: '#495057', marginTop: 4, paddingLeft: 5 },
  linkText: { color: '#007AFF', textDecorationLine: 'underline', marginTop: 5 }
});