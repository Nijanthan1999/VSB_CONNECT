import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const profileImage = require('../../assets/images/profile.png');

interface Group {
  id: string;
  name: string;
  description: string;
}

const CommunityScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    fetchGroups();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        setUserData(JSON.parse(storedData));
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data, error } = await supabase.from('groups').select('*');
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setGroups(data);
    }
  };

  const createGroup = async () => {
    if (!newGroupName || !newGroupDescription) {
      Alert.alert('Error', 'Group name and description are required.');
      return;
    }
    const { data, error } = await supabase.from('groups').insert([
      { name: newGroupName, description: newGroupDescription }
    ]).select();

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data) {
      setGroups([...groups, data[0]]);
      setNewGroupName('');
      setNewGroupDescription('');
      Alert.alert('Success', 'Group created successfully!');
    }
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity style={styles.groupItem} onPress={() => Alert.alert('Group', `Joined ${item.name}`)}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header userName={userData?.name || 'User'} profileImageSource={profileImage} />
      <Text style={styles.title}>Community Groups</Text>
      <View style={styles.createGroupContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Group Name"
          value={newGroupName}
          onChangeText={setNewGroupName}
        />
        <TextInput
          style={styles.input}
          placeholder="New Group Description"
          value={newGroupDescription}
          onChangeText={setNewGroupDescription}
        />
        <Button title="Create Group" onPress={createGroup} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        style={styles.groupList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  createGroupContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  groupList: {
    flex: 1,
  },
  groupItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default CommunityScreen;