import React, { useMemo, useState } from "react";
import {
  View,
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
import ThemedText from "../../../components/ThemedText"; // <-- adjust path if needed

import { useEscrowWallet } from "../../../config/api.config";
import { useEscrowWalletHistory } from "../../../config/api.config";

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

  // Fetch escrow wallet data
  const { data: walletData, isLoading: walletLoading, error: walletError } = useEscrowWallet();
  
  // Fetch escrow wallet history
  const { data: historyData, isLoading: historyLoading, error: historyError } = useEscrowWalletHistory();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${Number(amount).toLocaleString()}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Process history data
  const historyItems = useMemo(() => {
    if (!historyData?.data?.data) return [];
    return historyData.data.data.map((item, index) => ({
      id: `h${index + 1}`,
      title: item.title || "Transaction",
      amount: formatCurrency(item.amount),
      store: item.description || "View Details",
      when: formatDate(item.created_at),
      type: item.type || "transaction"
    }));
  }, [historyData]);

  // Loading state
  if (walletLoading || historyLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
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
              Escrow Wallet
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading wallet data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (walletError || historyError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
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
              Escrow Wallet
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>
        
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Failed to load wallet data. Please try again.
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
            Escrow Wallet
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <FlatList
        data={historyItems}
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
              <ThemedText style={styles.gcLabel}>Escrow Wallet</ThemedText>
              <ThemedText style={styles.gcAmount}>
                {formatCurrency(walletData?.data?.locked_balance)}
              </ThemedText>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={48} color={COLOR.sub} />
            <ThemedText style={styles.emptyText}>
              No transaction history found
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Your escrow transactions will appear here
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
  
  // Loading, Error, and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: COLOR.text,
    textAlign: "center",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
    lineHeight: 20,
  },
});
