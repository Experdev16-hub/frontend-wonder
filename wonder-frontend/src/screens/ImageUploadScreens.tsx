// src/screens/ImageUploadScreen.tsx
'allowImportingTsExtensions'
import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImageUploadScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();

    if (
      permissionResult.status !== 'granted' ||
      cameraResult.status !== 'granted'
    ) {
      Alert.alert('Permission denied', 'Camera and storage access are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        setLoading(true);
        // const matchResult = await uploadImage(uri);
        // Alert.alert('Match Found!', JSON.stringify(matchResult));
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Upload Photo" onPress={pickImage} />
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default ImageUploadScreen;