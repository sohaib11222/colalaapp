import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/mainscreens/HomeScreen';
import FeedScreen from '../screens/mainscreens/FeedScreen';
import ChatScreen from '../screens/mainscreens/ChatScreen';
import StoreScreen from '../screens/mainscreens/storesscreen/StoreScreen';
import SettingsScreen from '../screens/mainscreens/SettingsScreen';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Feed') iconName = 'home';
          else if (route.name === 'Chat') iconName = 'chatbox-ellipses';
          else if (route.name === 'Home') iconName = 'cart';
          else if (route.name === 'Stores') iconName = 'storefront';
          else if (route.name === 'Settings') iconName = 'settings';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stores" component={StoreScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
