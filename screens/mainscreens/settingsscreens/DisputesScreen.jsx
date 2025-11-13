// screens/DisputesScreen.jsx
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../../components/ThemedText";
import { useAllDisputes } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

/* ---- Theme ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

export default function DisputesScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // 'all' | 'open' | 'resolved'

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch disputes
  const { data: disputesData, isLoading, error } = useAllDisputes();

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['allDisputes'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Process disputes data
  const disputes = useMemo(() => {
    if (!disputesData?.data) return [];
    return disputesData.data.map((dispute) => ({
      id: dispute.id,
      category: dispute.category,
      details: dispute.details,
      status: dispute.status,
      wonBy: dispute.won_by,
      storeOrderId: dispute.store_order?.id,
      storeName: dispute.store?.name || dispute.store?.store_name || "Store",
      createdAt: formatDate(dispute.created_at),
      lastMessage: dispute.last_message?.message || null,
      lastMessageTime: dispute.last_message?.created_at
        ? formatDate(dispute.last_message.created_at)
        : null,
    }));
  }, [disputesData]);

  // Filter disputes based on tab
  const filteredDisputes = useMemo(() => {
    let filtered = disputes;

    // Filter by status
    if (tab === "open") {
      filtered = filtered.filter((dispute) => dispute.status === "open" || dispute.status === "pending");
    } else if (tab === "resolved") {
      filtered = filtered.filter(
        (dispute) => dispute.status === "resolved" || dispute.status === "closed"
      );
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      filtered = filtered.filter(
        (dispute) =>
          dispute.category.toLowerCase().includes(searchTerm) ||
          dispute.details?.toLowerCase().includes(searchTerm) ||
          dispute.storeName.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [disputes, tab, query]);

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
      case "pending":
        return "#FF6B6B";
      case "resolved":
        return "#4CAF50";
      case "closed":
        return "#9E9E9E";
      default:
        return COLOR.sub;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() =>
        navigation.navigate("SettingsNavigator", {
          screen: "DisputeChat",
          params: { disputeId: item.id },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <Image
          source={require("../../../assets/image copy.png")}
          style={styles.ticketAvatar}
        />
        <View style={styles.ticketInfo}>
          <ThemedText style={styles.ticketSubject} numberOfLines={1}>
            {item.category}
          </ThemedText>
          <ThemedText style={styles.ticketStore} numberOfLines={1}>
            {item.storeName}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {item.details && (
        <ThemedText style={styles.ticketDescription} numberOfLines={2}>
          {item.details}
        </ThemedText>
      )}

      {item.lastMessage && (
        <View style={styles.lastMessageRow}>
          <ThemedText style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage}
          </ThemedText>
        </View>
      )}

      <View style={styles.ticketFooter}>
        <ThemedText style={styles.ticketDate}>{item.createdAt}</ThemedText>
        {item.wonBy && (
          <View style={styles.wonByBadge}>
            <ThemedText style={styles.wonByText}>
              {item.wonBy === "buyer" ? "Won" : "Lost"}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.circleBtn}
          >
            <Ionicons name="chevron-back" size={20} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText
            font="oleo"
            style={styles.headerTitle}
            numberOfLines={1}
            pointerEvents="none"
          >
            My Disputes
          </ThemedText>

          <View style={styles.circleBtn} />
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLOR.sub} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search disputes..."
            placeholderTextColor={COLOR.sub}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLOR.sub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "all" && styles.activeTab]}
          onPress={() => setTab("all")}
        >
          <ThemedText
            style={[styles.tabText, tab === "all" && styles.activeTabText]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "open" && styles.activeTab]}
          onPress={() => setTab("open")}
        >
          <ThemedText
            style={[styles.tabText, tab === "open" && styles.activeTabText]}
          >
            Open
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "resolved" && styles.activeTab]}
          onPress={() => setTab("resolved")}
        >
          <ThemedText
            style={[styles.tabText, tab === "resolved" && styles.activeTabText]}
          >
            Resolved
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading disputes...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.sub} />
          <ThemedText style={styles.errorText}>
            Failed to load disputes. Please try again.
          </ThemedText>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => queryClient.invalidateQueries({ queryKey: ['allDisputes'] })}
          >
            <ThemedText style={styles.retryBtnText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDisputes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={COLOR.sub} />
              <ThemedText style={styles.emptyText}>
                {query.trim()
                  ? "No disputes found matching your search"
                  : "No disputes yet"}
              </ThemedText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR.primary,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLOR.text,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLOR.chip,
  },
  activeTab: {
    backgroundColor: COLOR.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLOR.sub,
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ticketAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOR.text,
    marginBottom: 4,
  },
  ticketStore: {
    fontSize: 12,
    color: COLOR.sub,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  ticketDescription: {
    fontSize: 13,
    color: COLOR.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  lastMessageRow: {
    marginBottom: 8,
  },
  lastMessageText: {
    fontSize: 12,
    color: COLOR.sub,
    fontStyle: "italic",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
  },
  ticketDate: {
    fontSize: 11,
    color: COLOR.sub,
  },
  wonByBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLOR.primary + "20",
  },
  wonByText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLOR.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLOR.primary,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
  },
});

