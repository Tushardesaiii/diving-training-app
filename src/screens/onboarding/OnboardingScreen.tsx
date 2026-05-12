import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { RootStackParamList } from '../../types/app';
import { markOnboardingDone } from '../../storage/appStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = Copy.onboarding.slides;

// Visual accents per slide
const SLIDE_ACCENTS = [
  { icon: '◎', color: Colors.primary },
  { icon: '⬡', color: Colors.accent },
  { icon: '⌚', color: '#7C5CF8' },
  { icon: '★', color: Colors.pro },
];

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}

export function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    await markOnboardingDone();
    navigation.replace('PersonalBestSetup');
  }

  function handleSkip() {
    handleFinish();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Skip */}
      {activeIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skip} onPress={handleSkip}>
          <AppText variant="bodySmall" color={Colors.textSecondary}>Skip</AppText>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => {
          const accent = SLIDE_ACCENTS[index];
          return (
            <View style={styles.slide}>
              {/* Icon accent */}
              <View style={[styles.iconContainer, { borderColor: accent.color, backgroundColor: `${accent.color}12` }]}>
                <AppText style={{ fontSize: 48, color: accent.color }}>{accent.icon}</AppText>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <AppText variant="displayMedium" align="center" style={styles.title}>
                  {item.title}
                </AppText>
                <AppText variant="bodyLarge" color={Colors.textSecondary} align="center" style={styles.body}>
                  {item.body}
                </AppText>
              </View>
            </View>
          );
        }}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? Colors.primary : Colors.border,
                  width: i === activeIndex ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        <AppButton
          label={SLIDES[activeIndex]?.cta ?? 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skip: {
    position: 'absolute',
    top: 60,
    right: Spacing.base,
    zIndex: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  content: {
    gap: Spacing.base,
  },
  title: {
    marginBottom: Spacing.md,
  },
  body: {
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  cta: {
    marginHorizontal: Spacing.sm,
  },
});
