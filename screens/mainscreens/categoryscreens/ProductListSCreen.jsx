import React, { useMemo, useState } from "react";
import {
  View, TouchableOpacity, StyleSheet, FlatList, Image, TextInput,
  SafeAreaView, ScrollView, Dimensions, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useCategoryProducts } from "../../../config/api.config";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const HOST = "https://colala.hmstech.xyz";
const absUrl = (u) => (u?.startsWith("http") ? u : `${HOST}${u || ""}`);

const ProductsListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const categoryTitle = route.params?.categoryTitle || "Products";
  const categoryId = route.params?.categoryId;        // subcategory user tapped
  const fetchCategoryId = route.params?.fetchCategoryId || categoryId; // parent (if provided)

  // pagination
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useCategoryProducts(fetchCategoryId, page);

  const pageObj = data?.data;
  const apiItems = Array.isArray(pageObj?.data) ? pageObj.data : [];
  const nextPageUrl = pageObj?.next_page_url;

  // map API -> your card model (no UI change)
  const allProducts = useMemo(() => {
    return apiItems.map((p) => {
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
      const origNum  = Number(p.price || 0);
      const toNaira  = (n) => `₦${Number(n).toLocaleString()}`;

      return {
        id: String(p.id),
        title: p.name || "Product",
        price: priceNum ? toNaira(priceNum) : toNaira(origNum),
        originalPrice: priceNum && origNum && priceNum < origNum ? toNaira(origNum) : "",
        image: imageUri ? { uri: imageUri } : require("../../../assets/phone5.png"),
        store,
        tagImages: [],
      };
    });
  }, [apiItems]);

  // Simple heuristics (no backend flags yet)
  const newestFirst = [...apiItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newArrivals = newestFirst.slice(0, 6).map((p) => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const main = imgs.find((im) => Number(im.is_main) === 1) || imgs[0];
    const imageUri = main?.path ? absUrl(`/storage/${main.path}`) : null;
    return {
      id: String(p.id),
      title: p.name || "Product",
      price: (Number(p.discount_price || p.price || 0)).toLocaleString(),
      image: imageUri ? { uri: imageUri } : require("../../../assets/phone3.png"),
      store: {
        name: p.store?.store_name || "Store",
        rating: 4.5,
        logo: require("../../../assets/Ellipse 18.png"),
        location: p.store?.store_location || "Lagos, Nigeria",
      },
    };
  });

  const trendingProducts = newArrivals; // placeholder until backend adds a signal

  const filters = ['Location', 'Store', 'Brand', 'Price', 'Ratings', 'Sort by'];

  const renderHorizontalProduct = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", {  productId: item.id, product: item  })}>
      <View style={styles.horizontalCard}>
        <Image source={item.image} style={styles.horizontalImage} />
        <View style={[styles.rowBetween, { backgroundColor: "#F2F2F2", width: "100%", padding: 4 }]}>
          <View style={styles.storeRow}>
            <Image source={item.store.logo} style={styles.storeAvatar} />
            <ThemedText style={styles.storeNameCard}>{item.store.name}</ThemedText>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color="red" size={12} />
            <ThemedText style={styles.rating}>{item.store.rating}</ThemedText>
          </View>
        </View>
        <View style={{ padding: 6 }}>
          <ThemedText numberOfLines={1} style={styles.productTitleCard}>{item.title}</ThemedText>
          <ThemedText style={styles.price}>₦{item.price}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAllProductCard = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { product: item })}>
      <View style={styles.card}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View style={[styles.rowBetween, { backgroundColor: "#F2F2F2", width: "100%", padding: 5 }]}>
          <View style={styles.storeRow}>
            <Image source={item.store.logo} style={styles.storeAvatar} />
            <ThemedText style={styles.storeNameCard}>{item.store.name}</ThemedText>
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
              <ThemedText style={styles.originalPrice}>{item.originalPrice}</ThemedText>
            ) : null}
          </View>

          <View style={styles.tagsRow}>
            {item.tagImages?.map((tagImg, index) => (
              <Image key={index} source={tagImg} style={styles.tagIcon} resizeMode="contain" />
            ))}
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#444" style={{ marginRight: 2 }} />
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
    if (nextPageUrl) setPage((p) => p + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      {/* HEADER (unchanged) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={{ backgroundColor: "#fff", padding: 6, borderRadius: 30, marginLeft: 8, zIndex: 5 }} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>

          <ThemedText font="oleo" style={styles.headerTitle}>{categoryTitle}</ThemedText>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#fff", padding: 6, borderRadius: 25 }]}>
              <Ionicons name="cart-outline" size={22} color="#E53E3E" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#fff", padding: 6, borderRadius: 25 }]}>
              <Ionicons name="notifications-outline" size={22} color="#E53E3E" />
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
          <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
        </View>
      </View>

      {/* FILTER ROW (unchanged) */}
      <View style={styles.filterContainer}>
        {['Location', 'Store', 'Brand', 'Price', 'Ratings', 'Sort by'].map((label) => (
          <TouchableOpacity key={label} style={styles.filterButton}>
            <ThemedText style={styles.filterText}>{label}</ThemedText>
            <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
          </TouchableOpacity>
        ))}
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
      ) : (
        <ScrollView>
          {/* TRENDING (heuristic) */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Products</ThemedText>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newArrivals}
            renderItem={renderHorizontalProduct}
            keyExtractor={(item) => "trend-" + item.id}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />

          {/* NEW ARRIVALS */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>New Arrivals</ThemedText>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newArrivals}
            renderItem={renderHorizontalProduct}
            keyExtractor={(item) => "new-" + item.id}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          />

          {/* ALL PRODUCTS */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>All Products</ThemedText>
          </View>
          <FlatList
            data={allProducts}
            renderItem={renderAllProductCard}
            keyExtractor={(item) => "all-" + item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: -10, justifyContent: 'space-evenly' }}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
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
    </SafeAreaView>
  );
};

export default ProductsListScreen;

// Keep your styles object unchanged for now.

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#E53E3E',
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        zIndex: 1,
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
        textAlign: 'center',
        color: '#fff',
        fontSize: 24,
        marginLeft: -150,
        fontWeight: '400',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    searchContainer: {
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        height: 57,

    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 25,
        paddingHorizontal: -5,
        paddingTop: 20,
        rowGap: -25,
        columnGap: 5
    },
    // Note: duplicate key kept as-is to preserve your original file
    filterButton: {
        width: '30%',
        backgroundColor: '#EDEDED',
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 7,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Note: duplicate key kept as-is to preserve your original file
    filterText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '400',
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
        marginBottom:10

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
        elevation:1
    },
    horizontalImage: {
        width: "100%",
        height: 100,
        resizeMode: "cover",
    },
    // All Products card styling
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
    originalPrice: { color: "#999", fontSize: 10, textDecorationLine: "line-through" },
    ratingRow: { flexDirection: "row", alignItems: "center" },
    rating: { marginLeft: 2, fontSize: 11, color: "#000" },
    tagsRow: { flexDirection: "row", marginTop: 3, gap: 3 },
    tagIcon: { width: 70, height: 20, borderRadius: 50 },
    locationRow: { flexDirection: "row", alignItems: "center" },
    location: { fontSize: 9, color: "#444", fontWeight: "500" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    storeRow: { flexDirection: "row", alignItems: "center", },
    storeAvatar: { width: 20, height: 20, borderRadius: 12, marginRight: 6 },
});
