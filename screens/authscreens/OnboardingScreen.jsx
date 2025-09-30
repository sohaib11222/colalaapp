import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../components/ThemedText";
import {
  View,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from "react-native";

// ---- Responsive helpers ----
const BASE_W = 375;
const BASE_H = 812;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const scale = (w, size) => (w / BASE_W) * size;
const vscale = (h, size) => (h / BASE_H) * size;
const mscale = (w, size, f = 0.5) => size + (scale(w, size) - size) * f;

// ---- Features List ----
const features = [
  {
    id: 1,
    image: require("../../assets/Rectangle 157.png"),
    text: "Shop from variety of unique stores nationwide across several categories",
  },
  {
    id: 2,
    image: require("../../assets/Rectangle 157 (1).png"),
    text: "Chat and communicate easily with stores via the in-app chat",
  },
  {
    id: 3,
    image: require("../../assets/Rectangle 157 (2).png"),
    text: "Personalized social media feeds to see latest posts from stores across colala",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [loading, setLoading] = useState(true);

  // --- check if onboarding already completed ---
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem("onboardingSeen");
        if (seen) {
          navigation.replace("Login"); // Skip onboarding if already seen
        }
      } catch (e) {
        console.log("AsyncStorage error:", e);
      } finally {
        setLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleProceed = async () => {
    await AsyncStorage.setItem("onboardingSeen", "true");
    navigation.replace("Login"); // replace so user can't go back
  };

  // Screen scaling
  const HERO_H = clamp(vscale(height, 340), 300, 420);
  const SHEET_OFFSET = clamp(vscale(height, 30), 18, 36);
  const CARD_W = clamp(scale(width, 168), 150, 210);
  const CARD_GAP = clamp(scale(width, 12), 10, 14);
  const BRAND_FS = clamp(mscale(width, 72, 0.35), 58, 78);
  const WELCOME_FS = clamp(mscale(width, 20, 0.4), 18, 22);
  const SUB_FS = clamp(mscale(width, 14, 0.35), 13, 15);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E53E3E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top hero image */}
      <Image
        source={require("../../assets/image 54.png")}
        style={[styles.mainImage, { height: HERO_H }]}
        resizeMode="cover"
      />

      {/* Bottom rounded sheet */}
      <View style={[styles.overlayCard, { marginTop: HERO_H - SHEET_OFFSET }]}>
        <ThemedText font="oleo" style={[styles.welcomeText, { fontSize: WELCOME_FS }]}>
          Welcome to
        </ThemedText>

        <ThemedText
          font="oleo"
          style={[styles.brandName, { fontSize: BRAND_FS }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          COLALA
        </ThemedText>

        <ThemedText style={[styles.subText, { fontSize: SUB_FS }]}>
          Why Choose Colala ?
        </ThemedText>

        {/* Horizontal features */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ marginBottom: 18 }}
          snapToInterval={CARD_W + CARD_GAP}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {features.map((item) => (
            <View
              key={item.id}
              style={[
                styles.featureCard,
                {
                  width: CARD_W,
                  marginRight: CARD_GAP,
                  borderRadius: clamp(scale(width, 18), 16, 20),
                },
              ]}
            >
              <Image source={item.image} style={styles.featureImage} resizeMode="cover" />
              <ThemedText style={styles.featureText} numberOfLines={3} ellipsizeMode="tail">
                {item.text}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={handleProceed}
          style={styles.proceedBtn}
          activeOpacity={0.9}
        >
          <ThemedText style={styles.proceedText}>Proceed</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  mainImage: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },

  overlayCard: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  welcomeText: {
    color: "#E53E3E",
    fontWeight: "700",
    marginBottom: 0,
  },

  brandName: {
    color: "#E53E3E",
    fontWeight: "700",
    includeFontPadding: false,
    marginTop: -2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  subText: {
    color: "#777",
    marginBottom: 14,
  },

  featureCard: {
    backgroundColor: "#fff",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },

  featureImage: {
    width: "100%",
    aspectRatio: 222 / 137,
  },

  featureText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  proceedBtn: {
    backgroundColor: "#d94b4b",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  proceedText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
