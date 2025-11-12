import React, { useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useOrders } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

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

const currency = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function MyOrdersScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  // Tab state: 0 = Pending, 1 = Accepted, 2 = In Process, 3 = Rejected, 4 = Completed
  const [activeTab, setActiveTab] = useState(0);
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch first page (pagination optional)
  const { data, isLoading, isError, refetch } = useOrders(1);

  // Handle different API response structures:
  // Standard: { status, data: { data: [orders] } }
  // Store orders: { status, data: { orders: [orders] } }
  const allOrders = useMemo(() => {
    if (Array.isArray(data?.data?.data)) {
      return data.data.data;
    } else if (Array.isArray(data?.data?.orders)) {
      return data.data.orders;
    }
    return [];
  }, [data]);

  // Filter orders based on active tab
  const orders = useMemo(() => {
    return allOrders.filter(order => {
      // Check if order has store_orders array (standard structure)
      if (order.store_orders && Array.isArray(order.store_orders)) {
        const hasMatchingStatus = order.store_orders.some(storeOrder => {
          const status = storeOrder.status?.toLowerCase();
          
          if (activeTab === 0) {
            // Pending: pending_acceptance
            return status === 'pending_acceptance';
          } else if (activeTab === 1) {
            // Accepted: accepted
            return status === 'accepted';
          } else if (activeTab === 2) {
            // In Process: all other statuses except rejected and delivered
            return status !== 'pending_acceptance' && status !== 'accepted' && status !== 'rejected' && status !== 'delivered';
          } else if (activeTab === 3) {
            // Rejected: rejected
            return status === 'rejected';
          } else if (activeTab === 4) {
            // Completed: delivered
            return status === 'delivered';
          }
          
          return false;
        });
        
        return hasMatchingStatus;
      } 
      // Handle store orders structure where status is directly on the order
      else if (order.status) {
        const status = order.status?.toLowerCase();
        
        if (activeTab === 0) {
          // Pending: pending_acceptance
          return status === 'pending_acceptance';
        } else if (activeTab === 1) {
          // Accepted: accepted
          return status === 'accepted';
        } else if (activeTab === 2) {
          // In Process: all other statuses except rejected and delivered
          return status !== 'pending_acceptance' && status !== 'accepted' && status !== 'rejected' && status !== 'delivered';
        } else if (activeTab === 3) {
          // Rejected: rejected
          return status === 'rejected';
        } else if (activeTab === 4) {
          // Completed: delivered
          return status === 'delivered';
        }
      }
      
      return false;
    });
  }, [allOrders, activeTab]);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch orders query
      await queryClient.invalidateQueries({ queryKey: ['orders', 1] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <ThemedText style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              Pending
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <ThemedText style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              Accepted
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 2 && styles.activeTab]}
            onPress={() => setActiveTab(2)}
          >
            <ThemedText style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>
              In Process
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 3 && styles.activeTab]}
            onPress={() => setActiveTab(3)}
          >
            <ThemedText style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>
              Rejected
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 4 && styles.activeTab]}
            onPress={() => setActiveTab(4)}
          >
            <ThemedText style={[styles.tabText, activeTab === 4 && styles.activeTabText]}>
              Completed
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading orders...</ThemedText>
        </View>
      )}

      {/* Loading / Error states (compact, UI unchanged) */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLOR.primary} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ThemedText style={{ color: COLOR.sub, marginBottom: 10 }}>
            Failed to load orders.
          </ThemedText>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
              title="Pull to refresh"
              titleColor={COLOR.sub}
            />
          }
          renderItem={({ item }) => {
            // Always use order_no if available, fallback to id
            const orderId = item?.order_no || `Ord-${item?.id}`;
            const storesCount = Array.isArray(item?.store_orders)
              ? item.store_orders.length
              : (item?.items ? 1 : 0); // If items array exists, count as 1 store
            // Handle different total field names
            const total = item?.grand_total ?? item?.subtotal_with_shipping ?? item?.total ?? 0;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("OrderDetails", {
                    order: item, // pass full object for the details screen
                  })
                }
              >
                {/* Left icon bubble (hardcoded visual) */}
                <View style={styles.iconBubble}>
                  <Ionicons name="cart-outline" size={25} color={COLOR.primary} />
                </View>

                {/* Middle text */}
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.orderId} numberOfLines={1}>
                    {orderId}
                  </ThemedText>
                  <ThemedText style={styles.storesTxt}>{storesCount} stores</ThemedText>
                </View>

                {/* Right amount */}
                <ThemedText style={styles.amount}>{currency(total)}</ThemedText>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ marginTop: 40, alignItems: "center" }}>
              <ThemedText style={{ color: COLOR.sub }}>No orders yet.</ThemedText>
            </View>
          }
        />
      )}
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

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 14,
    // ...shadow(6),
  },
  iconBubble: {
    width: 51,
    height: 51,
    borderRadius: 35,
    backgroundColor: "#B9191933",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderId: { color: COLOR.text, fontWeight: "600", fontSize: 14 },
  storesTxt: { color: COLOR.sub, marginTop: 4, fontSize: 10 },
  amount: { color: "#E53E3E", fontWeight: "800", fontSize: 14 },

  retryBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header loading styles
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLOR.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerLoadingText: {
    marginLeft: 8,
    color: COLOR.sub,
    fontSize: 14,
    fontWeight: "500",
  },

  // Tabs styles
  tabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    minWidth: 80,
  },
  activeTab: {
    borderBottomColor: COLOR.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR.sub,
  },
  activeTabText: {
    color: COLOR.primary,
    fontWeight: "700",
  },
});
