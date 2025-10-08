// screens/FollowedStoresScreen.jsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

const { width } = Dimensions.get("window");


import { useGetFollowedStores } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";


/* -------------------- THEME -------------------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  pill: "#EDEDED",
};

/* -------------------- MOCK FOLLOWED -------------------- */
const INITIAL_FOLLOWED = [
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
const COVER_HEIGHT = 100;
const AVATAR_SIZE = 44;

/* ------------ BOTTOM SHEET WRAPPER ------------ */
const BottomSheet = ({ visible, onClose, title, children }) => {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={sheetStyles.sheetContainer}>
          <View style={sheetStyles.sheetHeader}>
            <View style={sheetStyles.sheetHandle} />
            <ThemedText style={sheetStyles.sheetTitle}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={sheetStyles.sheetClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default function FollowedStoresScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "Location",
    category: "Category",
    review: "Review",
  });

  // Modal state (like SavedItemsScreen)
  const [picker, setPicker] = useState(null);

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // API Integration
  const { data: followedStoresRes, isLoading, error } = useGetFollowedStores();
  const apiStores = followedStoresRes?.data || [];

  // Map API data to component format
  const mapApiStoreToComponent = (apiStore) => ({
    id: String(apiStore.store_id),
    name: apiStore.store_name,
    cover: apiStore.banner_image,
    avatar: apiStore.profile_image,
    tags: apiStore.categories?.map(cat => cat.title) || ["Electronics", "Phones"], // Use actual categories from API
    rating: 4.5, // Default rating since not provided in API
    email: apiStore.store_email,
    phone: apiStore.store_phone,
    followed_at: apiStore.followed_at,
  });

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch followed stores query
      await queryClient.invalidateQueries({ queryKey: ['followedStores'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Only use API data, no fallback to dummy data
  const allStores = useMemo(() => {
    return apiStores.map(mapApiStoreToComponent);
  }, [apiStores]);

  const visibleData = useMemo(() => {
    let filtered = allStores;
    
    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    
    // Location filter
    if (filters.location !== "Location") {
      filtered = filtered.filter((s) => {
        // Find the original API store data to get actual location
        const originalStore = apiStores.find(apiStore => String(apiStore.store_id) === s.id);
        return originalStore?.store_location === filters.location;
      });
    }
    
    // Category filter
    if (filters.category !== "Category") {
      filtered = filtered.filter((s) => {
        // Find the original API store data to get actual categories
        const originalStore = apiStores.find(apiStore => String(apiStore.store_id) === s.id);
        return originalStore?.categories?.some(cat => cat.title === filters.category);
      });
    }
    
    // Review filter
    if (filters.review !== "Review") {
      const minRating = parseFloat(filters.review.replace(/[^\d.]/g, ''));
      filtered = filtered.filter((s) => s.rating >= minRating);
    }
    
    return filtered;
  }, [query, allStores, filters]);

  const onFilterPress = (key) => {
    setPicker(key);
  };

  // Get categories and locations from actual API data
  const getCategoriesFromAPI = () => {
    const allCategories = new Set();
    apiStores.forEach(store => {
      if (store.categories) {
        store.categories.forEach(cat => {
          if (cat.title) {
            allCategories.add(cat.title);
          }
        });
      }
    });
    return ['All', ...Array.from(allCategories).sort()];
  };

  const getLocationsFromAPI = () => {
    const allLocations = new Set();
    apiStores.forEach(store => {
      if (store.store_location) {
        allLocations.add(store.store_location);
      }
    });
    return ['All', ...Array.from(allLocations).sort()];
  };

  // Filter options (using actual API data)
  const LOCATIONS = getLocationsFromAPI();
  const CATEGORIES = getCategoriesFromAPI();
  const RATINGS = ['All', '4.5+ Stars', '4.0+ Stars', '3.5+ Stars', '3.0+ Stars'];

  const renderPicker = (type) => {
    const options = type === 'location' ? LOCATIONS : type === 'category' ? CATEGORIES : RATINGS;
    const currentValue = type === 'location' ? filters.location : type === 'category' ? filters.category : filters.review;
    const isDefault = currentValue === (type === 'location' ? 'Location' : type === 'category' ? 'Category' : 'Review');

    return (
      <Modal visible={picker === type} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <Pressable style={pickerStyles.modalBackdrop} onPress={() => setPicker(null)}>
          <View style={pickerStyles.sheet}>
            {options.map(opt => (
              <TouchableOpacity 
                key={opt} 
                style={pickerStyles.sheetItem} 
                onPress={() => { 
                  setFilters((prev) => ({
                    ...prev,
                    [type]: opt === 'All' ? (type === 'location' ? 'Location' : type === 'category' ? 'Category' : 'Review') : opt
                  }));
                  setPicker(null); 
                }}
              >
                <ThemedText style={[
                  pickerStyles.sheetText, 
                  (isDefault ? opt === 'All' : currentValue === opt) && { color: COLOR.primary, fontWeight: '600' }
                ]}>
                  {opt}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
  };

  const renderStore = ({ item }) => (
    <View style={styles.card}>
      {/* full-bleed cover */}
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
            <Ionicons name="star" size={12} color={COLOR.primary} />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {item.tags.map((tag, idx) => (
            <View
              key={tag}
              style={[
                styles.tagBase,
                idx === 0 ? styles.tagBlue : styles.tagRed,
              ]}
            >
              <ThemedText
                style={[
                  styles.tagTextBase,
                  idx === 0 ? styles.tagTextBlue : styles.tagTextRed,
                ]}
              >
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() =>
            navigation.navigate("ServiceNavigator", {
              screen: "StoreDetails",
              params: { store: item },
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
      {/* ===== Header (white, no radius) ===== */}
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
            Search
          </ThemedText>

          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="cart-outline" size={20} color={COLOR.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading followed stores...</ThemedText>
        </View>
      )}

      {/* ===== Search bar (outside header) ===== */}
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Stores"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
        {/* spacer to balance layout */}
        <View style={{ width: 20 }} />
      </View>

      {/* Filters row (3 pills) */}
      <View style={styles.filtersRow}>
        <FilterPill
          label={filters.location}
          onPress={() => onFilterPress("location")}
        />
        <FilterPill
          label={filters.category}
          onPress={() => onFilterPress("category")}
        />
        <FilterPill
          label={filters.review}
          onPress={() => onFilterPress("review")}
        />
      </View>

      {/* Results label */}
      <ThemedText style={styles.resultCount}>
        Search Results ({visibleData.length})
      </ThemedText>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading followed stores...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.sub} />
          <ThemedText style={styles.loadingText}>Failed to load followed stores</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { marginTop: 16 }]}
            onPress={onRefresh}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : allStores.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="heart-outline" size={48} color={COLOR.sub} />
          <ThemedText style={styles.loadingText}>No followed stores yet</ThemedText>
          <ThemedText style={[styles.loadingText, { marginTop: 8, fontSize: 12 }]}>
            Start following stores to see them here
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={visibleData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderStore}
          columnWrapperStyle={{ gap: CARD_GAP }}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingBottom: 24,
            paddingTop: 8,
            gap: CARD_GAP,
          }}
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
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: COLOR.bg }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={COLOR.sub} />
              <ThemedText style={styles.emptyTitle}>
                No stores found
              </ThemedText>
              <ThemedText style={styles.emptySub}>
                Try adjusting your search or filters
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Filter Pickers (like SavedItemsScreen) */}
      {renderPicker('location')}
      {renderPicker('category')}
      {renderPicker('review')}
    </SafeAreaView>
  );
}

/* -------------------- Small inline component -------------------- */
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

  // Header: white, no radius, thin bottom divider
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
    zIndex: 2,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
    zIndex: 0,
  },

  // Search (outside header)
  searchContainer: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  // Filters row (three pills)
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
  },
  filter: {
    flex: 1,
    height: 36,
    backgroundColor: COLOR.pill,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    ...shadow(1),
  },
  filterText: { color: COLOR.text, fontSize: 12 },

  // Results label
  resultCount: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 4,
    paddingBottom: 6,
    color: COLOR.sub,
    fontSize: 12,
  },

  /* ---- Card ---- */
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLOR.card,
    borderRadius: 18,
    overflow: "visible",
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
    backgroundColor: "#fff",
  },
  content: { paddingHorizontal: 14, paddingBottom: 12 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  storeName: { fontSize: 15, fontWeight: "700", color: COLOR.text, flex: 1 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 11, color: COLOR.sub, fontWeight: "600" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 10 },
  tagBase: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagBlue: {
    backgroundColor: "#E9F0FF",
    borderWidth: 1,
    borderColor: "#3D71FF",
  },
  tagRed: {
    backgroundColor: "#FFE7E6",
    borderWidth: 1,
    borderColor: COLOR.primary,
  },
  tagTextBase: { fontSize: 12, fontWeight: "600" },
  tagTextBlue: { color: "#3D71FF" },
  tagTextRed: { color: COLOR.primary },

  cta: {
    backgroundColor: COLOR.primary,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "400", fontSize: 11 },

  emptyWrap: { alignItems: "center", marginTop: 40 },
  emptyTitle: { fontWeight: "700", color: COLOR.text, fontSize: 16 },
  emptySub: { color: COLOR.sub, marginTop: 6, fontSize: 12 },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: COLOR.sub,
    marginTop: 12,
    fontSize: 14,
  },

  // Header loading styles
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLOR.card,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerLoadingText: {
    marginLeft: 8,
    color: COLOR.sub,
    fontSize: 14,
    fontWeight: "500",
  },

  // Retry button styles
  retryButton: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
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

/* -------- Simple picker styles (like SavedItemsScreen) -------- */
const pickerStyles = StyleSheet.create({
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.25)', 
    justifyContent: 'flex-end' 
  },
  sheet: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16 
  },
  sheetItem: { 
    paddingVertical: 12, 
    paddingHorizontal: 6 
  },
  sheetText: { 
    fontSize: 16, 
    color: COLOR.text 
  },
});
