import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingState({ 
  message = "Chargement...", 
  size = "large",
  color = "#3b82f6" 
}: LoadingStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <ActivityIndicator size={size} color={color} />
      <Text className="mt-3 text-gray-600 text-center text-base">
        {message}
      </Text>
    </View>
  );
}