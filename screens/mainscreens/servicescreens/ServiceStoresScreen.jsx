// screens/services/ServiceStoresScreen.jsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

import { useServicesByCategory } from "../../../config/api.config";
import { useAllBrands } from "../../../config/api.config";
import { useStores } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";


/* ------------ THEME ------------ */
const COLOR = {
  primary: "#E53E3E",
  bg: "#FFFFFF",
  text: "#1A1A1A",
  sub: "#6C727A",
  line: "#E6E6E6",
  chip: "#EDEDED",
  chipSelectedBg: "#FDE9E9",
  chipSelectedBorder: "#F6B6B6",
};

function shadow(e = 14) {
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

/* ------------ MOCK DATA FOR FILTERS ------------ */
const POPULAR_STATES = [
  "All Lagos State",
  "Lagos State",
  "Oyo State",
  "FCT , Abuja",
  "Rivers State",
];
const ALL_STATES = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
];

const POPULAR_STORES = ["Sasha Stores", "Adam Stores"];
const ALL_STORES = [
  "Tarra Stores",
  "Vee Stores",
  "Adewale Stores",
  "Favour Stores",
  "Scent Villa Stores",
];

const SERVICES = ["Apple", "Samsung", "Tecno", "Gucci", "Nike", "Adidas"];

const PRICE_BUCKETS = [
  "Under 100k",
  "100k - 200k",
  "200k - 300k",
  "Above 300k",
];

const RATINGS = ["All", "4 - 5 Stars", "3 - 4 Stars", "Under 4 Stars"];
const SORTS = ["Recommended", "Newest", "Lowest Price", "Highest Price"];

/* ------------ BOTTOM SHEET WRAPPER ------------ */
const BottomSheet = ({ visible, onClose, title, children }) => {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <ThemedText style={styles.sheetTitle}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

/* ------------ MAIN ------------ */
export default function ServiceStoresScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceTitle, categoryId } = route.params ?? { serviceTitle: "Service", categoryId: 1 };
  
  // Fetch services by category from API
  const { data: servicesData, isLoading, error } = useServicesByCategory(categoryId);
  
  // API calls for filters
  const { data: storesData, isLoading: storesLoading } = useStores();
  const { data: brandsData, isLoading: brandsLoading } = useAllBrands();
  
  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Helper function for URLs
  const HOST = "https://colala.hmstech.xyz";
  const absUrl = (u) => (u?.startsWith("http") ? u : `${HOST}${u || ""}`);

  // Process API data for filters
  const apiStores = storesData?.data || [];
  const apiBrands = brandsData?.data || [];

  // Create filter options from API data
  const storeOptions = apiStores.map(store => ({
    id: store.id,
    name: store.store_name,
    location: store.store_location,
    profileImage: store.profile_image ? absUrl(`/storage/${store.profile_image}`) : null,
  }));

  const brandOptions = apiBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    logo: brand.logo ? absUrl(`/storage/${brand.logo}`) : null,
  }));
  
  // Helper function to format price
  const formatPrice = (priceFrom, priceTo) => {
    const from = Number(priceFrom || 0);
    const to = Number(priceTo || 0);
    return `₦${from.toLocaleString()} - ₦${to.toLocaleString()}`;
  };
  
  // Helper function to get service image
  const getServiceImage = (service) => {
    // For now, use default images since service images aren't in the API response
    const defaultImages = [
      require("../../../assets/Rectangle 32.png"),
      require("../../../assets/Frame 264 (4).png"),
      require("../../../assets/Frame 264 (5).png"),
    ];
    return defaultImages[service.id % defaultImages.length];
  };

  const filtersOrder = [
    "Location",
    "Store",
    "Services",
    "Price",
    "Ratings",
    "Sort by",
  ];

  // picked values (shown directly on chips)
  const [picked, setPicked] = useState({
    Location: null,
    Store: null,
    Services: null,
    Price: null,
    Ratings: null,
    "Sort by": null,
  });

  // which sheet is open
  const [sheet, setSheet] = useState(null);

  // temp for min/max price (only case needing Apply)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const openSheet = (key) => setSheet(key);
  const closeSheet = () => setSheet(null);
  const clearPick = (key) => setPicked((p) => ({ ...p, [key]: null }));

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch all queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['servicesByCategory', categoryId] }),
        queryClient.invalidateQueries({ queryKey: ['stores'] }),
        queryClient.invalidateQueries({ queryKey: ['allBrands'] }),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, categoryId]);

  /* ------------ STORE CARDS ------------ */
  const stores = useMemo(() => {
    if (!servicesData?.data?.services || servicesData.data.services.length === 0) {
      return [];
    }
    
    return servicesData.data.services.map((service) => ({
      id: service.id.toString(),
      name: "Store Name", // Default since store info isn't in service data
      price: formatPrice(service.price_from, service.price_to),
      image: getServiceImage(service),
      rating: 4.5, // Default rating
      profileImage: require("../../../assets/Ellipse 18.png"),
      service: service.name,
      serviceData: service, // Keep original service data for navigation
    }));
  }, [servicesData]);

  /* ------------ RENDER ------------ */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.primary} />
          </TouchableOpacity>
          <ThemedText font="oleo" style={styles.headerTitle}>
            {serviceTitle}
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
              <Image
                source={require("../../../assets/cart-icon.png")}
                style={styles.iconImg}
              />
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
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
          <Image
            source={require("../../../assets/camera-icon.png")}
            style={styles.iconImg}
          />{" "}
        </View>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading...</ThemedText>
        </View>
      )}

      {/* Filters grid */}
      <View style={styles.filterContainer}>
        {filtersOrder.map((label) => {
          const value = picked[label];
          const selected = !!value;
          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.filterButton,
                selected && {
                  backgroundColor: COLOR.chipSelectedBg,
                  borderColor: COLOR.chipSelectedBorder,
                  borderWidth: 1,
                },
              ]}
              onPress={() => openSheet(label)}
              activeOpacity={0.9}
            >
              <View style={styles.chipLeft}>
                {/* For selected Sort by, show a funnel icon like the mock */}
                {label === "Sort by" && selected && (
                  <Ionicons
                    name="filter-outline"
                    size={14}
                    color={COLOR.primary}
                    style={{ marginRight: 6 }}
                  />
                )}
                <ThemedText
                  style={[
                    styles.filterText,
                    selected && { color: COLOR.primary, fontWeight: "700" },
                  ]}
                  numberOfLines={1}
                >
                  {selected ? value : label}
                </ThemedText>
              </View>

              {/* Right icon: chevron when not selected; X to clear when selected */}
              {selected ? (
                <TouchableOpacity
                  onPress={() => clearPick(label)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={14} color={COLOR.primary} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-down" size={14} color={COLOR.text} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Store Cards */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Failed to load services</ThemedText>
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No services available</ThemedText>
          <ThemedText style={styles.emptySubText}>
            There are no services in this category at the moment.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={stores}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.cardHeader}>
                <Image source={item.profileImage} style={styles.profileImage} />
                <ThemedText style={styles.storeName}>{item.name}</ThemedText>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={COLOR.primary} />
                  <ThemedText style={styles.rating}>{item.rating}</ThemedText>
                </View>
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={styles.serviceName}>{item.service}</ThemedText>
                <ThemedText style={styles.price}>{item.price}</ThemedText>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => {
                    console.log("Navigating to ServiceDetails with service:", item.serviceData);
                    navigation.navigate("ServiceDetails", { service: item.serviceData });
                  }}
                >
                  <ThemedText style={styles.detailsText}>Details</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* -------- Location Sheet -------- */}
      <BottomSheet
        visible={sheet === "Location"}
        onClose={closeSheet}
        title="Location"
      >
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={COLOR.sub}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search location"
            placeholderTextColor={COLOR.sub}
            style={{ flex: 1, color: COLOR.text }}
          />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <ThemedText style={styles.groupTitle}>Popular</ThemedText>
          {POPULAR_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.listRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Location: s }));
                closeSheet();
              }}
            >
              <ThemedText style={styles.listMain}>{s}</ThemedText>
              <ThemedText style={styles.listSub}>5,000 products</ThemedText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLOR.text}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          ))}

          <ThemedText style={[styles.groupTitle, { marginTop: 14 }]}>
            All States
          </ThemedText>
          {ALL_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.listRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Location: s }));
                closeSheet();
              }}
            >
              <ThemedText style={styles.listMain}>{s}</ThemedText>
              <ThemedText style={styles.listSub}>5,000 products</ThemedText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLOR.text}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* -------- Store Sheet -------- */}
      <BottomSheet
        visible={sheet === "Store"}
        onClose={closeSheet}
        title="Store"
      >
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={COLOR.sub}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search Stores"
            placeholderTextColor={COLOR.sub}
            style={{ flex: 1, color: COLOR.text }}
          />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {storesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.loadingText}>Loading stores...</ThemedText>
            </View>
          ) : storeOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={COLOR.sub} />
              <ThemedText style={styles.emptyText}>No stores available</ThemedText>
            </View>
          ) : (
            <>
              <ThemedText style={styles.groupTitle}>All Stores</ThemedText>
              {storeOptions.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.storeRow}
                  onPress={() => {
                    setPicked((p) => ({ ...p, Store: store.name }));
                    closeSheet();
                  }}
                >
                  <Image
                    source={store.profileImage ? { uri: store.profileImage } : require("../../../assets/Ellipse 18.png")}
                    style={styles.avatar}
                  />
                  <View>
                    <ThemedText style={styles.listMain}>{store.name}</ThemedText>
                    <ThemedText style={styles.listSub}>
                      {store.location}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </BottomSheet>

      {/* -------- Services Sheet -------- */}
      <BottomSheet
        visible={sheet === "Services"}
        onClose={closeSheet}
        title="Store"
      >
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={COLOR.sub}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search Services"
            placeholderTextColor={COLOR.sub}
            style={{ flex: 1, color: COLOR.text }}
          />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {brandsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.loadingText}>Loading brands...</ThemedText>
            </View>
          ) : brandOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color={COLOR.sub} />
              <ThemedText style={styles.emptyText}>No brands available</ThemedText>
            </View>
          ) : (
            brandOptions.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.simpleRow}
                onPress={() => {
                  setPicked((p) => ({ ...p, Services: brand.name }));
                  closeSheet();
                }}
              >
                <View style={styles.brandRow}>
                  {brand.logo && (
                    <Image
                      source={{ uri: brand.logo }}
                      style={styles.brandLogo}
                    />
                  )}
                  <ThemedText style={styles.listMain}>{brand.name}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLOR.text} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </BottomSheet>

      {/* -------- Price Sheet -------- */}
      <BottomSheet
        visible={sheet === "Price"}
        onClose={closeSheet}
        title="Price"
      >
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16 }}>
          <View style={[styles.inputBox, { flex: 1 }]}>
            <TextInput
              placeholder="Min"
              placeholderTextColor={COLOR.sub}
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              style={{ color: COLOR.text }}
            />
          </View>
          <View style={[styles.inputBox, { flex: 1 }]}>
            <TextInput
              placeholder="Max"
              placeholderTextColor={COLOR.sub}
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
              style={{ color: COLOR.text }}
            />
          </View>
        </View>

        <ScrollView
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {PRICE_BUCKETS.map((p) => (
            <TouchableOpacity
              key={p}
              style={styles.bucketRow}
              onPress={() => {
                setPicked((v) => ({ ...v, Price: p }));
                setMinPrice("");
                setMaxPrice("");
                closeSheet();
              }}
            >
              <ThemedText style={[styles.listMain, { marginBottom: 0 }]}>
                {p}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ padding: 16 }}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => {
              const label = `${minPrice || "0"}k - ${maxPrice || "∞"}`;
              setPicked((p) => ({ ...p, Price: label }));
              setMinPrice("");
              setMaxPrice("");
              closeSheet();
            }}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              Apply
            </ThemedText>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* -------- Ratings Sheet -------- */}
      <BottomSheet
        visible={sheet === "Ratings"}
        onClose={closeSheet}
        title="Reviews"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {RATINGS.map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.radioRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Ratings: r }));
                closeSheet();
              }}
            >
              <ThemedText style={styles.listMain}>{r}</ThemedText>
              <View style={styles.radio} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* -------- Sort Sheet -------- */}
      <BottomSheet
        visible={sheet === "Sort by"}
        onClose={closeSheet}
        title="Sort By"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {SORTS.map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.radioRow}
              onPress={() => {
                setPicked((p) => ({ ...p, "Sort by": r }));
                closeSheet();
              }}
            >
              <ThemedText style={styles.listMain}>{r}</ThemedText>
              <View style={styles.radio} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

/* ------------ STYLES ------------ */
const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: "contain" },
  headerTitle: {
    position: "absolute",
    left: 160,
    right: 0,
    textAlign: "start",
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
    marginLeft: -120,
  },
  headerIcons: { flexDirection: "row" },
  backBtn: { backgroundColor: "#fff", padding: 6, borderRadius: 30, zIndex: 5 },
  icon: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
    marginLeft: 8,
  },

  searchContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  cameraIcon: { marginLeft: 8 },

  /* filter grid */
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  filterButton: {
    width: "31.8%",
    backgroundColor: COLOR.chip,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  filterText: {
    fontSize: 12,
    color: COLOR.text,
    fontWeight: "400",
    maxWidth: "85%",
  },

  /* cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
    width: "48.5%",
    ...shadow(6),
  },
  cardImage: { width: "100%", height: 100 },
  cardBody: { padding: 10, paddingTop: 0 },
  storeName: { fontSize: 12, fontWeight: "700" },
  price: {
    fontSize: 13,
    color: COLOR.primary,
    marginBottom: 6,
    fontWeight: "700",
  },
  detailsBtn: {
    backgroundColor: COLOR.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailsText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "400",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    padding: 6,
    backgroundColor: "#F2F2F2",
  },
  profileImage: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  rating: { fontSize: 10, marginLeft: 3, color: COLOR.text },
  serviceName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLOR.text,
    marginBottom: 4,
  },

  /* bottom sheet */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "82%",
    overflow: "hidden",
  },
  sheetHeader: {
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  sheetHandle: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
    width: 120,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E5E5",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR.text,
    marginTop: 8,
  },
  sheetClose: { position: "absolute", right: 12, top: 10, padding: 6 },

  searchBar: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    margin: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
  },
  groupTitle: {
    color: COLOR.text,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },

  listRow: {
    marginHorizontal: 16,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    marginBottom: 10,
  },
  listMain: { color: COLOR.text, fontWeight: "600", marginBottom: 3 },
  listSub: { color: COLOR.sub, fontSize: 11 },

  storeRow: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    marginBottom: 10,
  },
  avatar: { width: 34, height: 34, borderRadius: 17 },

  simpleRow: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  inputBox: {
    height: 48,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  bucketRow: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#EFEFEF",
    marginBottom: 10,
  },
  applyBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  radioRow: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#EFEFEF",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLOR.sub,
    marginLeft: "auto",
  },
  
  // Loading and error states
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
  },
  errorText: {
    color: COLOR.primary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLOR.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    color: COLOR.sub,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Brand row styles
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
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
});
