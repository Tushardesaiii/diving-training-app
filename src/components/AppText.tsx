import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { Typography } from '../constants/typography';
import { Colors } from '../constants/colors';

type TypographyVariant = keyof typeof Typography;

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle | TextStyle[];
}

export function AppText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const baseStyle = Typography[variant] ?? Typography.body;

  return (
    <Text
      style={[
        baseStyle,
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
