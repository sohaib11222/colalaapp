import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Text,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedText from "../../../components/ThemedText";
import { useChats, useCartQuantity } from "../../../config/api.config";

const { width } = Dimensions.get("window");
const COLOR = {
  primary: "#EF534E",
  primaryDark: "#E2443F",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  success: "#2ECC71",
  line: "#ECEEF2",
};

// ---- Fallback mock (kept hardcoded when API empty)
const CHATS = [
  {
    id: "1",
    chat_id: 1,
    name: "Sasha Stores",
    avatar: "https://i.pravatar.cc/100?img=65",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 1,
    store_order_id: 1,
  },
  {
    id: "2",
    chat_id: 2,
    name: "Vee Stores",
    avatar: "https://i.pravatar.cc/100?img=47",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 1,
    store_order_id: 2,
  },
  {
    id: "3",
    chat_id: 3,
    name: "Adam Stores",
    avatar: "https://i.pravatar.cc/100?img=36",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 0,
    store_order_id: 3,
  },
  {
    id: "4",
    chat_id: 4,
    name: "Scent Villa Stores",
    avatar:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 0,
    store_order_id: 4,
  },
  {
    id: "5",
    chat_id: 5,
    name: "Power Stores",
    avatar:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 0,
    store_order_id: 5,
  },
  {
    id: "6",
    chat_id: 6,
    name: "Creamlia Stores",
    avatar:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today / 07:22 AM",
    unread: 0,
    store_order_id: 6,
  },
];

// format “Today / 07:22 AM”
const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return isToday
    ? `Today / ${time}`
    : `${d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} / ${time}`;
};

export default function ChatListScreen({ navigation }) {
  const [q, setQ] = useState("");

  // Fetch chats with error handling
  const { data, isLoading, error, refetch, isFetching } = useChats();
  
  // Use shared cart quantity hook
  const { data: cartQuantity = 0, isLoading: isCartLoading } = useCartQuantity();

  // Refresh functionality
  const handleRefresh = async () => {
    try {
      console.log("Refreshing chats...");
      await refetch();
      console.log("Chats refreshed successfully");
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  // Map API → UI model with proper error handling
  const apiChats = useMemo(() => {
    const list = data?.data || [];
    if (!list?.length) return [];

    // Debug logging to see what data is available
    console.log("Chat API data sample:", list[0]);

    return list.map((c, idx) => ({
      id: String(c.chat_id),
      chat_id: c.chat_id, // IMPORTANT so details can fetch by chat id
      name: c.store || "Store",
      avatar: c.avatar || `https://i.pravatar.cc/100?img=${(idx % 70) + 1}`, // Use API avatar or fallback
      lastMessage: c.last_message || "No messages yet",
      time: formatTime(c.last_message_at),
      unread: Number(c.unread_count) || 0,
      store_order_id: c.store_order_id || c.chat_id || null, // Use chat_id as fallback if store_order_id is missing
    }));
  }, [data]);

  const source = apiChats.length ? apiChats : CHATS;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.lastMessage || "").toLowerCase().includes(term)
    );
  }, [q, source]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, index === filtered.length - 1 && styles.lastCard]}
      onPress={() => {
        console.log("Navigating to ChatDetails with data:", {
          name: item.name,
          avatar: item.avatar,
          chat_id: item.chat_id,
          store_order_id: item.store_order_id
        });
        navigation.navigate("ServiceNavigator", {
          screen: "ChatDetails",
          params: {
            store: {
              id: item.store_order_id, // not used by UI, kept for context
              name: item.name,
              profileImage: item.avatar, // Use the actual avatar from API
            },
            chat_id: item.chat_id, // used by detail screen to fetch messages
            store_order_id: item.store_order_id, // used for dispute creation
          },
        });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, paddingRight: 10 }}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.preview} numberOfLines={1}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <View style={styles.rightCol}>
        <ThemedText style={styles.time}>{item.time}</ThemedText>
        {item.unread > 0 ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.unread}</ThemedText>
          </View>
        ) : (
          <View style={{ height: 18 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[COLOR.primary, COLOR.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <ThemedText font="oleo" style={styles.headerTitle}>
              Chats
            </ThemedText>

            <View style={styles.iconRow}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ServiceNavigator", { screen: "Cart" })
                }
                style={[styles.iconButton, styles.iconPill]}
                accessibilityRole="button"
                accessibilityLabel="Open cart"
              >
                <View style={styles.cartIconContainer}>
                  <Image
                    source={require("../../../assets/cart-icon.png")}
                    style={styles.iconImg}
                  />
                  {cartQuantity > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {cartQuantity > 99 ? "99+" : cartQuantity}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ServiceNavigator", {
                    screen: "Notifications",
                  })
                }
                style={[styles.iconButton, styles.iconPill]}
                accessibilityRole="button"
                accessibilityLabel="Open notifications"
              >
                <Image
                  source={require("../../../assets/bell-icon.png")}
                  style={styles.iconImg}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search chat"
              placeholderTextColor="#9BA0A6"
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.camBtn}>
              {/* <Image
                source={require("../../../assets/camera-icon.png")}
                style={styles.iconImg}
              /> */}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Body */}
        <ScrollView
          style={styles.bodyContainer}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.loadingText}>
                Loading chats...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load chats. Please try again.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 24,
                flexGrow: 1,
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={handleRefresh}
                  tintColor={COLOR.primary}
                  colors={[COLOR.primary]}
                />
              }
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    No chats found
                  </ThemedText>
                </View>
              }
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    flexGrow: 1,
  },
  bodyContainer: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "400" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 60,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLOR.text },
  camBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.card,
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 15,
    elevation: 0.3,
  },
  lastCard: {
    marginBottom: 50,
  },
  avatar: { width: 53, height: 53, borderRadius: 35, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "700", color: COLOR.text },
  preview: { fontSize: 11, color: COLOR.sub, marginTop: 10 },
  rightCol: { alignItems: "flex-end", gap: 6 },
  time: { fontSize: 9, color: "#9BA0A6" },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "#EF534E",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },
  iconImg: { width: 22, height: 22, resizeMode: "contain" },

  cartIconContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLOR.sub,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLOR.primary,
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLOR.sub,
    fontSize: 14,
  },
});
