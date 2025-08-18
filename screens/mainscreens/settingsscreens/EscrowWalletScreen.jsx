import React, { useMemo, useState } from "react";
import {
  View,
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
import ThemedText from "../../../components/ThemedText"; // <-- adjust path if needed

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  success: "#18A957",
};

/* ---- MOCK DATA ---- */
const whenText = "07/10/25 - 06:22 AM";
const LOCKS = Array.from({ length: 6 }).map((_, i) => ({
  id: `l${i + 1}`,
  title: "Funds Locked",
  amount: "₦200,000",
  store: "View Product",
  when: whenText,
}));

const LockRow = ({ item, onPressStore }) => (
  <View style={styles.rowCard}>
    <View style={styles.leadingIcon}>
      <Ionicons name="lock-closed-outline" size={22} color={COLOR.text} />
    </View>

    <View style={{ flex: 1 }}>
      <ThemedText style={styles.rowTitle}>{item.title}</ThemedText>
      <TouchableOpacity onPress={onPressStore} activeOpacity={0.8}>
        <ThemedText style={styles.rowLink}>{item.store}</ThemedText>
      </TouchableOpacity>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <ThemedText style={styles.rowAmount}>{item.amount}</ThemedText>
      <ThemedText style={styles.rowWhen}>{item.when}</ThemedText>
    </View>
  </View>
);

export default function EscrowWalletScreen() {
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
          <ThemedText style={styles.headerTitle} pointerEvents="none">Escrow Wallet</ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <FlatList
        data={LOCKS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            {/* Balance card */}
            <LinearGradient
              colors={["#E90F0F", "#BD0F7B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <ThemedText style={styles.gcLabel}>Shopping Wallet</ThemedText>
              <ThemedText style={styles.gcAmount}>N35,000</ThemedText>
            </LinearGradient>

            <ThemedText style={styles.sectionTitle}>History</ThemedText>
          </>
        }
        renderItem={({ item }) => (
          <LockRow
            item={item}
            onPressStore={() => {
              // wire to product details if you have one
              // navigation.navigate("ProductDetails", { id: ... })
            }}
          />
        )}
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

  gradientCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    ...shadow(6),
  },
  gcLabel: { color: "#fff", opacity: 0.9, fontSize: 12, marginBottom: 12 },
  gcAmount: { color: "#fff", fontSize: 36, fontWeight: "700" },

  sectionTitle: { marginTop: 14, marginBottom: 8, color: COLOR.sub },

  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  leadingIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#F2F3F6",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: { color: COLOR.text, fontWeight: "700" },
  rowLink: { color: COLOR.primary, marginTop: 4, fontSize: 12 },
  rowAmount: { color: COLOR.primary, fontWeight: "800" },
  rowWhen: { color: COLOR.sub, fontSize: 11, marginTop: 6 },
});
