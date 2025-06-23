import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedTextInput } from '@/components/ui/ThemedTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, Image } from 'react-native';

const profileImage = require('../../assets/images/profile.png');

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        setName(parsedData.name);
        setPhone(parsedData.phone);
        setRegion(parsedData.region);
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = { name, phone, region };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));

      // Update in Supabase (assuming you have a user ID to identify the record)
      // For simplicity, this example assumes you'd fetch the user's Supabase ID
      // during login/registration and store it with userData.
      // const { error } = await supabase.from('users').update(updatedData).eq('id', userId);
      // if (error) throw error;

      setUserData(updatedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Logged Out', 'You have been logged out.');
      router.replace('/register'); // Navigate back to the auth screen
    } catch (e) {
      console.error('Failed to clear async storage', e);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={profileImage} style={styles.profileImage} />
        <Text style={styles.greetingText}>Hi, {userData?.name || 'User'}</Text>
      </View>
      <Text style={styles.title}>Profile</Text>
      {isEditing ? (
        <View style={styles.form}>
          <ThemedTextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
          <ThemedTextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
          <ThemedTextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="Region" />
          <ThemedButton title="Save" onPress={handleSave} />
          <ThemedButton title="Cancel" onPress={() => setIsEditing(false)} lightColor="red" darkColor="red" />
        </View>
      ) : (
        <View style={styles.details}>
          <Text style={styles.detailText}>Name: {userData.name}</Text>
          <Text style={styles.detailText}>Phone: {userData.phone}</Text>
          <Text style={styles.detailText}>Region: {userData.region}</Text>
          <ThemedButton title="Edit Profile" onPress={() => setIsEditing(true)} />
        </View>
      )}
      <View style={styles.logoutButtonContainer}>
        <ThemedButton title="Log out" onPress={handleLogout} lightColor="red" darkColor="red" textColor="black" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  details: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  detailText: {
    fontSize: 18,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
  },
  form: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
});

export default ProfileScreen;