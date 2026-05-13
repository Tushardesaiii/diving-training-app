import React from 'react';
import Svg, { Path, G, Rect } from 'react-native-svg';

export function KidneyIcon({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <G stroke={color} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Central Vessels (Ureters/Arteries) */}
        <Path d="M240 16v112" />
        <Path d="M272 16v112" />
        <Path d="M240 180v300" />
        <Path d="M272 180v280" />
        
        {/* Left Kidney Shape */}
        <Path d="M190 120 C110 120 48 180 48 265 C48 350 110 410 190 410 C215 410 240 400 256 380 L256 320 L190 320" />
        {/* Left Kidney Internal Details */}
        <Path d="M120 230 A40 80 0 0 0 120 310" strokeWidth="16" />
        <Path d="M160 190 A30 60 0 0 0 160 240" strokeWidth="12" />
        
        {/* Right Kidney Shape */}
        <Path d="M322 120 C402 120 464 180 464 265 C464 350 402 410 322 410 C297 410 272 400 256 380 L256 320 L322 320" />
        {/* Right Kidney Internal Details */}
        <Path d="M392 230 A40 80 0 0 1 392 310" strokeWidth="16" />
        <Path d="M352 190 A30 60 0 0 1 352 240" strokeWidth="12" />

        {/* Connections */}
        <Path d="M190 265 H240" />
        <Path d="M322 265 H272" />
        <Path d="M190 210 Q220 210 240 240" />
        <Path d="M322 210 Q292 210 272 240" />
      </G>
      {/* Small detail dot at bottom as in image */}
      <Rect x="268" y="475" width="8" height="8" fill={color} rx="2" />
    </Svg>
  );
}
