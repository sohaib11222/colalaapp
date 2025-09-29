import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from '../navigation/AuthNavigator';
import MainNavigator from './MainNavigator';
import ServiceNavigator from './ServiceNavigator';
import CategoryNavigator from './CategoryNavigator';
import SettingsNavigator from './SettingsNavigator';
import FlutterwaveWebView from '../components/FlutterwaveWebView';

const RootStack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AuthNavigator" component={AuthNavigator} />
       <RootStack.Screen name="MainNavigator" component={MainNavigator} />
       <RootStack.Screen name="ServiceNavigator" component={ServiceNavigator} />
       <RootStack.Screen name="CategoryNavigator" component={CategoryNavigator} />
       <RootStack.Screen name="SettingsNavigator" component={SettingsNavigator} />
       <RootStack.Screen name="FlutterwaveWebView" component={FlutterwaveWebView} />    
   
    </RootStack.Navigator>
  );
};

export default RootNavigator;
