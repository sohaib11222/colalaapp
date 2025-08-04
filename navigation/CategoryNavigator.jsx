// navigation/ServiceNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/mainscreens/CategoryScreen';

// Add more service-related screens as needed

const Stack = createNativeStackNavigator();

const CategoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Category" component={CategoryScreen} />
    
    </Stack.Navigator>
  );
};

export default CategoryNavigator;
