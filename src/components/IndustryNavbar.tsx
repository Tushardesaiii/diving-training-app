import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Activity, Calendar, Clock, Settings as SettingsIcon } from 'lucide-react-native';
import { KidneyIcon } from './KidneyIcon';
import { Colors } from '../constants/colors';
import { AppText } from './AppText';

export function IndustryNavbar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = () => {
            const color = isFocused ? Colors.primary : Colors.textTertiary;
            const size = 22;
            switch (route.name) {
              case 'Home': return <Home size={size} color={color} />;
              case 'Training': return <KidneyIcon size={size} color={color} />;
              case 'Plan': return <Calendar size={size} color={color} />;
              case 'History': return <Clock size={size} color={color} />;
              case 'Settings': return <SettingsIcon size={size} color={color} />;
              default: return <Home size={size} color={color} />;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                <Icon />
              </View>
              <AppText 
                variant="label" 
                style={[styles.label, { color: isFocused ? Colors.primary : Colors.textTertiary }]}
              >
                {route.name}
              </AppText>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(1, 6, 13, 0.95)',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: -6,
  }
});
