import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorState({ 
  error, 
  onRetry, 
  showRetry = true 
}: ErrorStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="bg-red-50 rounded-lg p-4 w-full max-w-sm">
        <Text className="text-red-600 text-center text-base font-medium mb-2">
          Erreur
        </Text>
        <Text className="text-red-500 text-center text-sm mb-4">
          {error}
        </Text>
        
        {showRetry && onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-red-500 rounded-lg py-3 px-4 flex-row justify-center items-center"
            activeOpacity={0.8}
          >
            <RefreshCw size={16} color="white" />
            <Text className="text-white font-medium ml-2">Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}