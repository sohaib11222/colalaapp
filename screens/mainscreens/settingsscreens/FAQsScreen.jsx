// screens/FAQsScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

export default function FAQsScreen() {
  const navigation = useNavigation();

  const FAQS = [
    {
      id: "q1",
      q: "How to setup my store",
      bullets: ["Download the store app", "Fill your details", "Complete KYC"],
    },
    { id: "q2", q: "Do stores get referral bonus", bullets: [] },
    { id: "q3", q: "Is there exclusive offer for new stores ?", bullets: [] },
    { id: "q4", q: "Do you offer escrow services", bullets: [] },
  ];

  const [openId, setOpenId] = useState("q1");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
      {/* Header (white, no radius) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} pointerEvents="none">
            FAQs
          </Text>

          {/* spacer for symmetry */}
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Video banner */}
        <View style={styles.videoCard}>
          <Image
            source={{
              uri:
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1400&auto=format&fit=crop",
            }}
            style={styles.videoImage}
          />
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={26} color="#fff" />
          </View>
        </View>

        {/* FAQ list */}
        <View style={{ marginTop: 12 }}>
          {FAQS.map((item) => {
            const open = item.id === openId;
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  open && { borderColor: COLOR.primary, backgroundColor: "#fff" },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setOpenId(open ? "" : item.id)}
                  activeOpacity={0.85}
                  style={styles.cardHead}
                >
                  <Text style={styles.cardTitle}>{item.q}</Text>
                  <Ionicons
                    name={open ? "chevron-down" : "chevron-forward"}
                    size={18}
                    color={COLOR.text}
                  />
                </TouchableOpacity>

                {open && item.bullets?.length > 0 && (
                  <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                    {item.bullets.map((b, i) => (
                      <View key={`${item.id}-b${i}`} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---- styles ---- */
function shadow(e = 8) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: e / 2,
      shadowOffset: { width: 0, height: e / 3 },
    },
  });
}

const styles = StyleSheet.create({
  /* Header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    marginBottom:20
  },
  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex:5
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "600",
  },

  /* Video banner */
  videoCard: {
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#eee",
    ...shadow(4),
  },
  videoImage: { width: "100%", height: "100%" },
  playOverlay: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    top: "50%",
    marginLeft: -28,
    marginTop: -28,
  },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginTop: 10,
  },
  cardHead: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { color: COLOR.text },

  /* bullets */
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLOR.text,
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: { color: COLOR.sub },
});
