import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function LungsIcon({ size = 24, color = '#00D1FF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2v10M12 22v-4M12 18H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4M12 18h4a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4h-4M7 12h2M15 12h2" />
    </Svg>
  );
}
