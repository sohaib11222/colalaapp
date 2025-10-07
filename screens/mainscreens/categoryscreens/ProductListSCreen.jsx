import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useCategoryProducts, useGetTopSelling } from "../../../config/api.config";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const HOST = "https://colala.hmstech.xyz";
const absUrl = (u) => (u?.startsWith("http") ? u : `${HOST}${u || ""}`);

import { useAllBrands } from "../../../config/api.config";
import { useStores } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

/* ------------ THEME FOR SHEETS (matches ServiceStoresScreen) ------------ */
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

/* ------------ MOCK DATA FOR FILTERS (same as ServiceStoresScreen) ------------ */
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

/* ------------ BOTTOM SHEET WRAPPER (same UI as ServiceStoresScreen) ------------ */
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

const ProductsListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const categoryTitle = route.params?.categoryTitle || (isTopSelling ? "Top Selling Products" : "Products");
  const categoryId = route.params?.categoryId;
  const fetchCategoryId = route.params?.fetchCategoryId || categoryId;
  const isTopSelling = route.params?.isTopSelling || false;

  console.log("CategoryTitle :", categoryTitle);
  console.log("CategoryID", categoryId);
  console.log("FetchedCategoryId", fetchCategoryId);
  console.log("IsTopSelling:", isTopSelling);

  // pagination
  const [page, setPage] = useState(1);
  
  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  
  // Use different API based on navigation source
  const categoryProductsQuery = useCategoryProducts(
    fetchCategoryId,
    page,
    { enabled: !isTopSelling }
  );
  
  const topSellingQuery = useGetTopSelling({
    enabled: isTopSelling
  });
  
  // Use the appropriate query result
  const { data, isLoading, isFetching, isError } = isTopSelling 
    ? topSellingQuery 
    : categoryProductsQuery;

  // API calls for filters
  const { data: storesData, isLoading: storesLoading } = useStores();
  const { data: brandsData, isLoading: brandsLoading } = useAllBrands();

  // Handle different API response structures
  const root = data?.data;
  let apiItems = [];
  let nextPageUrl = null;
  let apiTrending = [];
  let apiNewArrivals = [];

  if (isTopSelling) {
    // Top selling API returns data directly in data.data
    apiItems = Array.isArray(data?.data) ? data.data : [];
    console.log("Top Selling API Items:", apiItems);
  } else {
    // Updated category products API shape
    const allObj = root?.all_products;
    apiItems = Array.isArray(allObj?.data) ? allObj.data : [];
    nextPageUrl = allObj?.next_page_url;
    apiTrending = Array.isArray(root?.trending_products) ? root.trending_products : [];
    apiNewArrivals = Array.isArray(root?.new_arrivals) ? root.new_arrivals : [];
    console.log("Category API Items:", apiItems);
  }

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

  const brandIdToName = useMemo(() => {
    const map = new Map();
    brandOptions.forEach((b) => map.set(Number(b.id), String(b.name)));
    return map;
  }, [brandOptions]);

  // map API -> your card model (unchanged)
  const mapProductCard = (p) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const main = imgs.find((im) => Number(im.is_main) === 1) || imgs[0];
    const imageUri = main?.path ? absUrl(`/storage/${main.path}`) : null;

    const store = {
      name: p.store?.store_name || "Store",
      location: p.store?.store_location || "Lagos, Nigeria",
      rating: 4.5,
      logo: require("../../../assets/Ellipse 18.png"),
      background: require("../../../assets/Rectangle 30.png"),
    };

    const priceNum = Number(p.discount_price || p.price || 0);
    const origNum = Number(p.price || 0);
    const toNaira = (n) => `₦${Number(n).toLocaleString()}`;

    return {
      id: String(p.id),
      title: p.name || "Product",
      price: priceNum ? toNaira(priceNum) : toNaira(origNum),
      originalPrice:
        priceNum && origNum && priceNum < origNum ? toNaira(origNum) : "",
      image: imageUri ? { uri: imageUri } : require("../../../assets/phone5.png"),
      store,
      tagImages: [],
    };
  };

  // placeholder; defined after filter state to avoid TDZ issues
  let filteredApiItems = apiItems;
  let allProducts = useMemo(() => apiItems.map(mapProductCard), [apiItems]);

  const mapHorizontal = (p) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const main = imgs.find((im) => Number(im.is_main) === 1) || imgs[0];
    const imageUri = main?.path ? absUrl(`/storage/${main.path}`) : null;
    return {
      id: String(p.id),
      title: p.name || "Product",
      price: Number(p.discount_price || p.price || 0).toLocaleString(),
      image: imageUri ? { uri: imageUri } : require("../../../assets/phone3.png"),
      store: {
        name: p.store?.store_name || "Store",
        rating: 4.5,
        logo: require("../../../assets/Ellipse 18.png"),
        location: p.store?.store_location || "Lagos, Nigeria",
      },
    };
  };

  const trendingProducts = (apiTrending || []).map(mapHorizontal);
  const newArrivals = (apiNewArrivals || []).map(mapHorizontal);

  /* ---------- FILTER STATE (identical behavior/labels) ---------- */
  const filtersOrder = [
    "Location",
    "Store",
    "Brand",
    "Price",
    "Ratings",
    "Sort by",
  ];

  const [picked, setPicked] = useState(() => ({
    Location: null,
    Store: null,
    Brand: null,
    Price: null,
    Ratings: null,
    "Sort by": null,
  }));

  const [sheet, setSheet] = useState(null); // which sheet is open
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const openSheet = (key) => setSheet(key);
  const closeSheet = () => setSheet(null);
  const clearPick = (key) => setPicked((p) => ({ ...(p || {}), [key]: null }));

  /* ---------- RENDERERS (unchanged cards) ---------- */
  const renderHorizontalProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ProductDetails", {
          productId: item.id,
          product: item,
        })
      }
    >
      <View style={styles.horizontalCard}>
        <Image source={item.image} style={styles.horizontalImage} />
        <View
          style={[
            styles.rowBetween,
            { backgroundColor: "#F2F2F2", width: "100%", padding: 4 },
          ]}
        >
          <View style={styles.storeRow}>
            <Image source={item.store.logo} style={styles.storeAvatar} />
            <ThemedText style={styles.storeNameCard}>
              {item.store.name}
            </ThemedText>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color="red" size={12} />
            <ThemedText style={styles.rating}>{item.store.rating}</ThemedText>
          </View>
        </View>
        <View style={{ padding: 6 }}>
          <ThemedText numberOfLines={1} style={styles.productTitleCard}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.price}>₦{item.price}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAllProductCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetails", { product: item })}
    >
      <View style={styles.card}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View
          style={[
            styles.rowBetween,
            { backgroundColor: "#F2F2F2", width: "100%", padding: 5 },
          ]}
        >
          <View style={styles.storeRow}>
            <Image source={item.store.logo} style={styles.storeAvatar} />
            <ThemedText style={styles.storeNameCard}>
              {item.store.name}
            </ThemedText>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color="red" size={12} />
            <ThemedText style={styles.rating}>{item.store.rating}</ThemedText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.productTitleCard}>{item.title}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>{item.price}</ThemedText>
            {item.originalPrice ? (
              <ThemedText style={styles.originalPrice}>
                {item.originalPrice}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.tagsRow}>
            {item.tagImages?.map((tagImg, index) => (
              <Image
                key={index}
                source={tagImg}
                style={styles.tagIcon}
                resizeMode="contain"
              />
            ))}
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color="#444"
                style={{ marginRight: 2 }}
              />
              <ThemedText style={styles.location}>
                {item.store.location || "Lagos, Nigeria"}
              </ThemedText>
            </View>
            <TouchableOpacity>
              <Image
                source={require("../../../assets/Frame 265.png")}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const loadMore = () => {
    if (isFetching) return;
    // Only load more for category products (top selling doesn't have pagination)
    if (!isTopSelling && nextPageUrl) {
      setPage((p) => p + 1);
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reset page to 1 and invalidate queries
      setPage(1);
      if (isTopSelling) {
        await queryClient.invalidateQueries({ queryKey: ['topSelling'] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['categoryProducts', fetchCategoryId] });
      }
      // Also refresh filter data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stores'] }),
        queryClient.invalidateQueries({ queryKey: ['allBrands'] })
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, isTopSelling, fetchCategoryId]);

  // Recompute filtered items after picked is defined
  filteredApiItems = useMemo(() => {
    try {
      let items = Array.isArray(apiItems) ? [...apiItems] : [];
      const sel = picked || {};

      if (sel.Location) {
        const q = String(sel.Location).toLowerCase();
        items = items.filter((p) => String(p.store?.store_location || '').toLowerCase() === q);
      }

      if (sel.Store) {
        const q = String(sel.Store).toLowerCase();
        items = items.filter((p) => String(p.store?.store_name || '').toLowerCase() === q);
      }

      if (sel.Brand) {
        items = items.filter((p) => {
          const name = brandIdToName.get(Number(p.brand)) || '';
          return String(name).toLowerCase() === String(sel.Brand).toLowerCase();
        });
      }

      if (sel.Price) {
        const label = String(sel.Price);
        const priceValue = (prod) => Number(prod.discount_price || prod.price || 0);
        if (/Under\s*100k/i.test(label)) items = items.filter((p) => priceValue(p) < 100000);
        else if (/100k\s*-\s*200k/i.test(label)) items = items.filter((p) => priceValue(p) >= 100000 && priceValue(p) <= 200000);
        else if (/200k\s*-\s*300k/i.test(label)) items = items.filter((p) => priceValue(p) >= 200000 && priceValue(p) <= 300000);
        else if (/Above\s*300k/i.test(label)) items = items.filter((p) => priceValue(p) > 300000);
        else if (/k\s*-\s*/i.test(label)) {
          const parts = label.split('-').map((s) => s.trim());
          const toN = (s) => Number(String(s).replace(/[^0-9]/g, '')) * 1000;
          const min = toN(parts[0] || '0');
          const max = toN(parts[1] || '0') || Number.MAX_SAFE_INTEGER;
          items = items.filter((p) => {
            const v = priceValue(p);
            return v >= min && v <= max;
          });
        }
      }

      if (sel.Ratings && sel.Ratings !== 'All') {
        const ratingOf = (p) => Number(p.store?.average_rating ?? 0);
        const lbl = sel.Ratings;
        if (/4\s*-\s*5/i.test(lbl)) items = items.filter((p) => ratingOf(p) >= 4);
        else if (/3\s*-\s*4/i.test(lbl)) items = items.filter((p) => ratingOf(p) >= 3 && ratingOf(p) < 4);
        else if (/Under\s*4/i.test(lbl)) items = items.filter((p) => ratingOf(p) < 4);
      }

      if (sel['Sort by']) {
        const sort = sel['Sort by'];
        if (/Newest/i.test(sort)) items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (/Lowest\s*Price/i.test(sort)) items.sort((a, b) => Number(a.discount_price || a.price || 0) - Number(b.discount_price || b.price || 0));
        else if (/Highest\s*Price/i.test(sort)) items.sort((a, b) => Number(b.discount_price || b.price || 0) - Number(a.discount_price || a.price || 0));
      }

      return items;
    } catch {
      return Array.isArray(apiItems) ? apiItems : [];
    }
  }, [apiItems, picked, brandIdToName]);

  allProducts = useMemo(() => filteredApiItems.map(mapProductCard), [filteredApiItems]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color="#E53E3E" />
          <ThemedText style={styles.headerLoadingText}>Loading products...</ThemedText>
        </View>
      )}

      {/* HEADER (unchanged) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              padding: 6,
              borderRadius: 30,
              marginLeft: 8,
              zIndex: 5,
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>

          <ThemedText font="oleo" style={styles.headerTitle}>
            {categoryTitle}
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
          />
        </View>
      </View>

      {/* FILTER GRID – now opens the same dropdown sheets and shows picked values */}
      <View style={styles.filterContainer}>
        {["Location", "Store", "Brand", "Price", "Ratings", "Sort by"].map(
          (label) => {
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexShrink: 1,
                  }}
                >
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

                {selected ? (
                  <TouchableOpacity
                    onPress={() => clearPick(label)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color={COLOR.primary} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
                )}
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* CONTENT */}
      {isLoading && !allProducts.length ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={{ padding: 16 }}>
          <ThemedText>Failed to load products</ThemedText>
        </View>
      ) : allProducts.length === 0 ? (
        <View
          style={{
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <ThemedText
            style={{
              color: "#888",
              textAlign: "center",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            No products found
          </ThemedText>
          <ThemedText
            style={{ color: "#666", textAlign: "center", fontSize: 14 }}
          >
            There are no products available in this category at the moment.
          </ThemedText>
        </View>
      ) : (
        <ScrollView>
          {/* TRENDING PRODUCTS */}
          {trendingProducts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Trending Products
                </ThemedText>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={trendingProducts}
                renderItem={renderHorizontalProduct}
                keyExtractor={(item) => "trend-" + item.id}
                contentContainerStyle={{ paddingHorizontal: 10 }}
              />
            </>
          )}

          {/* NEW ARRIVALS */}
          {newArrivals.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  New Arrivals
                </ThemedText>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={newArrivals}
                renderItem={renderHorizontalProduct}
                keyExtractor={(item) => "new-" + item.id}
                contentContainerStyle={{ paddingHorizontal: 10 }}
              />
            </>
          )}

          {/* ALL PRODUCTS */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>All Products</ThemedText>
          </View>
          <FlatList
            data={allProducts}
            renderItem={renderAllProductCard}
            keyExtractor={(item) => "all-" + item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: -10, justifyContent: "space-evenly" }}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#E53E3E']}
                tintColor={'#E53E3E'}
                title="Pull to refresh"
                titleColor={'#6C727A'}
              />
            }
            ListFooterComponent={
              isFetching && nextPageUrl ? (
                <View style={{ paddingVertical: 16 }}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        </ScrollView>
      )}

      {/* -------- Location Sheet -------- */}
      <BottomSheet
        visible={sheet === "Location"}
        onClose={closeSheet}
        title="Location"
      >
        <View style={sheetStyles.searchBar}>
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
          <ThemedText style={sheetStyles.groupTitle}>Popular</ThemedText>
          {POPULAR_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={sheetStyles.listRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Location: s }));
                closeSheet();
              }}
            >
              <ThemedText style={sheetStyles.listMain}>{s}</ThemedText>
              <ThemedText style={sheetStyles.listSub}>
                5,000 products
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLOR.text}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          ))}

          <ThemedText style={[sheetStyles.groupTitle, { marginTop: 14 }]}>
            All States
          </ThemedText>
          {ALL_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={sheetStyles.listRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Location: s }));
                closeSheet();
              }}
            >
              <ThemedText style={sheetStyles.listMain}>{s}</ThemedText>
              <ThemedText style={sheetStyles.listSub}>
                5,000 products
              </ThemedText>
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
        <View style={sheetStyles.searchBar}>
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
            <View style={sheetStyles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={sheetStyles.loadingText}>Loading stores...</ThemedText>
            </View>
          ) : storeOptions.length === 0 ? (
            <View style={sheetStyles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={COLOR.sub} />
              <ThemedText style={sheetStyles.emptyText}>No stores available</ThemedText>
            </View>
          ) : (
            <>
              <ThemedText style={sheetStyles.groupTitle}>All Stores</ThemedText>
              {storeOptions.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={sheetStyles.storeRow}
                  onPress={() => {
                    setPicked((p) => ({ ...p, Store: store.name }));
                    closeSheet();
                  }}
                >
                  <Image
                    source={store.profileImage ? { uri: store.profileImage } : require("../../../assets/Ellipse 18.png")}
                    style={sheetStyles.avatar}
                  />
                  <View>
                    <ThemedText style={sheetStyles.listMain}>{store.name}</ThemedText>
                    <ThemedText style={sheetStyles.listSub}>
                      {store.location}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </BottomSheet>

      {/* -------- Brand/Services Sheet -------- */}
      <BottomSheet
        visible={sheet === "Brand"}
        onClose={closeSheet}
        title="Store"
      >
        <View style={sheetStyles.searchBar}>
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
            <View style={sheetStyles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={sheetStyles.loadingText}>Loading brands...</ThemedText>
            </View>
          ) : brandOptions.length === 0 ? (
            <View style={sheetStyles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color={COLOR.sub} />
              <ThemedText style={sheetStyles.emptyText}>No brands available</ThemedText>
            </View>
          ) : (
            brandOptions.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={sheetStyles.simpleRow}
                onPress={() => {
                  setPicked((p) => ({ ...p, Brand: brand.name }));
                  closeSheet();
                }}
              >
                <View style={sheetStyles.brandRow}>
                  {brand.logo && (
                    <Image
                      source={{ uri: brand.logo }}
                      style={sheetStyles.brandLogo}
                    />
                  )}
                  <ThemedText style={sheetStyles.listMain}>{brand.name}</ThemedText>
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
          <View style={[sheetStyles.inputBox, { flex: 1 }]}>
            <TextInput
              placeholder="Min"
              placeholderTextColor={COLOR.sub}
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              style={{ color: COLOR.text }}
            />
          </View>
          <View style={[sheetStyles.inputBox, { flex: 1 }]}>
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
              style={sheetStyles.bucketRow}
              onPress={() => {
                setPicked((v) => ({ ...v, Price: p }));
                setMinPrice("");
                setMaxPrice("");
                closeSheet();
              }}
            >
              <ThemedText style={[sheetStyles.listMain, { marginBottom: 0 }]}>
                {p}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ padding: 16 }}>
          <TouchableOpacity
            style={sheetStyles.applyBtn}
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
              style={sheetStyles.radioRow}
              onPress={() => {
                setPicked((p) => ({ ...p, Ratings: r }));
                closeSheet();
              }}
            >
              <ThemedText style={sheetStyles.listMain}>{r}</ThemedText>
              <View style={sheetStyles.radio} />
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
              style={sheetStyles.radioRow}
              onPress={() => {
                setPicked((p) => ({ ...p, "Sort by": r }));
                closeSheet();
              }}
            >
              <ThemedText style={sheetStyles.listMain}>{r}</ThemedText>
              <View style={sheetStyles.radio} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ProductsListScreen;

/* ---------------- your existing styles (UNTOUCHED) ---------------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#E53E3E",
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    zIndex: 1,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    marginLeft: -150,
    fontWeight: "400",
  },
  headerIcons: {
    flexDirection: "row",
  },
  searchContainer: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    height: 57,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  cameraIcon: {
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  filterButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexBasis: "32%",
  },
  filterText: {
    fontSize: 12,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 25,
    paddingHorizontal: -5,
    paddingTop: 20,
    rowGap: -25,
    columnGap: 5,
  },
  // (kept as-is even though duplicate)
  filterButton: {
    width: "30%",
    backgroundColor: "#EDEDED",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 7,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // (kept as-is even though duplicate)
  filterText: {
    fontSize: 12,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E53E3E",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  viewAll: {
    color: "#fff",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  horizontalCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 10,
    width: 160,
    overflow: "hidden",
    elevation: 1,
  },
  horizontalImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
    width: cardWidth,
    overflow: "hidden",
    elevation: 1,
  },
  iconButton: {
    marginLeft: 9,
  },
  image: { width: "100%", height: 120 },
  infoContainer: { padding: 10 },
  storeNameCard: { fontSize: 12, color: "#E53E3E", fontWeight: "400" },
  productTitleCard: { fontSize: 13, fontWeight: "500", marginVertical: 4 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  price: { color: "#F44336", fontWeight: "700", fontSize: 14, marginRight: 6 },
  originalPrice: {
    color: "#999",
    fontSize: 10,
    textDecorationLine: "line-through",
  },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  rating: { marginLeft: 2, fontSize: 11, color: "#000" },
  tagsRow: { flexDirection: "row", marginTop: 3, gap: 3 },
  tagIcon: { width: 70, height: 20, borderRadius: 50 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  location: { fontSize: 9, color: "#444", fontWeight: "500" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeRow: { flexDirection: "row", alignItems: "center" },
  storeAvatar: { width: 20, height: 20, borderRadius: 12, marginRight: 6 },
  iconRow: { flexDirection: "row" },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },
  iconImg: { width: 22, height: 22, resizeMode: "contain" },
});

/* -------- bottom-sheet specific styles (kept separate to avoid touching your styles) -------- */
const sheetStyles = StyleSheet.create({
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
    flexDirection: "column",
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

  // Loading and empty states
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEDEF",
  },
  headerLoadingText: {
    marginLeft: 8,
    color: "#6C727A",
    fontSize: 14,
    fontWeight: "500",
  },
});
