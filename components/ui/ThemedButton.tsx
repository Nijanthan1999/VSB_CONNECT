import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  lightColor?: string;
  darkColor?: string;
  loading?: boolean;
  textColor?: string;
};

export function ThemedButton(props: ThemedButtonProps) {
  const { title, style, lightColor, darkColor, loading = false, textColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const defaultTextColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText');

  return (
    <TouchableOpacity
      style={[{ backgroundColor }, styles.button, style]}
      disabled={loading}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor || defaultTextColor} />
      ) : (
        <Text style={[{ color: textColor || defaultTextColor }, styles.buttonText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});