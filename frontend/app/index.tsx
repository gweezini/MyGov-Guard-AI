import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function ScamGuardScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadFile = async (uri: string, name: string, type: string) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri, name, type });

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:8000';
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();
      
      if (data.status === "success") {
  
        setResult({
          error: data.analysis.status === 'error',
          status: data.analysis.status, // "safe" (official) or "scam"
          summary: data.analysis.summary,
          steps: data.analysis.steps
        });
      } else {
        // ❌ BACKEND ERROR CASE (e.g. 504 Timeout)
        setResult({
          error: true, // Mark as system error
          summary: data.error || "AI server timeout, please try a shorter document.",
          steps: ["Try a smaller screenshot.", "Check your internet connection."]
        });
      }
    } catch (error) {
      // ❌ NETWORK FAILED CASE
      setResult({
        error: true,
        summary: "Connection Failed. Backend might be offline.",
        steps: ["Check IPv4 in .env", "Turn off Windows Firewall"]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, result?.status === 'scam' && styles.scamContainer]}>
      <View style={styles.content}>
        <Text style={styles.header}>🛡️ MyGov-Guard AI</Text>
        <Text style={styles.subHeader}>Malaysia's First Security Gateway</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={async () => {
            let res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
            if (!res.canceled) uploadFile(res.assets[0].uri, "image.jpg", "image/jpeg");
          }}>
            <Text style={styles.btnText}>📸 Photo/Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#6c757d'}]} onPress={async () => {
            let res = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
            if (!res.canceled) uploadFile(res.assets[0].uri, res.assets[0].name, "application/pdf");
          }}>
            <Text style={styles.btnText}>📄 Upload PDF</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 40}} />}

        {result && !loading && (
          <View style={styles.resultCard}>
            
            {/* CORE FIX: Separating Error UI from Result UI */}
            {result.error ? (
              <Text style={[styles.statusTitle, {color: '#FD7E14'}]}>
                ❌ PROCESSING ERROR
              </Text>
            ) : (
              <Text style={[
                styles.statusTitle,
                result.status === 'safe' ? styles.greenText : styles.redText
              ]}>
                {result.status === 'safe' ? "✅ OFFICIAL VERIFIED" : "⚠️ WARNING: SCAM DETECTED"}
              </Text>
            )}

            <View style={styles.divider} />
            
            <Text style={styles.sectionLabel}>Summary:</Text>
            <Text style={styles.bodyText}>{result.summary}</Text>

            <Text style={styles.sectionLabel}>Recommended Actions:</Text>
            {result.steps && result.steps.length > 0 ? (
              result.steps.map((step: string, i: number) => (
                <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
              ))
            ) : (
              <Text style={styles.stepText}>No steps provided.</Text>
            )}

            <TouchableOpacity style={styles.clearBtn} onPress={() => setResult(null)}>
              <Text style={styles.clearBtnText}>Clear and try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scamContainer: { backgroundColor: '#FFDADA' },
  content: { padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#212529', textAlign: 'center' },
  subHeader: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginBottom: 30 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, flex: 0.48, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  redText: { color: '#DC3545' },
  greenText: { color: '#28A745' },
  divider: { height: 1, backgroundColor: '#E9ECEF', marginBottom: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#495057', marginTop: 10, marginBottom: 5 },
  bodyText: { fontSize: 15, color: '#343A40', lineHeight: 22 },
  stepText: { fontSize: 14, color: '#495057', marginTop: 4, paddingLeft: 5 },
  clearBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  clearBtnText: { color: '#6c757d', fontSize: 12, textDecorationLine: 'underline' }
});