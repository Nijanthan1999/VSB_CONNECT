import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface HeaderProps {
  userName: string;
  profileImageSource: any;
}

const Header: React.FC<HeaderProps> = ({ userName, profileImageSource }) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={profileImageSource} style={styles.profileImage} />
      <Text style={styles.greetingText}>Hi, {userName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    paddingTop: 40, // Added padding to push content below notification bar
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Neutral gray
    backgroundColor: 'white',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;