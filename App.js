
// App.js
import React, { useEffect, useRef } from "react";
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import RootNavigator from "./navigation/RootNavigator";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/api.config";
import { setNavigationRef } from "./utils/navigationUtils";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const navigationRef = useRef();

  const [fontsLoaded] = useFonts({
    "Manrope-Thin": require("./assets/fonts/manrope-thin.otf"),
    "Manrope-Light": require("./assets/fonts/manrope-light.otf"),
    "Manrope-Regular": require("./assets/fonts/manrope-regular.otf"),
    "Manrope-Medium": require("./assets/fonts/manrope-medium.otf"),
    "Manrope-SemiBold": require("./assets/fonts/manrope-semibold.otf"),
    "Manrope-Bold": require("./assets/fonts/manrope-bold.otf"),
    "Manrope-ExtraBold": require("./assets/fonts/manrope-extrabold.otf"),
    "OleoScript-Regular": require("./assets/fonts/OleoScript-Regular.ttf"),
    "OleoScript-Bold": require("./assets/fonts/OleoScript-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Set navigation reference for logout functionality
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
