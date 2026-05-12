import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { EXPERIENCE_LEVELS, TRAINING_MODES } from '../../constants/training';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { RootStackParamList, TrainingMode, ExperienceLevel, UserProfile } from '../../types/app';
import { parseMMSS } from '../../utils/apnea';
import { generatePersonalizedPlan } from '../../utils/apnea';
import { savePlan, saveUserProfile, addPBRecord } from '../../storage/appStorage';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

type GoalOption = { value: number; label: string; description: string };
const GOAL_OPTIONS: GoalOption[] = [...Copy.setup.goalOptions];

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PersonalBestSetup'>;
}

export function PersonalBestSetupScreen({ navigation }: Props) {
  const [pbInput, setPbInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<GoalOption>(GOAL_OPTIONS[2]);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('intermediate');
  const [selectedMode, setSelectedMode] = useState<TrainingMode>('CO2');
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    const pb = parseMMSS(pbInput);
    if (!pb || pb < 10) {
      Alert.alert('Invalid PB', 'Enter your static apnea PB in minutes:seconds (e.g., 3:30)');
      return;
    }

    setIsLoading(true);
    try {
      const profile: UserProfile = {
        staticPB: pb,
        targetImprovement: selectedGoal.value,
        experienceLevel: selectedLevel,
        preferredMode: selectedMode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const plan = generatePersonalizedPlan(pb, selectedGoal.value);
      await Promise.all([
        saveUserProfile(profile),
        savePlan(plan),
        addPBRecord({ value: pb, recordedAt: Date.now() }),
      ]);

      await hapticSuccess();
      navigation.replace('MainTabs');
    } catch {
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSkip() {
    await hapticLight();
    navigation.replace('MainTabs');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="displayMedium">{Copy.setup.title}</AppText>
            <AppText variant="body" color={Colors.textSecondary} style={styles.subtitle}>
              {Copy.setup.subtitle}
            </AppText>
          </View>

          {/* PB Input */}
          <View style={styles.section}>
            <AppText variant="label" style={styles.sectionLabel}>{Copy.setup.pbLabel}</AppText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={pbInput}
                onChangeText={setPbInput}
                placeholder="3:30"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                maxLength={7}
              />
              <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.inputUnit}>
                min:sec
              </AppText>
            </View>
          </View>

          {/* Goal selection */}
          <View style={styles.section}>
            <AppText variant="label" style={styles.sectionLabel}>{Copy.setup.goalLabel}</AppText>
            <View style={styles.goalGrid}>
              {GOAL_OPTIONS.map((option) => {
                const selected = option.value === selectedGoal.value;
                return (
                  <TouchableOpacity
                    key={String(option.value)}
                    style={[
                      styles.goalChip,
                      selected && styles.goalChipSelected,
                    ]}
                    onPress={async () => {
                      await hapticLight();
                      setSelectedGoal(option);
                    }}
                  >
                    <AppText
                      variant="h3"
                      color={selected ? Colors.primary : Colors.text}
                    >
                      {option.label}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={selected ? Colors.primary : Colors.textSecondary}
                    >
                      {option.description}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Experience level */}
          <View style={styles.section}>
            <AppText variant="label" style={styles.sectionLabel}>{Copy.setup.levelLabel}</AppText>
            <View style={styles.levelList}>
              {EXPERIENCE_LEVELS.map((level) => {
                const selected = level.value === selectedLevel;
                return (
                  <TouchableOpacity
                    key={level.value}
                    style={[styles.levelRow, selected && styles.levelRowSelected]}
                    onPress={async () => {
                      await hapticLight();
                      setSelectedLevel(level.value);
                    }}
                  >
                    <View style={styles.levelText}>
                      <AppText variant="h3" color={selected ? Colors.primary : Colors.text}>
                        {level.label}
                      </AppText>
                      <AppText variant="caption" color={Colors.textSecondary}>
                        {level.description}
                      </AppText>
                    </View>
                    {selected && (
                      <AppText variant="body" color={Colors.primary}>✓</AppText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preferred mode */}
          <View style={styles.section}>
            <AppText variant="label" style={styles.sectionLabel}>{Copy.setup.modeLabel}</AppText>
            <View style={styles.modeRow}>
              {TRAINING_MODES.map((m) => {
                const selected = m.mode === selectedMode;
                return (
                  <TouchableOpacity
                    key={m.mode}
                    style={[
                      styles.modeChip,
                      { borderColor: selected ? m.color : Colors.border },
                      selected && { backgroundColor: `${m.color}14` },
                    ]}
                    onPress={async () => {
                      await hapticLight();
                      setSelectedMode(m.mode);
                    }}
                  >
                    <AppText
                      variant="buttonSmall"
                      color={selected ? m.color : Colors.textSecondary}
                    >
                      {m.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton
              label={Copy.setup.cta}
              onPress={handleGenerate}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={pbInput.trim().length === 0}
            />
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <AppText variant="body" color={Colors.textSecondary}>{Copy.setup.skip}</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 56,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  inputUnit: {
    marginLeft: Spacing.sm,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  goalChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  levelList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
  },
  levelRowSelected: {
    backgroundColor: Colors.primaryMuted,
  },
  levelText: {
    flex: 1,
    gap: 2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeChip: {
    flex: 1,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  actions: {
    gap: Spacing.base,
    marginTop: Spacing.sm,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
