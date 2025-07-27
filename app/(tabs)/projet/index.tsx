import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProjetScreen() {
  return (
    <View 
    // style={styles.container}
    className='flex-1 justify-center items-center p-5 bg-gray-50'
    >
      <Text // style={styles.title} --- IGNORE ---        
        className="text-2xl font-bold mb-2">
        Projet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});