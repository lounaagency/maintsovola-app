import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import Investissement from '../Navigation/Investissement';
import Projets from '../Navigation/Projets';
import Paiement from '../Navigation/Paiement';
import Activity from '../Navigation/Activity';

const Tab = createMaterialTopTabNavigator();

export default function ProfileTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#000' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: 'white' },
      }}
    >
      <Tab.Screen
        name="Investissement"
        component={Investissement}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="attach-money" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Projets"
        component={Projets}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="briefcase" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Paiement"
        component={Paiement}
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="credit-card" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activité"
        component={Activity}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="activity" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}