import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const profileImage = require('../../assets/images/profile.png');

const QueryScreen = () => {
  const fetchQueries = async () => {
    const { data, error } = await supabase.from('queries').select('*');
    if (error) {
      console.error('Error fetching queries:', error);
    } else {
      setQueries(data);
    }
  };

  const queryType = 'personal'; // Default to personal as public option is removed
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (result.canceled === false) {
        setAttachedDocument(result.assets[0]);
      } else {
        setAttachedDocument(null);
      }
    } catch (err) {
      console.error('Document picking failed', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled === false) {
        setAttachedImage(result.assets[0]);
      } else {
        setAttachedImage(null);
      }
    } catch (err) {
      console.error('Image picking failed', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [attachedDocument, setAttachedDocument] = useState<any>(null);
  const [attachedImage, setAttachedImage] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    fetchQueries();
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

  const handleSubmitQuery = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    let documentUri = null;
    if (attachedDocument) {
      documentUri = attachedDocument.uri;
    }

    let imageUri = null;
    if (attachedImage) {
      imageUri = attachedImage.uri;
    }

    try {
      const { error } = await supabase.from('queries').insert({
        title,
        description,
        type: 'personal', // Always 'personal' as public option is removed
        status: 'Pending', // Initial status
        user_id: userData?.id, // You would get this from authenticated user
        attached_document: documentUri,
        attached_image: imageUri,
      });

      if (error) {
        throw error;
      }

      Alert.alert('Success', `Your query has been submitted!`);
      setTitle('');
      setDescription('');
      setAttachedDocument(null);
      setAttachedImage(null);
      fetchQueries(); // Refresh queries after submission
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit query: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={profileImage} style={styles.profileImage} />
        <Text style={styles.greetingText}>Hi, {userData?.name || 'User'}</Text>
      </View>
      <Text style={styles.title}>Submit a Query</Text>



      <TextInput
        style={styles.input}
        placeholder="Query Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Query Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <View style={styles.attachmentContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
          <Text style={styles.attachButtonText}>Attach PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
          <Text style={styles.attachButtonText}>Attach Image</Text>
        </TouchableOpacity>
      </View>

      {attachedDocument && <Text style={styles.attachmentText}>Document: {attachedDocument.name}</Text>}
      {attachedImage && <Text style={styles.attachmentText}>Image: {attachedImage.fileName || attachedImage.uri}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuery}>
        <Text style={styles.submitButtonText}>Submit Query</Text>
      </TouchableOpacity>

      {/* This section would display existing queries, fetched dynamically */} 
      <Text style={styles.sectionTitle}>Your Queries (Status: Pending, In Review, Resolved)</Text>
      {queries.length > 0 ? (
        <ScrollView>
          {queries.map((query) => (
            <View key={query.id} style={styles.queryItem}>
              <Text style={styles.queryTitle}>{query.title}</Text>
              <Text style={styles.queryDescription}>{query.description}</Text>
              <Text style={styles.queryStatus}>Status: {query.status}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No queries submitted yet.</Text>
      )}
    </ScrollView>
  );
};

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (result.canceled === false) {
        setAttachedDocument(result.assets[0]);
      } else {
return;
      }
    } catch (err) {
      console.error('Document picking failed', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled === false) {
        if (setAttachedImage) {
          setAttachedImage && setAttachedImage(result.assets[0]);
        }
      } else {
        return;
      }
    } catch (err) {
      console.error('Image picking failed', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

const styles = StyleSheet.create({
  queryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  queryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queryDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  queryStatus: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerBorder: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
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

  attachmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  attachButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  attachButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attachmentText: {
    marginTop: 5,
    marginLeft: 20,
    fontSize: 14,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#800080',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: '60%',
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  }
});

export default QueryScreen;
