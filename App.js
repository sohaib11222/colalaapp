import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
    {/* All navigation flows are handled inside RootNavigator */}
      <RootNavigator />
    </NavigationContainer>
  );
}
