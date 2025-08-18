import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ThemedText from "../../../components/ThemedText"; // 👈 import ThemedText

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

const CHATS = [
  {
    id: "1",
    name: "Sasha Stores",
    avatar: "https://i.pravatar.cc/100?img=65",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 1,
  },
  {
    id: "2",
    name: "Vee Stores",
    avatar: "https://i.pravatar.cc/100?img=47",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 1,
  },
  {
    id: "3",
    name: "Adam Stores",
    avatar: "https://i.pravatar.cc/100?img=36",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 0,
  },
  {
    id: "4",
    name: "Scent Villa Stores",
    avatar:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 0,
  },
  {
    id: "5",
    name: "Power Stores",
    avatar:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 0,
  },
  {
    id: "6",
    name: "Creamlia Stores",
    avatar:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 0,
  },
  {
    id: "7",
    name: "Dannova Stores",
    avatar:
      "https://images.unsplash.com/photo-1521579770471-740fe0cf4be0?q=80&w=200&auto=format&fit=crop",
    lastMessage: "How will i get my goods delivered ?",
    time: "Today | 07:22 AM",
    unread: 0,
  },
];

export default function ChatListScreen({ navigation }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return CHATS;
    return CHATS.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term)
    );
  }, [q]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() =>
        navigation.navigate('ServiceNavigator', {
          screen:"ChatDetails",
          store: {
            id: item.id,
            name: item.name,
            profileImage: item.avatar, // or your API avatar field
          },
          chat_id: item.id,
        })
      }
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
            <ThemedText font="oleo" style={styles.headerTitle}>Chats</ThemedText>

            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="cart-outline" size={18} color="#EF534E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="notifications-outline" size={18} color="#EF534E" />
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
              <MaterialCommunityIcons name="camera-outline" size={20} color="#101318" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: { flex: 1, backgroundColor: "#F9F9F9" },
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
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
  },
  headerIcons: { flexDirection: "row", gap: 10 },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLOR.text,
  },
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
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "700", color: COLOR.text },
  preview: { fontSize: 12, color: COLOR.sub, marginTop: 2 },
  rightCol: { alignItems: "flex-end", gap: 6 },
  time: { fontSize: 10, color: "#9BA0A6" },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: "#EF534E",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
