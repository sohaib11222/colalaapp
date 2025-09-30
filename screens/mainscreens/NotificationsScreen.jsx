// screens/NotificationsScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemedText from "../../components/ThemedText";

const BASE_URL = "https://colala.hmstech.xyz/api";

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const json = await res.json();
      if (json.status === "success") {
        const mapped = json.data.map((n) => ({
          id: String(n.id),
          title: n.title,
          body: n.content,
          time: new Date(n.created_at).toLocaleString(),
          unread: n.is_read === 0,
        }));
        setItems(mapped);
      } else {
        Alert.alert("Error", json.message || "Failed to load notifications");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${BASE_URL}/notifications/mark-as-read/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      // Optimistically update state
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to mark as read.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        <ThemedText style={styles.body} numberOfLines={2}>
          {item.body}
        </ThemedText>
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
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Notifications
          </ThemedText>

          <View style={{ width: 40, height: 40 }} /> {/* spacer */}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLOR.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    zIndex: 5,
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
