
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
import ShoppingWalletScreen from '../screens/mainscreens/settingsscreens/ShoppingWalletScreen.jsx';
import EscrowWalletScreen from '../screens/mainscreens/settingsscreens/EscrowWalletScreen.jsx';
import MyPointsScreen from '../screens/mainscreens/settingsscreens/MyPointsScreen.jsx';
import SupportScreen from '../screens/mainscreens/settingsscreens/SupportScreen.jsx';
import FAQsScreen from '../screens/mainscreens/settingsscreens/FAQsScreen.jsx';
import EditProfileScreen from '../screens/mainscreens/settingsscreens/EditProfileScreen.jsx';
import SupportFormScreen from '../screens/mainscreens/settingsscreens/SupportFormScreen.jsx';

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
      <Stack.Screen name="ShoppingWallet" component={ShoppingWalletScreen} />
      <Stack.Screen name="EscrowWallet" component={EscrowWalletScreen} />
      <Stack.Screen name="MyPoints" component={MyPointsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SupportForm" component={SupportFormScreen} />

     


    
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
