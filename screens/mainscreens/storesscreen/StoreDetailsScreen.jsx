// app/store-details.tsx  (or app/(service)/store-details.tsx)
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

const { width } = Dimensions.get("window");
const COLOR = {
  primary: "#EF534E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  pill: "#F1F2F5",
  success: "#2ECC71",
};

const COVER_H = 210;
const AVATAR = 56;

/** replace these PNGs with your local assets if you have them */
const SOCIAL_ICONS = [
  { id: "wa", uri: "https://img.icons8.com/color/48/whatsapp--v1.png" },
  { id: "ig", uri: "https://img.icons8.com/color/48/instagram-new--v1.png" },
  { id: "x",  uri: "https://img.icons8.com/ios-filled/50/x.png" },
  { id: "fb", uri: "https://img.icons8.com/color/48/facebook-new.png" },
];

/** promo banner image (whole card is an image) */
const PROMO_URI =
  "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1600&auto=format&fit=crop";

const MOCK_PRODUCTS = [
  { id: "p1", name: "Dell Inspiron Laptop", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80", rating: 4.5, sponsored: true },
  { id: "p2", name: "Sasha Stores",        img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80", rating: 4.5, sponsored: true },
  { id: "p3", name: "Macbook Pro",         img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=80", rating: 4.7 },
  { id: "p4", name: "iPhone 15",           img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80", rating: 4.6 },
];

export default function StoreDetailsScreen() {
  // read params from expo-router
  const { store: storeParam } = useLocalSearchParams();
  const store = useMemo(() => {
    try {
      if (Array.isArray(storeParam)) return JSON.parse(storeParam[0]);
      if (typeof storeParam === "string") return JSON.parse(storeParam);
    } catch {}
    return {};
  }, [storeParam]);

  const [tab, setTab] = useState("Products");
  const [query, setQuery] = useState("");

  const products = useMemo(() => {
    if (!query) return MOCK_PRODUCTS;
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const renderProduct = ({ item }) => (
    <View style={styles.prodCard}>
      <View style={styles.prodCoverWrap}>
        <Image source={{ uri: item.img }} style={styles.prodImg} />
        {item.sponsored && (
          <View style={styles.sponsored}>
            <Text style={styles.sponsoredTxt}>Sponsored</Text>
          </View>
        )}
        <View style={styles.prodRating}>
          <Ionicons name="star" size={10} color={COLOR.primary} />
          <Text style={styles.prodRatingTxt}>{item.rating}</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.prodName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverWrap}>
          <Image source={{ uri: store.cover }} style={styles.cover} />
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <Ionicons name="chevron-back" size={18} color={COLOR.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="search" size={16} color={COLOR.text} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="share-social-outline" size={16} color={COLOR.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Image source={{ uri: store.avatar }} style={styles.avatar} />
        </View>

        {/* Header content */}
        <View style={styles.headerContent}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Text numberOfLines={1} style={styles.storeName}>{store.name}</Text>
              <Ionicons name="shield-checkmark" size={16} color={COLOR.primary} />
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followTxt}>Follow</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Ionicons name="ellipse" size={8} color="#fff" />
              <Text style={styles.statusTxt}>Open Now · 07:00AM - 08:00PM</Text>
            </View>
          </View>

          {/* Contact + meta */}
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={16} color={COLOR.sub} />
            <Text style={styles.metaTxt}>sashastores@gmail.com</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={16} color={COLOR.sub} />
            <Text style={styles.metaTxt}>070123456789</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={COLOR.sub} />
            <Text style={styles.metaTxt}>Lagos, Nigeria </Text>
            <Text style={[styles.metaTxt, { color: COLOR.primary, textDecorationLine: "underline" }]}>
              View Store Addresses
            </Text>
          </View>

          <View style={styles.tagsRow}>
            {store.tags?.map((t, i) => (
              <View key={t} style={[styles.tag, i === 0 ? styles.tagBlue : styles.tagRed]}>
                <Text style={[styles.tagTxt, i === 0 ? styles.tagTxtBlue : styles.tagTxtRed]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* STATS CARD with red announcement inside */}
        <View style={styles.statsCard}>
          <View style={styles.statsTop}>
            <View style={styles.statCol}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={COLOR.text} />
              <Text style={styles.statLabel}>Qty Sold</Text>
              <Text style={styles.statValue}>100</Text>
            </View>
            <View style={styles.vline} />
            <View style={styles.statCol}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color={COLOR.text} />
              <Text style={styles.statLabel}>Followers</Text>
              <Text style={styles.statValue}>500</Text>
            </View>
            <View style={styles.vline} />
            <View style={styles.statCol}>
              <Ionicons name="star" size={18} color={COLOR.primary} />
              <Text style={styles.statLabel}>Ratings</Text>
              <Text style={styles.statValue}>4.7</Text>
            </View>
          </View>

          <View style={styles.statsBottom}>
            <Ionicons name="megaphone-outline" size={16} color="#fff" />
            <Text style={styles.announceTxt}>New arrivals coming tomorrow</Text>
          </View>
        </View>

        {/* SOCIAL ICONS – images */}
        <View style={styles.socialCard}>
          {SOCIAL_ICONS.map((s) => (
            <TouchableOpacity key={s.id} style={styles.socialBtn}>
              <Image source={{ uri: s.uri }} style={styles.socialImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* PROMO – whole card is an image */}
        <View style={{ marginHorizontal: 16, marginTop: 12 }}>
          <Image source={{ uri: PROMO_URI }} style={styles.promoImage} />
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 12 }}>
          <BigBtn title="Call" color={COLOR.primary} textColor="#fff" />
          <BigBtn title="Chat" color="#101318" textColor="#fff" />
          <BigBtn title="Leave a store review" color="#2DBE60" textColor="#fff" />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["Products", "Social Feed", "Reviews"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabItem, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search + filter */}
        {tab === "Products" && (
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLOR.sub} />
              <TextInput
                placeholder="Search store products"
                placeholderTextColor={COLOR.sub}
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, color: COLOR.text }}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Product grid */}
        {tab === "Products" && (
          <FlatList
            data={products}
            keyExtractor={(i) => i.id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 12 }}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const BigBtn = ({ title, color, textColor }) => (
  <TouchableOpacity style={[styles.bigBtn, { backgroundColor: color }]}>
    <Text style={[styles.bigBtnTxt, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

function shadow(e = 6) {
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
  coverWrap: { position: "relative" },
  cover: { width, height: COVER_H },
  topBar: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", ...shadow(8),
  },
  avatar: {
    position: "absolute",
    left: 16,
    bottom: -AVATAR / 2,
    width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2,
    borderWidth: 4, borderColor: "#fff", backgroundColor: "#fff",
  },

  headerContent: { paddingTop: AVATAR / 2 + 12, paddingHorizontal: 16, paddingBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  storeName: { fontSize: 20, fontWeight: "800", color: COLOR.text, flex: 1 },
  followBtn: {
    backgroundColor: COLOR.primary, paddingHorizontal: 16, height: 32,
    borderRadius: 16, alignItems: "center", justifyContent: "center",
  },
  followTxt: { color: "#fff", fontWeight: "700" },
  statusRow: { marginTop: 6, marginBottom: 8 },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: COLOR.success, borderRadius: 14,
    paddingHorizontal: 10, height: 24, alignSelf: "flex-start",
  },
  statusTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  metaTxt: { color: COLOR.sub, fontSize: 13 },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagBlue: { backgroundColor: "#E9F0FF", borderWidth: 1, borderColor: "#3D71FF" },
  tagRed: { backgroundColor: "#FFE7E6" },
  tagTxt: { fontWeight: "700", fontSize: 12 },
  tagTxtBlue: { color: "#3D71FF" },
  tagTxtRed: { color: COLOR.primary },

  /* Stats card */
  statsCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    ...shadow(10),
  },
  statsTop: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "stretch",
  },
  statCol: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: { color: COLOR.sub, fontSize: 11 },
  statValue: { color: COLOR.text, fontSize: 16, fontWeight: "800" },
  vline: { width: 1, backgroundColor: "#EEE", marginVertical: 4 },

  statsBottom: {
    backgroundColor: COLOR.primary,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  announceTxt: { color: "#fff", fontWeight: "700" },

  /* Social row as images */
  socialCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 10,
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#EEE",
    alignItems: "center", justifyContent: "center",
  },
  socialImg: { width: 26, height: 26, resizeMode: "contain" },

  /* Promo image card */
  promoImage: {
    width: "100%",
    height: 170,
    borderRadius: 16,
  },

  bigBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", ...shadow(6) },
  bigBtnTxt: { fontWeight: "800" },

  tabs: {
    marginTop: 14, marginHorizontal: 16, backgroundColor: "#fff",
    borderRadius: 12, flexDirection: "row", padding: 6, ...shadow(6),
  },
  tabItem: { flex: 1, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: COLOR.primary },
  tabTxt: { color: COLOR.text, fontWeight: "700" },
  tabTxtActive: { color: "#fff" },

  searchRow: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 12, alignItems: "center" },
  searchBar: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 10,
    height: 42, flexDirection: "row", alignItems: "center", gap: 8, ...shadow(4),
  },
  filterBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", ...shadow(4) },

  prodCard: { width: (width - 16 * 2 - 12) / 2, backgroundColor: "#fff", borderRadius: 14, ...shadow(6) },
  prodCoverWrap: { borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: "hidden", position: "relative" },
  prodImg: { width: "100%", height: 120 },
  sponsored: { position: "absolute", left: 6, top: 6, backgroundColor: "#fff", borderRadius: 6, paddingHorizontal: 8, height: 22, alignItems: "center", justifyContent: "center" },
  sponsoredTxt: { color: COLOR.sub, fontSize: 10, fontWeight: "700" },
  prodRating: { position: "absolute", right: 6, bottom: 6, backgroundColor: "#fff", borderRadius: 6, paddingHorizontal: 6, height: 20, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4 },
  prodRatingTxt: { fontSize: 10, color: COLOR.sub, fontWeight: "700" },
  prodName: { padding: 8, color: COLOR.text, fontWeight: "700" },
});
