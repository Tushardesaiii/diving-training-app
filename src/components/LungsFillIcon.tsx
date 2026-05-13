import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function LungsFillIcon({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 1a.5.5 0 0 1 .5.5v2.302A3.504 3.504 0 0 1 11.5 7v1a.5.5 0 0 1-1 0V7a2.5 2.5 0 0 0-5 0v1a.5.5 0 0 1-1 0V7a3.504 3.504 0 0 1 3-3.198V1.5A.5.5 0 0 1 8 1ZM2.5 4.5A2.5 2.5 0 0 0 0 7v3.5c0 1.966 1.83 3.5 4 3.5h.5c.276 0 .5.224.5.5V15a.5.5 0 0 0 1 0v-1c0-.214.015-.424.043-.63A3.504 3.504 0 0 0 8 10a3.504 3.504 0 0 0 1.957 3.37c.028.206.043.416.043.63v1a.5.5 0 0 0 1 0v-.5c0-.276.224-.5.5-.5h.5c2.17 0 4-1.534 4-3.5V7a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5v2.5a.5.5 0 0 1-1 0V7A2.5 2.5 0 0 0 11 4.5h-1A2.5 2.5 0 0 0 7.5 7v2.5a.5.5 0 0 1-1 0V7A2.5 2.5 0 0 0 4 4.5h-1a2.5 2.5 0 0 0-1.5.5Z"
        fill={color}
      />
    </Svg>
  );
}
