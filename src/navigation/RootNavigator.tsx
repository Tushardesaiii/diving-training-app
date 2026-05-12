import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { RootStackParamList, MainTabParamList } from '../types/app';
import { AppBootstrapState } from '../hooks/useAppBootstrap';

// Screens
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PersonalBestSetupScreen } from '../screens/setup/PersonalBestSetupScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TrainingTableScreen } from '../screens/training/TrainingTableScreen';
import { SessionScreen } from '../screens/training/SessionScreen';
import { PersonalizedPlanScreen } from '../screens/training/PersonalizedPlanScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

import { Home, Activity, Calendar, Clock, Settings as SettingsIcon } from 'lucide-react-native';

import { IndustryNavbar } from '../components/IndustryNavbar';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Main tabs ────────────────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <IndustryNavbar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Training" component={TrainingTableScreen} />
      <Tab.Screen name="Plan" component={PersonalizedPlanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

interface RootNavigatorProps {
  bootstrap: AppBootstrapState;
}

export function RootNavigator({ bootstrap }: RootNavigatorProps) {
  const { onboardingDone } = bootstrap;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        {!onboardingDone ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="PersonalBestSetup"
              component={PersonalBestSetupScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : null}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
        {onboardingDone ? (
          <Stack.Screen
            name="PersonalBestSetup"
            component={PersonalBestSetupScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

