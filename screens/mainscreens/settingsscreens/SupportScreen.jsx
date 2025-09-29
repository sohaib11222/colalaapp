// screens/SupportScreen.jsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../../components/ThemedText";

import { useSupportTickets, useSupportTicketDetails, useSupportTicketMessage } from "../../../config/api.config";
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

  // Fetch support tickets
  const { data: ticketsData, isLoading, error } = useSupportTickets();

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

  // Process tickets data
  const tickets = useMemo(() => {
    if (!ticketsData?.data) return [];
    return ticketsData.data.map((ticket) => ({
      id: ticket.id,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      orderId: ticket.order_id,
      storeOrderId: ticket.store_order_id,
      createdAt: formatDate(ticket.created_at),
      unreadCount: ticket.unread_messages_count_count || 0,
      lastMessage: ticket.last_message?.message || null,
      lastMessageTime: ticket.last_message?.created_at ? formatDate(ticket.last_message.created_at) : null,
    }));
  }, [ticketsData]);

  // Filter tickets based on tab
  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    
    // Filter by status
    if (tab === "pending") {
      filtered = filtered.filter(ticket => ticket.status === "open");
    } else if (tab === "resolved") {
      filtered = filtered.filter(ticket => ticket.status === "closed" || ticket.status === "resolved");
    }
    
    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.category.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [tickets, tab, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <StatusBar style="light" />
      {/* Header (red, rounded bottom, with search inside) */}
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
            Support
          </ThemedText>

          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={COLOR.text}
            />
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
        <TabPill
          label="All"
          active={tab === "all"}
          onPress={() => setTab("all")}
        />
        <TabPill
          label="Pending"
          active={tab === "pending"}
          onPress={() => setTab("pending")}
        />
        <TabPill
          label="Resolved"
          active={tab === "resolved"}
          onPress={() => setTab("resolved")}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading support tickets...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Failed to load support tickets. Please try again.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 6,
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <ThemedText style={styles.emptyText}>
                {query.trim() 
                  ? "No tickets found matching your search"
                  : "Your support chat list is empty, contact support by clicking the plus icon"
                }
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.ticketCard}
              onPress={() => navigation.navigate("SupportDetails", { ticketId: item.id })}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <ThemedText style={styles.ticketSubject} numberOfLines={1}>
                    {item.subject}
                  </ThemedText>
                  <ThemedText style={styles.ticketCategory}>
                    {item.category}
                  </ThemedText>
                </View>
                <View style={styles.ticketMeta}>
                  <View style={[
                    styles.statusBadge,
                    item.status === "open" ? styles.statusOpen : styles.statusClosed
                  ]}>
                    <ThemedText style={[
                      styles.statusText,
                      item.status === "open" ? styles.statusTextOpen : styles.statusTextClosed
                    ]}>
                      {item.status}
                    </ThemedText>
                  </View>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <ThemedText style={styles.unreadText}>{item.unreadCount}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
              
              <ThemedText style={styles.ticketDescription} numberOfLines={2}>
                {item.description}
              </ThemedText>
              
              <View style={styles.ticketFooter}>
                <ThemedText style={styles.ticketDate}>
                  {item.createdAt}
                </ThemedText>
                {item.lastMessage && (
                  <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    Last: {item.lastMessage}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("SupportForm")} // <-- open form screen
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
    <ThemedText
      style={[
        styles.tabText,
        active ? styles.tabTextActive : styles.tabTextInactive,
      ]}
    >
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
    marginLeft: -180,
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
  tabInactive: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
  },
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
    fontSize: 16,
    color: COLOR.primary,
    textAlign: "center",
    lineHeight: 24,
  },

  // Ticket Card Styles
  ticketCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    ...shadow(2),
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOR.text,
    marginBottom: 4,
  },
  ticketCategory: {
    fontSize: 12,
    color: COLOR.sub,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketMeta: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusOpen: {
    backgroundColor: "#FEF3C7",
  },
  statusClosed: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusTextOpen: {
    color: "#D97706",
  },
  statusTextClosed: {
    color: "#059669",
  },
  unreadBadge: {
    backgroundColor: COLOR.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  ticketDescription: {
    fontSize: 14,
    color: COLOR.sub,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketDate: {
    fontSize: 12,
    color: COLOR.sub,
  },
  lastMessage: {
    fontSize: 12,
    color: COLOR.sub,
    fontStyle: "italic",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
});
