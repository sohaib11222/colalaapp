
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
import MyOrders from '../screens/mainscreens/settingsscreens/MyOrdersScreen';
import OrderDetailsScreen from '../screens/mainscreens/settingsscreens/OrderDetailScreen';
// Add more service-related screens as needed
import SavedItemsScreen from '../screens/mainscreens/settingsscreens/SavedItemsScreen';
import FollowedStoresScreen from '../screens/mainscreens/settingsscreens/FollowedStoresScreen';
import MyReviewsScreen from '../screens/mainscreens/settingsscreens/MyReviewsScreen';
import ReferalsScreen from '../screens/mainscreens/settingsscreens/ReferralsScreen';


const Stack = createNativeStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyOrders" component={MyOrders} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="FollowedStores" component={FollowedStoresScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="Referals" component={ReferalsScreen} />

     


    
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
