import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../store/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text>Push Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text>Facial Recognition</Text>
        <Text style={styles.settingValue}>{user?.facialRecognitionEnabled ? 'Enabled' : 'Disabled'}</Text>
      </View>
      
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingValue: {
    color: '#666',
  },
});

export default SettingsScreen;