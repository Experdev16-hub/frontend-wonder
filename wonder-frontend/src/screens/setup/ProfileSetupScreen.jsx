2
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ImagePicker from 'react-native-image-crop-picker';
import { API_URL } from '../../services/api';

const ProfileSetupScreen = () => {
  const [age, setAge] = useState(25);
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState([]);
  const [interestedIn, setInterestedIn] = useState('both');

  const handlePhotoUpload = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
      });
      // Upload to backend
      const formData = new FormData();
      formData.append('photo', {
        uri: image.path,
        type: image.mime,
        name: 'photo.jpg',
      });
      const response = await fetch(`${API_URL}/users/photos`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      setPhotos([...photos, data.data.photoUrl]);
    } catch (error) {
      console.error('Photo upload error:', error);
    }
  };

  const handleSubmit = async () => {
    // Submit profile data
  };

  return (
    <ScrollView style={styles.container}>
      <Text>Add Photos (Max 6)</Text>
      <Button title="Add Photo" onPress={handlePhotoUpload} />
      
      <Text>Age</Text>
      <TextInput value={age.toString()} onChangeText={(text) => setAge(Number(text))} keyboardType="numeric" />
      
      <Text>Occupation</Text>
      <TextInput value={occupation} onChangeText={setOccupation} />
      
      <Text>Bio</Text>
      <TextInput multiline value={bio} onChangeText={setBio} />
      
      <Text>Interested In</Text>
      <Picker selectedValue={interestedIn} onValueChange={setInterestedIn}>
        <Picker.Item label="Men" value="men" />
        <Picker.Item label="Women" value="women" />
        <Picker.Item label="Both" value="both" />
      </Picker>
      
      <Button title="Complete Profile" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default ProfileSetupScreen;