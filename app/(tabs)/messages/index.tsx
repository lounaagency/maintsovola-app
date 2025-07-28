import { View, Text, StyleSheet } from 'react-native';
import MessengerScreen from '@/components/Messengers';

export default function MessageScreen() {
  return (
    <View className='flex-1 w-full justify-center items-center bg-gray-50'>
      <MessengerScreen />
    </View>
  );
}
