import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { API_URL } from '../../services/api';

const LookalikeScreen = () => {
  const [similarUsers, setSimilarUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageSelect = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
      });
      setSelectedImage(image.path);
      
      const formData = new FormData();
      formData.append('photo', {
        uri: image.path,
        type: image.mime,
        name: 'lookalike.jpg',
      });
      
      const response = await fetch(`${API_URL}/users/lookalike`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = await response.json();
      setSimilarUsers(data.data.similarUsers);
    } catch (error) {
      console.error('Lookalike error:', error);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <Image source={{ uri: item.photos[0] }} style={styles.userImage} />
      <Text>{item.name}, {item.age}</Text>
      <Text>Similarity: {Math.round(item.similarity * 100)}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Select Photo" onPress={handleImageSelect} />
      
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
      )}
      
      <FlatList
        data={similarUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginVertical: 20,
  },
  userCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default LookalikeScreen;