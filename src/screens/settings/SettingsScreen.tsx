import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronRight, 
  Crown, 
  Smartphone, 
  Volume2, 
  Target, 
  Globe, 
  Moon, 
  MessageCircle 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { AppText } from '../../components/AppText';

import { IndustryUpperbar } from '../../components/IndustryUpperbar';

export function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={styles.container}>
      <IndustryUpperbar title="Settings" />
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile */}
          <TouchableOpacity style={styles.profileRow}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1544551763-47a012953281?w=400&q=80' }} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <AppText variant="h4">Diver</AppText>
              <AppText variant="caption" color={Colors.textSecondary}>diver@example.com</AppText>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Pro Card */}
          <View style={styles.proCard}>
            <View style={styles.proHeader}>
              <Crown size={20} color={Colors.pro} />
              <AppText variant="h4" style={{ marginLeft: 8 }}>Apnea Freediving Pro</AppText>
            </View>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.proSubtitle}>
              Unlock all features and personalized plans
            </AppText>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFB800', '#FF8A00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proBtn}
              >
                <AppText variant="h4" color={Colors.textInverse}>Upgrade to Pro</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.sectionTitle}>Preferences</AppText>
            
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Smartphone size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Haptic Feedback</AppText>
              </View>
              <Switch 
                value={haptics} 
                onValueChange={setHaptics}
                trackColor={{ false: '#1A2333', true: '#10E5C8' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Volume2 size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Sound Cues</AppText>
              </View>
              <Switch 
                value={sound} 
                onValueChange={setSound}
                trackColor={{ false: '#1A2333', true: '#10E5C8' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <Target size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Default Training Mode</AppText>
              </View>
              <View style={styles.rowRight}>
                <AppText variant="bodySmall" color={Colors.textSecondary}>CO₂ Table</AppText>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <Globe size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Units</AppText>
              </View>
              <View style={styles.rowRight}>
                <AppText variant="bodySmall" color={Colors.textSecondary}>Metric</AppText>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Moon size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Dark Mode</AppText>
              </View>
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: '#1A2333', true: '#10E5C8' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.sectionTitle}>Support</AppText>
            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <MessageCircle size={20} color={Colors.textSecondary} />
                <AppText variant="body" style={styles.rowLabel}>Help & Feedback</AppText>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceHighlight,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  proCard: {
    padding: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    marginBottom: 30,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proSubtitle: {
    marginBottom: 20,
  },
  proBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderMuted,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    marginLeft: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
