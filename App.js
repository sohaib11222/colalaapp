// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import RootNavigator from './navigation/RootNavigator';

// export default function App() {
//   return (
//     <NavigationContainer>
//     {/* All navigation flows are handled inside RootNavigator */}
//       <RootNavigator />
//     </NavigationContainer>
//   );
// }


import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import { useFonts } from "expo-font";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Manrope-Regular": require("./assets/fonts/manrope-regular.otf"),
    "Manrope-Bold": require("./assets/fonts/manrope-bold.otf"),
    "Manrope-ExtraBold": require("./assets/fonts/manrope-extrabold.otf"),
    "Manrope-Light": require("./assets/fonts/manrope-light.otf"),
    "Manrope-Medium": require("./assets/fonts/manrope-medium.otf"),
    "Manrope-SemiBold": require("./assets/fonts/manrope-semibold.otf"),
    "Manrope-Thin": require("./assets/fonts/manrope-thin.otf"),
    "OleoScript-Regular": require("./assets/fonts/OleoScript-Regular.ttf"),
    "OleoScript-Bold": require("./assets/fonts/OleoScript-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // or a splash/loading component
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
