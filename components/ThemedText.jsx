import React from "react";
import { Text } from "react-native";

export default function ThemedText({
  children,
  style,
  font = "manrope",
  weight = "regular",
  ...props
}) {
  let fontFamily = "Manrope-Regular";

  if (font === "oleo" && weight === "bold") {
    fontFamily = "OleoScript-Bold";
  } else if (font === "oleo") {
    fontFamily = "OleoScript-Regular";
  } else if (font === "manrope") {
    switch (weight) {
      case "bold":
        fontFamily = "Manrope-Bold";
        break;
      case "extrabold":
        fontFamily = "Manrope-ExtraBold";
        break;
      case "light":
        fontFamily = "Manrope-Light";
        break;
      case "medium":
        fontFamily = "Manrope-Medium";
        break;
      case "semibold":
        fontFamily = "Manrope-SemiBold";
        break;
      case "thin":
        fontFamily = "Manrope-Thin";
        break;
      default:
        fontFamily = "Manrope-Regular";
    }
  }

  return (
    <Text {...props} style={[{ fontFamily }, style]}>
      {children}
    </Text>
  );
}
