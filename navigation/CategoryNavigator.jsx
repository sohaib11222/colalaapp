// navigation/ServiceNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/mainscreens/categoryscreens/CategoryScreen';
import ProductsListScreen from '../screens/mainscreens/categoryscreens/ProductListSCreen';
import ProductDetailsScreen from '../screens/mainscreens/categoryscreens/ProductDeatilsScreen';
// Add more service-related screens as needed

const Stack = createNativeStackNavigator();

const CategoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="ProductsList" component={ProductsListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />


    
    </Stack.Navigator>
  );
};

export default CategoryNavigator;
