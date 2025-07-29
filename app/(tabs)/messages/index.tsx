import { View, Text, StyleSheet } from 'react-native';

import MessageList from '~/components/messenger/MessageList';
// import MessengerScreen from '~/components/messenger/Messenger';
import { useAuth } from '~/contexts/AuthContext';
//import Messages from '~/components/Messages';
import MessengerScreen from '~/components/MessengerScreen';

export default function MessageScreen() {

  const { user } = useAuth();

  return (
    <View className='flex-1 w-full justify-center items-center bg-gray-50'>
      {/* <Messages /> */}
      {/* <MessengerScreen /> */}
      <MessageList currentUserId={ user?.id || ''} />
      {/* <MessengerScreen /> */}
    </View>
  );
}
