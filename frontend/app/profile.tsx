import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LanguageContext } from './_layout'; 

export default function ProfileScreen() {
  const { lang, changeLanguage, t } = useContext(LanguageContext);
  
  const [userName, setUserName] = useState('User'); 
  const [isEditing, setIsEditing] = useState(false); // State to toggle editing mode
  const [tempName, setTempName] = useState(''); // Temporary state for typing
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);

  const loadUserData = async () => {
    const savedName = await AsyncStorage.getItem('user_name');
    if (savedName) {
      setUserName(savedName);
      setTempName(savedName);
    }
  };

  /**
   * Universal Name Editing
   * iOS: Keep the native prompt (optional)
   * Android/Web: Inline editing for better compatibility
   */
  const handleEditName = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        t.editProfile,
        t.editHint,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: (newName?: string) => {
              if (newName && newName.trim() !== "") saveNameToStorage(newName);
            }
          }
        ],
        "plain-text",
        userName
      );
    } else {
      // 🌟 Trigger inline input for Android & Web
      setTempName(userName);
      setIsEditing(true);
    }
  };

  const saveNameToStorage = async (name: string) => {
    if (!name || name.trim() === "") {
      setIsEditing(false);
      return;
    }
    try {
      await AsyncStorage.setItem('user_name', name);
      setUserName(name);
      setIsEditing(false); // Exit editing mode
      if (Platform.OS !== 'web') {
        Alert.alert("Success", "Profile name updated!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="white" />
        </View>
        
        {/* 🌟 Conditional Rendering for Android/Web Input */}
        <View style={{ alignItems: 'center', width: '100%' }}>
          {isEditing ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.nameInput}
                value={tempName}
                onChangeText={setTempName}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={() => saveNameToStorage(tempName)}
              />
              <TouchableOpacity onPress={() => saveNameToStorage(tempName)} style={styles.saveBtn}>
                <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close-circle" size={32} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={{ alignItems: 'center' }} onPress={handleEditName}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.editHint}>{t.editHint} ✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.userRole}>{t.verified}</Text>
        <View style={styles.shieldBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.shieldText}>Shield Pro - Active</Text>
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.account}</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="person-outline" 
            title={t.editProfile} 
            onPress={handleEditName} 
          />
          <View style={styles.languageContainer}>
            <View style={styles.menuLeft}>
              <Ionicons name="language-outline" size={22} color="#48484A" />
              <Text style={styles.menuTitle}>{t.lang}</Text>
            </View>
            <View style={styles.langButtonGroup}>
              {['en', 'ms', 'zh'].map((code) => (
                <TouchableOpacity 
                  key={code}
                  onPress={() => changeLanguage(code)}
                  style={[styles.langOption, lang === code && styles.activeLangOption]}
                >
                  <Text style={[styles.langOptionText, lang === code && styles.activeLangText]}>
                    {code === 'en' ? 'EN' : code === 'ms' ? 'MS' : '中文'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.support}</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="help-circle-outline" title={t.help} />
          <MenuItem icon="bug-outline" title={t.bug} />
          <MenuItem icon="information-circle-outline" title={t.about} extra="v1.0" />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>{t.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const MenuItem = ({ icon, title, extra, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon} size={22} color="#48484A" />
      <Text style={styles.menuTitle}>{title}</Text>
    </View>
    <View style={styles.menuRight}>
      {extra && <Text style={styles.extraText}>{extra}</Text>}
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerCard: { backgroundColor: '#0A1220', alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { marginBottom: 10 },
  userName: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  editHint: { color: '#007AFF', fontSize: 12, marginTop: 4, fontWeight: '600' },
  
  //  New Styles for Inline Editing
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, paddingHorizontal: 15, marginTop: 5 },
  nameInput: { color: 'white', fontSize: 22, fontWeight: 'bold', minWidth: 150, paddingVertical: 10, textAlign: 'center' },
  saveBtn: { marginHorizontal: 10 },

  userRole: { color: '#8E8E93', fontSize: 14, marginTop: 10 },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: '#34C759' },
  shieldText: { color: '#34C759', fontSize: 12, fontWeight: '600', marginLeft: 5 },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 13, color: '#8E8E93', marginBottom: 8, marginLeft: 5 },
  menuCard: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 16, color: '#1C1C1E', marginLeft: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  extraText: { color: '#8E8E93', fontSize: 14, marginRight: 5 },
  logoutBtn: { margin: 25, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF3B30' },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  languageContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  langButtonGroup: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 2 },
  langOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  activeLangOption: { backgroundColor: '#0A1220' },
  langOptionText: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93' },
  activeLangText: { color: 'white' }
});