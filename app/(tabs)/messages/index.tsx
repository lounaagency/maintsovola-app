import { View, Text, StyleSheet } from 'react-native';
import Messages from '~/components/Messages';
import MessengerScreen from '~/components/MessengerScreen';

export default function MessageScreen() {
  return (
    <View className='flex-1 w-full justify-center items-center bg-gray-50'>
      {/* <Messages /> */}
      <MessengerScreen />
    </View>
  );
}
