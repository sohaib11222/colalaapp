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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

import { useMyPoints } from "../../../config/api.config";

const Row = ({ item }) => (
  <View style={styles.row}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image 
        source={{ uri: item.avatar || require("../../../assets/Ellipse 18.png") }} 
        style={styles.avatar} 
      />
      <ThemedText style={styles.storeName}>{item.name}</ThemedText>
    </View>
    <ThemedText style={styles.points}>{item.points}</ThemedText>
  </View>
);

export default function MyPointsScreen() {
  const navigation = useNavigation();
  
  // Fetch points data
  const { data: pointsData, isLoading, error } = useMyPoints();

  // Process API data
  const totalPoints = pointsData?.data?.total_points || 0;
  const stores = pointsData?.data?.stores || [];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack()
                  ? navigation.goBack()
                  : navigation.navigate("Home")
              }
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} pointerEvents="none">
              My Points
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading points data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack()
                  ? navigation.goBack()
                  : navigation.navigate("Home")
              }
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} pointerEvents="none">
              My Points
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.primary} />
          <ThemedText style={styles.errorText}>
            Failed to load points data. Please try again.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} pointerEvents="none">
            My Points
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#E90F0F", "#BD0F7B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.totalCard}
            >
              <ThemedText style={styles.totalLabel}>
                Total Points Balance
              </ThemedText>
              <ThemedText style={styles.totalValue}>
                {totalPoints.toLocaleString()}
              </ThemedText>
            </LinearGradient>

            <ThemedText style={styles.pointsTitle}>Points/ Store</ThemedText>
          </>
        }
        renderItem={({ item }) => <Row item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={48} color={COLOR.sub} />
            <ThemedText style={styles.emptyText}>
              No points earned yet
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start shopping to earn points from your favorite stores
            </ThemedText>
          </View>
        }
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
    fontWeight: "400",
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

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.primary,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: COLOR.text,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
    lineHeight: 20,
  },
});
