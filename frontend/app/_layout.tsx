import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007AFF', 
      headerShown: false, 
      tabBarStyle: { height: 60, paddingBottom: 10 } 
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
      }} />
      <Tabs.Screen name="scan" options={{
        title: 'Scan',
        tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
      }} />
      <Tabs.Screen name="history" options={{
        title: 'History',
        tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
      }} />
    </Tabs>
  );
}