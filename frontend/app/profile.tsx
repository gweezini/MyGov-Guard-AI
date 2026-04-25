import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('User'); // default as User
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);

  const loadUserData = async () => {
    const savedName = await AsyncStorage.getItem('user_name');
    if (savedName) setUserName(savedName);
  };

  const handleEditName = () => {
    Alert.prompt(
      "Update Profile",
      "Please enter your name:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Save", 
          onPress: async (newName?: string) => {
            if (newName && newName.trim() !== "") {
              await AsyncStorage.setItem('user_name', newName);
              setUserName(newName);
              Alert.alert("Success", "Profile name updated!");
            }
          }
        }
      ],
      "plain-text",
      userName
    );
  };

  return (
    <ScrollView style={styles.container}>
        
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="white" />
        </View>
        
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={handleEditName}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.editHint}>Tap to edit profile name ✏️</Text>
        </TouchableOpacity>

        <Text style={styles.userRole}>UTM Computing Student • Verified</Text>
        
        <View style={styles.shieldBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#34C759" />
          <Text style={styles.shieldText}>Shield Pro - Active</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" title="Edit Profile" onPress={handleEditName} />
          <MenuItem icon="notifications-outline" title="Notification settings" />
          <MenuItem icon="language-outline" title="Language" extra="English (US)" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="help-circle-outline" title="Help centre" />
          <MenuItem icon="bug-outline" title="Report a bug" />
          <MenuItem icon="information-circle-outline" title="About" extra="v1.0" />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
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
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' }
});