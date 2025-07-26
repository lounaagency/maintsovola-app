import React from 'react';
import { View, Text } from 'react-native';
import { FileX } from 'lucide-react-native';

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  message = "Aucune donnée disponible",
  description,
  icon
}: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        {icon || <FileX size={48} color="#9ca3af" />}
        <Text className="text-gray-700 text-lg font-medium mt-4 text-center">
          {message}
        </Text>
        {description && (
          <Text className="text-gray-500 text-sm mt-2 text-center max-w-xs">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}