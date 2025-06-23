import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedTextInput } from '@/components/ui/ThemedTextInput';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Karur');
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !phone || !region) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      // Save to AsyncStorage
      const userData = { name, phone, region };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Save to Supabase
      const { data, error } = await supabase.from('users').insert([userData]);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Registration successful!');
      router.replace('/(tabs)'); // Navigate to main app tabs
    } catch (error: any) {
      Alert.alert('Error', 'Registration failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your Account</Text>
      <ThemedTextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <ThemedTextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={region}
          onValueChange={(itemValue) => setRegion(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Karur" value="Karur" />
          <Picker.Item label="Kulithalai" value="Kulithalai" />
          <Picker.Item label="Manmangalam" value="Manmangalam" />
          <Picker.Item label="Krishnarayapuram" value="Krishnarayapuram" />
        </Picker>
      </View>
      <ThemedButton title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
    width: '100%',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    // On iOS, the Picker component itself handles its height and alignment.
    // On Android, you might need to adjust height if it looks off.
    ...Platform.select({
      android: {
        height: 50, // Example height for Android
      },
    }),
  },
});

export default RegisterScreen;