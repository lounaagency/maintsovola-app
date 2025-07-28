import React from 'react';
import { View, Text } from 'react-native';

const MessageBubble = React.memo(({ message }) => {
  return (
    <View className="bg-gray-100 rounded-lg p-3 mb-2 shadow-sm">
      <Text className="text-base text-gray-800">{message.content}</Text>
    </View>
  );
});

export default MessageBubble;
