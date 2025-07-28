import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Gestion des terrains</Text>
      <TouchableOpacity style={styles.button}>
        <AntDesign name="plus" size={20} color="white" style={styles.icon} />
        <Text style={styles.text}>Nouveau terrain</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TerrainScreen() {
  return (
    <View style={styles.container}>
      <Header />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4d7c0f',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    gap: 14,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  icon: {
    fontSize: 15,
    fontWeight: 600,
  },
});
