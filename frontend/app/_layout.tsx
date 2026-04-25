import React, { createContext, useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Dictionary: Integrated All Translations
 * Includes: Navigation, Home, Scan, History, and Profile screens.
 */
export const translations = {
  en: {
    // Navigation Tabs
    home: "Home", scan: "Scan", history: "History", profile: "Profile",
    
    // Quick Scan Page
    scanTitle: "Quick Scan",
    scanSub: "AI-powered document verification",
    gallery: "Gallery",
    pdfFile: "PDF File",
    analyzing: "AI is analyzing your document...",
    
    // Home Page
    welcome: "Welcome,",
    shieldActive: "Shield active — no threats detected",
    secPerformance: "Security Performance",
    aiInsight: "AI has analyzed your local documents. Here is your current protection status.",
    scanned: "SCANNED",
    blocked: "BLOCKED",
    accuracy: "ACCURACY",
    quickGuide: "Quick Guide",
    guideDesc: "Navigate to the Scan tab to verify official letters or notices instantly.",
    
    // History Page
    historyTitle: "Scan History",
    historySub: "A complete log of all scanned documents",
    all: "All", safe: "Safe", scam: "Scam",
    back: "Back to History",
    
    // Profile Page
    lang: "Language",
    editProfile: "Edit Profile",
    notifications: "Notification Settings",
    help: "Help Centre",
    bug: "Report a Bug",
    about: "About",
    logout: "Log out",
    account: "ACCOUNT",
    support: "SUPPORT",
    editHint: "Tap to edit profile name",
    verified: "UTM Computing Student • Verified"
  },
  ms: {
    // Navigation Tabs
    home: "Utama", scan: "Imbas", history: "Rekod", profile: "Profil",
    
    // Quick Scan Page
    scanTitle: "Imbasan Pantas",
    scanSub: "Pengesahan dokumen berkuasa AI",
    gallery: "Galeri",
    pdfFile: "Fail PDF",
    analyzing: "AI sedang menganalisis dokumen anda...",
    
    // Home Page
    welcome: "Selamat Datang,",
    shieldActive: "Perlindungan aktif — tiada ancaman dikesan",
    secPerformance: "Prestasi Keselamatan",
    aiInsight: "AI telah menganalisis dokumen tempatan anda. Ini status perlindungan semasa anda.",
    scanned: "DIIMBAS",
    blocked: "DISEKAT",
    accuracy: "KETEPATAN",
    quickGuide: "Panduan Pantas",
    guideDesc: "Pergi ke tab Imbas untuk mengesahkan surat rasmi atau notis dengan segera.",
    
    // History Page
    historyTitle: "Rekod Imbasan",
    historySub: "Log lengkap semua dokumen diimbas",
    all: "Semua", safe: "Selamat", scam: "Scam",
    back: "Kembali",
    
    // Profile Page
    lang: "Bahasa",
    editProfile: "Edit Profil",
    notifications: "Tetapan Notifikasi",
    help: "Pusat Bantuan",
    bug: "Laporkan Bug",
    about: "Mengenai Kami",
    logout: "Log Keluar",
    account: "AKAUN",
    support: "SOKONGAN",
    editHint: "Ketik untuk edit nama profil",
    verified: "Pelajar Komputer UTM • Disahkan"
  },
  zh: {
    // Navigation Tabs
    home: "首页", scan: "扫描", history: "历史", profile: "个人",
    
    // Quick Scan Page
    scanTitle: "快速扫描",
    scanSub: "AI 驱动的文档验证",
    gallery: "相册选取",
    pdfFile: "PDF 文件",
    analyzing: "AI 正在分析您的文件...",
    
    // Home Page
    welcome: "欢迎,",
    shieldActive: "防护已启动 — 未发现威胁",
    secPerformance: "安全性能概览",
    aiInsight: "AI 已分析您的本地文件。这是您当前的安全防护状态。",
    scanned: "已扫描",
    blocked: "已拦截",
    accuracy: "准确率",
    quickGuide: "快速指南",
    guideDesc: "前往“扫描”页面，即刻验证官方信函或通知的真伪。",
    
    // History Page
    historyTitle: "扫描历史",
    historySub: "您所有扫描文件的完整记录",
    all: "全部", safe: "安全", scam: "诈骗",
    back: "返回历史",
    
    // Profile Page
    lang: "语言选择",
    editProfile: "编辑资料",
    notifications: "通知设置",
    help: "帮助中心",
    bug: "反馈问题",
    about: "关于我们",
    logout: "退出登录",
    account: "账号设置",
    support: "支持与反馈",
    editHint: "点击编辑姓名",
    verified: "UTM 计算学院学生 • 已认证"
  }
};

/**
 * Create Language Context
 * This allows all screens to "listen" to language changes.
 */
export const LanguageContext = createContext<any>(null);

export default function TabLayout() {
  const [lang, setLang] = useState('en');

  // Initialize: Load saved language preference from local storage
  useEffect(() => {
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem('user_language');
      if (saved) setLang(saved);
    };
    loadLang();
  }, []);

  // Function to change language and save to storage
  const changeLanguage = async (newLang: string) => {
    setLang(newLang);
    await AsyncStorage.setItem('user_language', newLang);
  };

  // Get current translation package based on state
  const t = translations[lang as keyof typeof translations];

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#007AFF', 
        headerShown: false, 
        tabBarStyle: { height: 60, paddingBottom: 10 } 
      }}>
        <Tabs.Screen name="index" options={{
          title: t.home,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }} />
        <Tabs.Screen name="scan" options={{
          title: t.scan,
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
        }} />
        <Tabs.Screen name="history" options={{
          title: t.history,
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }} />
        <Tabs.Screen name="profile" options={{
          title: t.profile,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }} />
      </Tabs>
    </LanguageContext.Provider>
  );
}