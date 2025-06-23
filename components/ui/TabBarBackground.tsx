// This is a shim for web and Android where the tab bar is generally opaque.
import { View } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: 'black',
        overflow: 'hidden',
        height: 85, // Increased height slightly
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
