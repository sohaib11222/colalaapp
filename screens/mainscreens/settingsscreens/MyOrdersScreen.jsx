import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

/* ---------- THEME ---------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  softRedBg: "#FDE9E9",
};

const currency = (n) => `₦${Number(n).toLocaleString()}`;

/* ---------- MOCK DATA ---------- */
const ORDERS = [
  { id: "Ord-1wcjcnefmvk", stores: 2, total: 9_999_990 },
  { id: "Ord-1wcjcnefmvk-2", stores: 2, total: 9_999_990 },
  { id: "Ord-1wcjcnefmvk-3", stores: 2, total: 9_999_990 },
  { id: "Ord-1wcjcnefmvk-4", stores: 2, total: 9_999_990 },
  { id: "Ord-1wcjcnefmvk-5", stores: 2, total: 9_999_990 },
];

export default function MyOrdersScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
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
            Order Details
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() =>
              navigation.navigate("OrderDetails", {
                order: {
                  id: item.id,
                  stores: [
                    // pass the order’s real stores/items here; fallback mock will render if omitted
                  ],
                },
              })
            }
          >
            {/* Left icon bubble */}
            <View style={styles.iconBubble}>
              <Ionicons name="cart-outline" size={22} color={COLOR.primary} />
            </View>

            {/* Middle text */}
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.orderId} numberOfLines={1}>
                {item.id}
              </ThemedText>
              <ThemedText style={styles.storesTxt}>{item.stores} stores</ThemedText>
            </View>

            {/* Right amount */}
            <ThemedText style={styles.amount}>{currency(item.total)}</ThemedText>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
function shadow(e = 8) {
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
  header: {
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
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
    zIndex: 5
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 14,
    ...shadow(6),
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR.softRedBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderId: { color: COLOR.text, fontWeight: "600" },
  storesTxt: { color: COLOR.sub, marginTop: 4, fontSize: 12 },
  amount: { color: COLOR.primary, fontWeight: "800" },
});
