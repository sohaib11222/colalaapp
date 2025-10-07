import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

// API hooks
import { useStores, BASE_URL, useCategories } from "../../../config/api.config";

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

/* ---- Layout sizing ---- */
const CARD_GAP = 10;
const SCREEN_PADDING = 10;
const CARD_WIDTH = (width - SCREEN_PADDING * 2 - CARD_GAP) / 2;
const COVER_HEIGHT = 100; // reduced
const AVATAR_SIZE = 49;   // reduced

// Build absolute media url from API paths; fallback to null
const mediaUrl = (p) => {
  if (!p) return null;
  // BASE_URL = https://colala.hmstech.xyz/api  -> host = https://colala.hmstech.xyz
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  return `${host}/storage/${String(p).replace(/^\/?storage\/?/, "")}`;
};

// Placeholders (kept EXACTLY as your current hardcoded images)
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1600&auto=format&fit=crop";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop";

// NOTE (as requested): tags & rating are NOT in the response -> kept hardcoded
const HARDCODED_TAGS = ["Electronics", "Phones"];
const HARDCODED_RATING = 4.5;

export default function StoresScreen() {
  const [query, setQuery] = useState("");
  const navigation = useNavigation();

  // simple pills (local only; UI unchanged)
  const [filters, setFilters] = useState({
    location: "Location",
    category: "Category",
    review: "Review",
  });

  // Filter selections
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null); // e.g., 4.5, 4, 3

  // Fetch stores from API
  const { data, isLoading, isError, refetch, isFetching } = useStores();

  // Refresh functionality
  const handleRefresh = async () => {
    try {
      console.log("Refreshing stores...");
      await refetch();
      console.log("Stores refreshed successfully");
    } catch (error) {
      console.error("Error refreshing stores:", error);
    }
  };

  // Map API -> UI model while keeping non-response bits hardcoded
  const storesFromApi = useMemo(() => {
    const list = data?.data || [];
    return list.map((s) => {
      const cover = mediaUrl(s.banner_image) || FALLBACK_COVER;
      const avatar = mediaUrl(s.profile_image) || FALLBACK_AVATAR;
      const ratingVal = Number(s.average_rating ?? s.rating ?? HARDCODED_RATING) || HARDCODED_RATING;
      return {
        id: String(s.id),
        name: s.store_name || "Store",
        cover,
        avatar,
        // hardcoded bits (not in response)
        tags: HARDCODED_TAGS,
        rating: ratingVal,
        // keep original API store if you need it in details
        _api: s,
      };
    });
  }, [data]);

  // search + filters (local)
  const filtered = useMemo(() => {
    const base = storesFromApi || [];
    const q = (query || "").toLowerCase();
    const byText = q
      ? base.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s._api?.store_location?.toLowerCase()?.includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
        )
      : base;

    const locationOk = (s) =>
      !selectedLocation ||
      (s._api?.store_location || "").toLowerCase() === selectedLocation.toLowerCase();

    const categoryOk = (s) => {
      if (!selectedCategoryIds?.length) return true;
      const cats = Array.isArray(s._api?.categories) ? s._api.categories : [];
      return cats.some((c) => selectedCategoryIds.includes(c.id));
    };

    const reviewOk = (s) => {
      if (!selectedReview) return true;
      return Number(s.rating) >= Number(selectedReview);
    };

    return byText.filter((s) => locationOk(s) && categoryOk(s) && reviewOk(s));
  }, [query, storesFromApi, selectedLocation, selectedCategoryIds, selectedReview]);

  const onFilterPress = (key) => {
    if (key === "location") setLocationModalVisible(true);
    if (key === "category") setCategoryModalVisible(true);
    if (key === "review") setReviewModalVisible(true);
  };

  const renderStore = ({ item, index }) => {
    const totalItems = filtered.length;
    const isLastTwo = index >= totalItems - 2;

    return (
      <View style={[styles.card, isLastTwo ? styles.cardLastTwo : styles.cardRegular]}>
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
                key={`${item.id}-${tag}`}
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
              navigation.navigate("ServiceNavigator", {
                screen: "StoreDetails",
                params: { store: item, storeId: item._api?.id || item.id },
              })
            }

          >
            <ThemedText style={styles.ctaText}>Go to Shop</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>
          <ThemedText font="oleo" style={styles.headerTitle}>Stores</ThemedText>
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ServiceNavigator', { screen: 'Cart' })
              }
              style={[styles.iconButton, styles.iconPill]}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
            >
              <Image
                source={require('../../../assets/cart-icon.png')}
                style={styles.iconImg}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ServiceNavigator', { screen: 'Notifications' })
              }
              style={[styles.iconButton, styles.iconPill]}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <Image
                source={require('../../../assets/bell-icon.png')}
                style={styles.iconImg}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AuthNavigator', { screen: 'Search' })}
          style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
            editable={false}                // stop editing
            showSoftInputOnFocus={false}    // stop keyboard
            pointerEvents="none"            // let TouchableOpacity catch taps
          />
          <Image source={require('../../../assets/camera-icon.png')} style={styles.iconImg} />
        </TouchableOpacity>
      </View>

      {/* Filters (UI only; values are placeholders) */}
      <View style={styles.filtersRow}>
        <FilterPill label={selectedLocation || filters.location} onPress={() => onFilterPress("location")} />
        <FilterPill label={selectedCategoryIds.length ? `${selectedCategoryIds.length} Category` : filters.category} onPress={() => onFilterPress("category")} />
        <FilterPill label={selectedReview ? `${selectedReview}+` : filters.review} onPress={() => onFilterPress("review")} />
      </View>

      {/* Grid */}
      {isLoading && !filtered.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading stores...</ThemedText>
        </View>
      ) : (
        <FlatList
        data={filtered}
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
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: COLOR.bg }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={COLOR.primary}
            colors={[COLOR.primary]}
          />
        }
        // optional simple empty states without changing layout
        ListEmptyComponent={
          !isLoading && (
            <View style={{ padding: 44, alignItems: "center", }}>
              <ThemedText style={{ color: COLOR.sub }}>No stores found.</ThemedText>
            </View>
          )
        }
      />
      )}
      {/* Modals */}
      <LocationFilterModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        setFilters={setFilters}
      />
      <CategoryFilterModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        setFilters={setFilters}
      />
      <ReviewFilterModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        selectedReview={selectedReview}
        setSelectedReview={setSelectedReview}
        setFilters={setFilters}
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

/* -------------------- Filter Modals -------------------- */
function LocationFilterModal({ visible, onClose, selectedLocation, setSelectedLocation, setFilters }) {
  const LOCATIONS = ["Lagos, Nigeria", "Abuja, Nigeria", "Kano, Nigeria", "Port Harcourt, Nigeria"];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: '70%' }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Location</ThemedText>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={styles.selectorRow}
                onPress={() => {
                  // Toggle selection; tap again to deselect
                  const next = selectedLocation === loc ? null : loc;
                  setSelectedLocation(next);
                  setFilters((p) => ({ ...p, location: next || 'Location' }));
                }}
              >
                <ThemedText style={{ color: COLOR.text }}>{loc}</ThemedText>
                {selectedLocation === loc ? (
                  <Ionicons name="checkmark" size={18} color={COLOR.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSelectedLocation(null);
                setFilters((p) => ({ ...p, location: 'Location' }));
              }}
            >
              <ThemedText style={{ color: COLOR.text }}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={onClose}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function CategoryFilterModal({ visible, onClose, selectedCategoryIds, setSelectedCategoryIds, setFilters }) {
  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data || [];

  const toggle = (id) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: '80%' }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Category</ThemedText>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {categories.map((c) => (
              <TouchableOpacity key={c.id} style={styles.selectorRow} onPress={() => toggle(c.id)}>
                <ThemedText style={{ color: COLOR.text }}>{c.title}</ThemedText>
                {selectedCategoryIds.includes(c.id) ? (
                  <Ionicons name="checkmark" size={18} color={COLOR.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedCategoryIds([])}>
              <ThemedText style={{ color: COLOR.text }}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                setFilters((p) => ({ ...p, category: selectedCategoryIds.length ? `${selectedCategoryIds.length} Category` : 'Category' }));
                onClose();
              }}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReviewFilterModal({ visible, onClose, selectedReview, setSelectedReview, setFilters }) {
  const OPTIONS = [4.5, 4, 3, 2];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: '60%' }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Review</ThemedText>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
          {OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.selectorRow}
              onPress={() => {
                // Toggle; tap again to deselect
                const next = selectedReview === r ? null : r;
                setSelectedReview(next);
                setFilters((p) => ({ ...p, review: next ? `${next}+` : 'Review' }));
              }}
            >
              <ThemedText style={{ color: COLOR.text }}>{`${r}+`}</ThemedText>
              {selectedReview === r ? <Ionicons name="checkmark" size={18} color={COLOR.primary} /> : null}
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setSelectedReview(null);
                setFilters((p) => ({ ...p, review: 'Review' }));
              }}
            >
              <ThemedText style={{ color: COLOR.text }}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },

  /* Loading */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },

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
    color: '#fff',
    fontSize: 24,
    marginLeft: 12,
    fontWeight: '400',
  },
  headerIcons: { flexDirection: 'row' },
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
  iconRow: { flexDirection: 'row' },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: '#fff', padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: 'contain' },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  cameraIcon: { marginLeft: 8 },

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

  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetHandle: { alignSelf: 'center', width: 68, height: 6, borderRadius: 999, backgroundColor: '#D8DCE2', marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: COLOR.text },
  sheetClose: { borderColor: '#000', borderWidth: 1.2, borderRadius: 20, padding: 2 },
  selectorRow: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLOR.line, paddingHorizontal: 12, paddingVertical: 14, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  applyBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: COLOR.primary, alignItems: 'center', justifyContent: 'center', marginTop: 12 },

  /* ---- Card ---- */
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLOR.card,
    borderRadius: 18,
    overflow: "visible", // allow avatar to hang over
    position: "relative",
    ...shadow(12),
  },
  cardRegular: {
    marginBottom: 16, // Regular margin for most cards
  },
  cardLastTwo: {
    marginBottom: 50, // Larger margin for last two cards
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
