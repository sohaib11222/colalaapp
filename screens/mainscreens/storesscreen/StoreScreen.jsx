// screens/StoresScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  // Text, // (kept import unchanged if you prefer; safe to remove)
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText"; // <-- adjust path if needed

const { width } = Dimensions.get("window");

/* -------------------- THEME -------------------- */
const COLOR = {
  primary: "#EF534E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#E9EBEF",
  pill: "#F1F2F5",
};

/* -------------------- MOCK DATA -------------------- */
const STORES = [
  {
    id: "1",
    name: "Sasha Stores",
    cover:
      "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
  {
    id: "2",
    name: "Vee Stores",
    cover:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
  {
    id: "3",
    name: "Adam Stores",
    cover:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
  {
    id: "4",
    name: "Scent Villa Stores",
    cover:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
  {
    id: "5",
    name: "Caremal Stores",
    cover:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1542736667-069246bdbc74?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
  {
    id: "6",
    name: "Lovina Stores",
    cover:
      "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=1600&auto=format&fit=crop",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
    tags: ["Electronics", "Phones"],
    rating: 4.5,
  },
];

/* ---- Layout sizing ---- */
const CARD_GAP = 10;
const SCREEN_PADDING = 10;
const CARD_WIDTH = (width - SCREEN_PADDING * 2 - CARD_GAP) / 2;
const COVER_HEIGHT = 100; // reduced
const AVATAR_SIZE = 49;   // reduced

export default function StoresScreen() {
  const [query, setQuery] = useState("");
  const navigation = useNavigation();
  const [filters, setFilters] = useState({
    location: "Location",
    category: "Category",
    review: "Review",
  });

  const data = useMemo(() => {
    if (!query.trim()) return STORES;
    const q = query.toLowerCase();
    return STORES.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query]);

  const onFilterPress = key => {
    setFilters(prev => ({
      ...prev,
      [key]:
        prev[key] === (key === "location" ? "Lagos" : key === "category" ? "Phones" : "4.5+")
          ? key === "location"
            ? "Location"
            : key === "category"
              ? "Category"
              : "Review"
          : key === "location"
            ? "Lagos"
            : key === "category"
              ? "Phones"
              : "4.5+",
    }));
  };

  const renderStore = ({ item }) => (
    <View style={styles.card}>
      {/* full-bleed cover image */}
      <Image source={{ uri: item.cover }} style={styles.cover} />

      {/* overlapping avatar */}
      <Image
        source={{ uri: item.avatar }}
        style={[styles.avatar, { top: COVER_HEIGHT - AVATAR_SIZE / 2 }]}
      />

      {/* content */}
      <View style={[styles.content, { paddingTop: AVATAR_SIZE / 2 + 6 }]}>
        <View style={styles.rowBetween}>
          <ThemedText numberOfLines={1} style={styles.storeName}>
            {item.name}
          </ThemedText>

          <View style={styles.rating}>
            <Ionicons name="star" size={10} color={COLOR.primary} />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {item.tags.map((tag, idx) => (
            <View
              key={tag}
              style={[styles.tagBase, idx === 0 ? styles.tagBlue : styles.tagRed]}
            >
              <ThemedText
                style={[styles.tagTextBase, idx === 0 ? styles.tagTextBlue : styles.tagTextRed]}
              >
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cta}

          onPress={() =>
            navigation.navigate('ServiceNavigator', {
              screen: 'StoreDetails',
              params: { store: item },      // <-- key change
            })
          }
        >
          <ThemedText style={styles.ctaText}>Go to Shop</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>
          <ThemedText font="oleo" style={styles.headerTitle}>Stores</ThemedText>
          <View style={styles.headerIcons}>
            <Ionicons name="cart-outline" size={22} color="#E53E3E" style={styles.icon} />
            <Ionicons name="notifications-outline" size={22} color="#E53E3E" style={styles.icon} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
          <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FilterPill label={filters.location} onPress={() => onFilterPress("location")} />
        <FilterPill label={filters.category} onPress={() => onFilterPress("category")} />
        <FilterPill label={filters.review} onPress={() => onFilterPress("review")} />
      </View>

      {/* Grid */}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={renderStore}
        columnWrapperStyle={{ gap: CARD_GAP }}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: 24,
          paddingTop: 8,
          gap: CARD_GAP,
        }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: COLOR.bg }}
      />
    </SafeAreaView>
  );
}

/* -------------------- Small Components -------------------- */
const FilterPill = ({ label, onPress }) => (
  <TouchableOpacity style={styles.filter} onPress={onPress} activeOpacity={0.8}>
    <ThemedText numberOfLines={1} style={styles.filterText}>
      {label}
    </ThemedText>
    <Ionicons name="chevron-down" size={14} color={COLOR.text} />
  </TouchableOpacity>
);

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },

  header: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },

  header: {
    backgroundColor: '#E53E3E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    // textAlign: 'center',
    color: '#fff',
    fontSize: 24,
    marginLeft: 12,
    fontWeight: '400',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  // backBtn: {
  //     backgroundColor: '#fff',
  //     padding: 6,
  //     borderRadius: 30,
  // },
  icon: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 30,
    marginLeft: 8,
  },
  searchContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  cameraIcon: {
    marginLeft: 8,
  },

  filtersRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
  },
  filter: {
    flex: 1,
    height: 36,
    backgroundColor: "#EDEDED",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    ...shadow(1),
  },
  filterText: { color: COLOR.text, fontSize: 12 },

  /* ---- Card ---- */
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLOR.card,
    borderRadius: 18,
    overflow: "visible", // allow avatar to hang over
    position: "relative",
    ...shadow(12),
  },
  cover: {
    width: "100%",
    height: COVER_HEIGHT,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  avatar: {
    position: "absolute",
    left: 16,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    // borderWidth: 4,
    // borderColor: "#fff",
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  storeName: { fontSize: 14, fontWeight: "700", color: COLOR.text, flex: 1 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 9, color: COLOR.sub, fontWeight: "600" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 10 },
  tagBase: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  tagBlue: { backgroundColor: "#E9F0FF", borderWidth: 1, borderColor: "#3D71FF" },
  tagRed: { backgroundColor: "#FFE7E6", borderWidth: 1, borderColor: "#E53E3E" },
  tagTextBase: { fontSize: 8, fontWeight: "600" },
  tagTextBlue: { color: "#3D71FF" },
  tagTextRed: { color: COLOR.primary },

  cta: {
    backgroundColor: COLOR.primary,
    height: 38, // reduced
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "400", fontSize: 9 },
});

/* --------- tiny shadow helper --------- */
function shadow(elevation = 6) {
  return Platform.select({
    android: { elevation },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: elevation / 2,
      shadowOffset: { width: 0, height: elevation / 3 },
    },
    default: {},
  });
}
