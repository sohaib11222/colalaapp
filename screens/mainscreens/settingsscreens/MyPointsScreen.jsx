
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

/* ---- MOCK ---- */
const TOTAL_POINTS = 5000;
const STORES = [
  { id: "1", name: "Sasha Stores", pts: 200, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" },
  { id: "2", name: "Abc Stores", pts: 200, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
  { id: "3", name: "ASH Stores", pts: 150, avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop" },
  { id: "4", name: "AJW Stores", pts: 220, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop" },
  { id: "5", name: "Aji Stores", pts: 180, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop" },
  { id: "6", name: "Asjs Stores", pts: 170, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" },
  { id: "7", name: "odj Stores", pts: 210, avatar: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=200&auto=format&fit=crop" },
  { id: "8", name: "Okkh Stores", pts: 190, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop" },
];

const Row = ({ item }) => (
  <View style={styles.row}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.storeName}>{item.name}</Text>
    </View>
    <Text style={styles.points}>{item.pts}</Text>
  </View>
);

export default function MyPointsScreen() {
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
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} pointerEvents="none">My Points</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <FlatList
        data={STORES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#E90F0F", "#BD0F7B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <Text style={styles.totalLabel}>Total Points Balance</Text>
              <Text style={styles.totalValue}>{TOTAL_POINTS.toLocaleString()}</Text>
            </LinearGradient>

            <Text style={styles.pointsTitle}>Points/ Store</Text>
          </>
        }
        renderItem={({ item }) => <Row item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
  header: {
    backgroundColor: "#fff",
    paddingTop: 25,
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line,
    alignItems: "center", justifyContent: "center",
    zIndex:5
  },
  headerTitle: {
    position: "absolute", left: 0, right: 0, textAlign: "center",
    color: COLOR.text, fontSize: 18, fontWeight: "400",
  },

  totalCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    ...shadow(6),
  },
  totalLabel: { color: "#fff", opacity: 0.9, fontSize: 12, marginBottom: 8 },
  totalValue: { color: "#fff", fontSize: 32, fontWeight: "700" },

  pointsTitle: { marginTop: 14, marginBottom: 8, color: COLOR.sub },

  row: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  storeName: { color: COLOR.text },
  points: { color: COLOR.primary, fontWeight: "700" },
});
