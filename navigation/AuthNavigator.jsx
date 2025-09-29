import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/authscreens/LoginScreen';
import OnboardingScreen from '../screens/authscreens/OnboardingScreen';
import RegisterScreen from '../screens/authscreens/RegisterScreen';
import ForgotPasswordScreen from '../screens/authscreens/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/authscreens/VerifyCodeScreen';
import NewPasswordScreen from '../screens/authscreens/NewPasswordScreen.jsx';
import SearchScreen from '../screens/mainscreens/SearchScreen.jsx';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={
    { headerShown:false}
  }>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPass" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="NewPass" component={NewPasswordScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />

    
  </Stack.Navigator>
);

export default AuthNavigator;
