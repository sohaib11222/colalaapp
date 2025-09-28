// screens/SupportScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../../components/ThemedText";

/* ---- Theme ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

export default function SupportScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // 'all' | 'pending' | 'resolved'

  // Placeholder data (empty to show your empty state)
  const DATA = [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <StatusBar style="light" />
      {/* Header (red, rounded bottom, with search inside) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
            }
            style={styles.circleBtn}
          >
            <Ionicons name="chevron-back" size={20} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText font="oleo" style={styles.headerTitle} numberOfLines={1} pointerEvents="none">
            Support
          </ThemedText>

          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="notifications-outline" size={18} color={COLOR.text} />
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Search chat"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchIconBtn}>
            <Ionicons name="camera-outline" size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TabPill label="All" active={tab === "all"} onPress={() => setTab("all")} />
        <TabPill label="Pending" active={tab === "pending"} onPress={() => setTab("pending")} />
        <TabPill label="Resolved" active={tab === "resolved"} onPress={() => setTab("resolved")} />
      </View>

      {/* List (empty to show placeholder) */}
      <FlatList
        data={DATA}
        keyExtractor={(i, idx) => String(idx)}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 6 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <ThemedText style={styles.emptyText}>
              Your support chat list is empty, contact support{"\n"}by clicking the plus icon
            </ThemedText>
          </View>
        }
        renderItem={() => null}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("SupportForm")}   // <-- open form screen
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */
const TabPill = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabPill, active ? styles.tabActive : styles.tabInactive]}
    activeOpacity={0.9}
  >
    <ThemedText style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>
      {label}
    </ThemedText>
  </TouchableOpacity>
);

/* ---------- Styles ---------- */
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
  /* Header block */
  header: {
    backgroundColor: COLOR.primary,
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 26,
    paddingTop: 10,
    borderBottomRightRadius: 26,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    marginLeft: -220,
    fontWeight: "700",
    // fontStyle: "italic",
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...shadow(4),
  },

  searchWrap: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow(3),
    marginTop: 20,
  },
  searchInput: { flex: 1, color: COLOR.text, fontSize: 14 },
  searchIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  /* Tabs */
  tabsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabPill: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line },
  tabText: { fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  tabTextInactive: { color: COLOR.sub },

  /* Empty state */
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { textAlign: "center", color: COLOR.sub, lineHeight: 20 },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow(10),
  },
});
