import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import Investissement from '../Navigation/Investissement/Investissement';
import Projets from '../Navigation/Projects/Projets';
import Paiement from '../Navigation/Payment/Paiement';
import Activity from '../Navigation/Activity/Activity';

const Tab = createMaterialTopTabNavigator();

export default function ProfileTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#125b47',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#125b47' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: 'white' },
        // 
      }}
    >
      <Tab.Screen
        name="Poketra"
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