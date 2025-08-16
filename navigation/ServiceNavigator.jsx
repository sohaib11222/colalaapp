// navigation/ServiceNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/mainscreens/servicescreens/ServicesScreen';
import ServiceStoresScreen from '../screens/mainscreens/servicescreens/ServiceStoresScreen';
import ServiceDetailsScreen from '../screens/mainscreens/servicescreens/ServiceDetailsScreen';
import ServiceChatScreen from '../screens/mainscreens/servicescreens/ServiceChatScreen';
import StoreDetailsScreen from '../screens/mainscreens/storesscreen/StoreDetailsScreen';
import StoreChatScreen from '../screens/mainscreens/storesscreen/StoreChatScreen';
import ChatDetailsScreen from '../screens/mainscreens/chatscreens/ChatDetailsScreen';

// Add more service-related screens as needed

const Stack = createNativeStackNavigator();

const ServiceNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      <Stack.Screen name="ServiceStore" component={ServiceStoresScreen} />
      <Stack.Screen name="SeviceDeatils" component={ServiceDetailsScreen} />
      <Stack.Screen name="ServiceChat" component={ServiceChatScreen} />
      <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
      <Stack.Screen name="StoreChat" component={StoreChatScreen} />
      <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />


    </Stack.Navigator>
  );
};

export default ServiceNavigator;
