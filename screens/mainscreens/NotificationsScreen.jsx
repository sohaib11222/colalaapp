// screens/NotificationsScreen.jsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../components/ThemedText"; // ← adjust path if needed

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

const INITIAL = [
  {
    id: "1",
    title: "Subscription Renewal",
    body:
      "Your Pro plan is set to renew on March 1st, 2025. No action is needed.",
    time: "23/02/23 - 08:22 AM",
    unread: true,
  },
  {
    id: "2",
    title: "Your weekly report is ready",
    body:
      "View your performance and analytics for the week of Aug 18–24.",
    time: "23/02/24 - 11:00 AM",
    unread: true,
  },
  {
    id: "3",
    title: "Security Alert",
    body:
      "A new login to your account was detected from a device in London, UK.",
    time: "23/02/24 - 01:05 PM",
    unread: true,
  },
  {
    id: "4",
    title: "New Message",
    body:
      "A customer just sent you a message, click to view",
    time: "23/02/25 - 02:22 AM",
    unread: true,
    linkText: "click to view",
  },
  {
    id: "5",
    title: "System Maintenance",
    body:
      "We will be undergoing scheduled maintenance on Sunday.",
    time: "23/02/24 - 09:15 PM",
    unread: false,
  },
  {
    id: "6",
    title: "New Feature: AI Assist",
    body:
      "Try our new AI assistant to help you write faster and more…",
    time: "23/02/24 - 05:40 PM",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState(INITIAL);

  const markRead = (id) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => markRead(item.id)}
      style={styles.card}
    >
      {/* left red dot */}
      <View
        style={[
          styles.dot,
          { backgroundColor: item.unread ? COLOR.primary : "#D7D9DE" },
        ]}
      />

      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.time} numberOfLines={1}>
            {item.time}
          </ThemedText>
        </View>

        {/* Body preview (with inline link style if provided) */}
        {item.linkText ? (
          <ThemedText style={styles.body}>
            {item.body.replace(item.linkText, "")}
            <ThemedText style={{ color: COLOR.primary }}>{item.linkText}</ThemedText>
          </ThemedText>
        ) : (
          <ThemedText style={styles.body} numberOfLines={2}>
            {item.body}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
      {/* Header */}
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

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Notifications
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />{/* spacer */}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ---- styles ---- */
function shadow(e = 6) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: e / 2,
      shadowOffset: { width: 0, height: e / 3 },
    },
  });
}

const styles = StyleSheet.create({
  /* Header */
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 10,
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

  /* Card */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    ...shadow(2),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 6,
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, color: COLOR.text, fontWeight: "600" },
  time: { color: COLOR.sub, fontSize: 12, marginLeft: 8 },
  body: { color: COLOR.sub, marginTop: 8 },
});
