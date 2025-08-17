import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ServicesScreen from '../screens/mainscreens/servicescreens/ServicesScreen';
import ServiceStoresScreen from '../screens/mainscreens/servicescreens/ServiceStoresScreen';
import ServiceDetailsScreen from '../screens/mainscreens/servicescreens/ServiceDetailsScreen';
import ServiceChatScreen from '../screens/mainscreens/servicescreens/ServiceChatScreen';
import StoreDetailsScreen from '../screens/mainscreens/storesscreen/StoreDetailsScreen';
import StoreChatScreen from '../screens/mainscreens/storesscreen/StoreChatScreen';
import ChatDetailsScreen from '../screens/mainscreens/chatscreens/ChatDetailsScreen';
import NotificationsScreen from '../screens/mainscreens/NotificationsScreen';
import CartScreen from '../screens/mainscreens/CartScreen';
import ShippingDetailsScreen from '../screens/mainscreens/ShippingDetailsScreen';
import ShippingSummaryScreen from '../screens/mainscreens/ShippingSummaryScreen';

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
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Shipping" component={ShippingDetailsScreen} />
      <Stack.Screen name="ShippingSummary" component={ShippingSummaryScreen} />



    </Stack.Navigator>
  );
};

export default ServiceNavigator;
