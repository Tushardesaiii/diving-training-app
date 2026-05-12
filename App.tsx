import React from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';

import { useAppBootstrap } from './src/hooks/useAppBootstrap';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/colors';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

export default function App() {
  const bootstrap = useAppBootstrap();

  React.useEffect(() => {
    // Configure navigation bar for Android
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(Colors.background);
      NavigationBar.setButtonStyleAsync('light');
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!bootstrap.isReady ? <LoadingScreen /> : <RootNavigator bootstrap={bootstrap} />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
