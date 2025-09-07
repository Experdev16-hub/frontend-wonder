
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../services/api';
import { AppleButton } from '@invertase/react-native-apple-authentication';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigation = useNavigation();

  const handleSignup = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (data.success) {
        navigation.navigate('ProfileSetup');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleAppleSignup = async () => {
    // Implement Apple Sign In logic
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/onboarding-1.jpg')} style={styles.logo} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <Button title="Sign Up" onPress={handleSignup} />
      <AppleButton buttonStyle={AppleButton.Style.WHITE} onPress={handleAppleSignup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
});

export default SignupScreen;