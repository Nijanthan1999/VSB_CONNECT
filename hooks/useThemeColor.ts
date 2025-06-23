/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: keyof typeof Colors.light) {
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme][colorName];

  if (props.light && props.dark) {
    return theme === 'light' ? props.light : props.dark;
  } else {
    return tintColor;
  }
}
