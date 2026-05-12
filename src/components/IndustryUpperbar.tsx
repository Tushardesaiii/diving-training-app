import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { AppText } from './AppText';

interface IndustryUpperbarProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export function IndustryUpperbar({ title, onBack, rightIcon, onRightPress }: IndustryUpperbarProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.content}>
          <View style={styles.left}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ChevronLeft size={24} color={Colors.text} />
              </TouchableOpacity>
            )}
          </View>
          
          <AppText variant="h3" style={styles.title}>{title}</AppText>
          
          <View style={styles.right}>
            {rightIcon ? (
              <TouchableOpacity onPress={onRightPress}>
                {rightIcon}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <MoreVertical size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(1, 6, 13, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    width: 40,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  backBtn: {
    marginLeft: -8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
