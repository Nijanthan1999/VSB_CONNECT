import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View, ActivityIndicator, Pressable, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedTextInput } from '@/components/ui/ThemedTextInput';

const profileImage = require('../../assets/images/profile.png');

const QueryScreen = () => {
  // State management for form inputs and loading states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [attachedDocument, setAttachedDocument] = useState<any>(null);
  const [attachedImage, setAttachedImage] = useState<any>(null);
  const [checkedDocument, setCheckedDocument] = useState(false);
  const [checkedImage, setCheckedImage] = useState(false);
  const [submitScale] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
    // Upload file to Supabase Storage
  const uploadFile = async (uri: string, bucket: string, path: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (!base64) {
            reject(new Error('Failed to convert file to base64'));
            return;
          }

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, decode(base64), { contentType: blob.type });

          if (error) {
            reject(error);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

          resolve(publicUrl);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      throw err;
    }
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


  useEffect(() => {
    loadUserData();
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
    if (!title || !description || !userData) {
      setError('Please fill in all fields and ensure you\'re logged in.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let attachmentUrls = [];

      // Upload PDF if attached and checked
      if (attachedDocument && checkedDocument) {
        const pdfUrl = await uploadFile(
          attachedDocument.uri,
          'attachments-mobile',
          `pdfs/${Date.now()}-${attachedDocument.name}`
        );
        attachmentUrls.push(pdfUrl);
      }

      // Upload Image if attached and checked
      if (attachedImage && checkedImage) {
        const imageUrl = await uploadFile(
          attachedImage.uri,
          'attachments-mobile',
          `images/${Date.now()}-${attachedImage.uri.split('/').pop()}`
        );
        attachmentUrls.push(imageUrl);
      }

      // Insert query with attachments
      const { error } = await supabase.from('queries').insert({
        title,
        description,
        name: userData.name,
        phone: userData.phone,
        attachment_url: attachmentUrls.join(','),
        created_at: new Date().toISOString(),
        type: 'personal', // Always 'personal' as public option is removed
        status: 'Pending' // Initial status
      });

      if (error) throw error;

      // Reset form
      setTitle('');
      setDescription('');
      setAttachedDocument(null);
      setAttachedImage(null);
      Alert.alert('Success', 'Query submitted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit query');
    } finally {
      setIsLoading(false);
    }
  };

  const animateSubmit = () => {
    Animated.sequence([
      Animated.timing(submitScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(submitScale, {
        toValue: 1.05,
        useNativeDriver: true,
        speed: 30,
        bounciness: 12
      }),
      Animated.spring(submitScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 5
      })
    ]).start();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={profileImage} style={styles.profileImage} />
          <ThemedText style={styles.welcomeText}>Hi, {userData?.name || "User"}</ThemedText>
          <ThemedText style={{fontSize: 22, fontWeight: '700', textAlign: 'center', marginVertical: 12}}>Enter Query Details</ThemedText>
          <ThemedText>{userData?.name ? `Welcome, ${userData.name}` : 'Welcome'}</ThemedText>
        </View>

        {/* Error Message */}
        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}

        {/* Query Form */}
        <View style={[styles.formContainer, styles.cardStyle]}>
          <ThemedTextInput
            placeholder="Query Title"
            value={title}
            onChangeText={setTitle}
            style={[styles.input, styles.inputStyle]}
          />

          <ThemedTextInput
            placeholder="Query Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.textArea, styles.inputStyle]}
          />

          {/* Attachment Buttons */}
          <View style={styles.attachmentContainer}>
            <View style={styles.attachmentWrapper}>
              <ThemedButton
                onPress={pickDocument}
                style={[styles.attachButton, styles.cardStyle]}
                title={attachedDocument ? 'PDF Selected' : 'Attach PDF'}
                textColor={styles.buttonText.color}
              />
              {attachedDocument && (
                <Pressable 
                  style={[styles.checkbox, checkedDocument && styles.checkboxChecked]}
                  onPress={() => setCheckedDocument(!checkedDocument)}
                >
                  {checkedDocument && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </Pressable>
              )}
            </View>
            <View style={styles.attachmentWrapper}>
              <ThemedButton
                onPress={pickImage}
                style={[styles.attachButton, styles.cardStyle]}
                title={attachedImage ? 'Image Selected' : 'Attach Image'}
                textColor={styles.buttonText.color}
              />
              {attachedImage && (
                <Pressable 
                  style={[styles.checkbox, checkedImage && styles.checkboxChecked]}
                  onPress={() => setCheckedImage(!checkedImage)}
                >
                  {checkedImage && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </Pressable>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Animated.View style={[{ transform: [{ scale: submitScale }] }]}>
            <ThemedButton
              onPress={() => {
                animateSubmit();
                handleSubmitQuery();
              }}
              style={[styles.submitButton]}
              textColor="#FFFFFF"
              disabled={isLoading}
              title={isLoading ? 'Submitting...' : 'Submit Query'}
            />
          </Animated.View>

          {isLoading && (
            <ActivityIndicator style={styles.loader} size="large" />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  welcomeText: {
    fontSize: 18,
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
    margin: 15,
  },
  inputStyle: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    marginBottom: 15,
  },
  textArea: {
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  attachmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  attachmentWrapper: {
    flex: 0.48,
    position: 'relative',
  },
  attachButton: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
  },
  checkbox: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B46C1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6B46C1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: '#EC4899',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#EC4899',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default QueryScreen;
