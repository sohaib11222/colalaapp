import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Text,
  Alert,
  Modal,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import ThemedText from "../../../components/ThemedText";
import { useCategories, useCartQuantity, useCameraSearch, useVipProducts } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Use shared cart quantity hook
  const { data: cartQuantity = 0, isLoading: isCartLoading } = useCartQuantity();
  
  // Camera search functionality
  const { mutate: cameraSearch, isPending: isCameraSearching } = useCameraSearch();
  const [isSearching, setIsSearching] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Show image picker modal
  const handleCameraSearch = () => {
    setShowImagePickerModal(true);
  };

  // Handle camera image capture
  const handleCameraCapture = async () => {
    try {
      setShowImagePickerModal(false);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to search with images.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("❌ Camera error:", error);
      setIsSearching(false);
      Alert.alert(
        'Error',
        'Failed to open camera. Please try again.'
      );
    }
  };

  // Handle gallery image selection
  const handleGallerySelection = async () => {
    try {
      setShowImagePickerModal(false);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library permission to select images.'
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("❌ Gallery error:", error);
      setIsSearching(false);
      Alert.alert(
        'Error',
        'Failed to open gallery. Please try again.'
      );
    }
  };

  // Process selected image
  const processImage = async (imageUri) => {
    setIsSearching(true);

    // Perform camera search
    cameraSearch(
      { image: imageUri, type: 'product' },
      {
        onSuccess: (data) => {
          console.log("✅ Image search successful:", data);
          setIsSearching(false);
          
          // Navigate to camera search results screen
          navigation.navigate('CameraSearchScreen', {
            searchResults: data.search_results,
            extractedText: data.extracted_text,
            searchQuery: data.search_query,
          });
        },
        onError: (error) => {
          console.log("❌ Image search error:", error);
          setIsSearching(false);
          
          // Check if it's a token expiration error
          if (error?.isTokenExpired) {
            // Token expiration is already handled by the API interceptor
            return;
          }
          
          Alert.alert(
            'Search Failed',
            'Could not analyze the image. Please try again.'
          );
        },
      }
    );
  };

  // id of the parent category to expand when arriving from the home strip
  const initialParentIdRaw = route?.params?.initialParentId;
  const initialParentId =
    initialParentIdRaw !== undefined && initialParentIdRaw !== null
      ? Number(initialParentIdRaw)
      : null;

  const { data, isLoading, isError } = useCategories();
  
  // Fetch VIP products
  const { data: vipProductsData, isLoading: vipProductsLoading } = useVipProducts();
  const vipProducts = Array.isArray(vipProductsData?.data) ? vipProductsData.data : [];

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  
  // Helper function to get image URL
  const HOST = "https://colala.hmstech.xyz";
  const absUrl = (u) => (u?.startsWith("http") ? u : `${HOST}${u || ""}`);

  const apiCategories = Array.isArray(data?.data) ? data.data : [];
  const [expanded, setExpanded] = useState({}); // { [parentId]: boolean }
  const [searchQuery, setSearchQuery] = useState('');

  // If we were given a parent id, expand only that on first load.
  useEffect(() => {
    if (!initialParentId || !apiCategories.length) return;
    // console.log("cateogir")
    setExpanded((prev) => {
      // don't clobber if already manually toggled
      if (typeof prev[initialParentId] !== "undefined") return prev;
      // collapse others, open only the requested parent
      return { [initialParentId]: true };
    });
  }, [initialParentId, apiCategories.length]);
  useEffect(() => {
    if (data) {
      console.log("✅ Categories Response:", data);
    }
  }, [data]);
  
  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch categories and VIP products
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['vipProducts'] })
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);
  
  // Map VIP products for carousel
  const vipProductsMapped = useMemo(() => {
    return vipProducts.map((p) => {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const main = imgs.find((im) => Number(im.is_main) === 1) || imgs[0];
      const imageUri = main?.path ? absUrl(`/storage/${main.path}`) : null;
      
      const priceNum = Number(p.discount_price || p.price || 0);
      const origNum = Number(p.price || 0);
      const toNaira = (n) => `₦${Number(n).toLocaleString()}`;
      
      return {
        id: String(p.id),
        title: p.name || "Product",
        price: priceNum ? toNaira(priceNum) : toNaira(origNum),
        originalPrice: priceNum && origNum && priceNum < origNum ? toNaira(origNum) : "",
        image: imageUri ? { uri: imageUri } : require("../../../assets/phone5.png"),
        store: {
          name: p.store?.store_name || "Store",
          rating: p.store?.average_rating || 0,
          location: p.store?.store_location || "Lagos, Nigeria",
        },
        productData: p, // Keep full product data for navigation
      };
    });
  }, [vipProducts]);
  
  // Render VIP product carousel item
  const renderVipProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.vipCard}
      onPress={() =>
        navigation.navigate("ProductDetails", {
          productId: item.id,
          product: item.productData,
        })
      }
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.vipImage} resizeMode="cover" />
      <View style={styles.vipCardContent}>
        <View style={styles.vipStoreRow}>
          <ThemedText style={styles.vipStoreName} numberOfLines={1}>
            {item.store.name}
          </ThemedText>
          {item.store.rating > 0 && (
            <View style={styles.vipRatingRow}>
              <Ionicons name="star" color="#FFD700" size={12} />
              <ThemedText style={styles.vipRating}>{item.store.rating.toFixed(1)}</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.vipProductTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={styles.vipPriceRow}>
          <ThemedText style={styles.vipPrice}>{item.price}</ThemedText>
          {item.originalPrice && (
            <ThemedText style={styles.vipOriginalPrice}>{item.originalPrice}</ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Filter categories based on search query and hide empty categories
  const filteredCategories = useMemo(() => {
    // First filter out categories with no children (unless they have products)
    const categoriesWithContent = apiCategories.filter(category => {
      // Show if category has children or has products
      return (category.children && category.children.length > 0) || (category.products_count > 0);
    });

    if (!searchQuery.trim()) return categoriesWithContent;
    
    const query = searchQuery.toLowerCase().trim();
    return categoriesWithContent.filter(category => {
      // Search in main category title
      if (category.title?.toLowerCase().includes(query)) return true;
      
      // Search in subcategories
      if (category.children && Array.isArray(category.children)) {
        return category.children.some(sub => {
          // Search in subcategory title
          if (sub.title?.toLowerCase().includes(query)) return true;
          
          // Search in subcategory children (grandchildren)
          if (sub.children && Array.isArray(sub.children)) {
            return sub.children.some(grand => 
              grand.title?.toLowerCase().includes(query)
            );
          }
          return false;
        });
      }
      return false;
    });
  }, [apiCategories, searchQuery]);

  const categories = useMemo(() => {
    const hasInitial =
      initialParentId !== null && initialParentId !== undefined;
    return filteredCategories.map((c, idx) => ({
      ...c,
      isExpanded:
        expanded[c.id] ?? (hasInitial ? c.id === initialParentId : idx === 0),
    }));
  }, [filteredCategories, expanded, initialParentId]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderCategory = ({ item }) => {
    const subs = Array.isArray(item.children) ? item.children : [];

    return (
      <View style={styles.categoryContainer}>
        {/* Parent row */}
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleExpand(item.id)}
        >
          {!!item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.categoryTextContainer}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.subText}>
              {item.products_count ?? 0} products
            </ThemedText>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <AntDesign
              name={item.isExpanded ? "up" : "down"}
              size={20}
              color="red"
            />
          </View>
        </TouchableOpacity>

        {/* Show subcategories in both red bar and grid */}
        {item.isExpanded && subs.length > 0 && (
          <View style={styles.subCategoryContainer}>
            {subs.map((sub) => (
              <View key={`sub-${sub.id}`} style={{ marginBottom: 12 }}>
                {/* Red bar showing subcategory name + View All */}
                <View style={styles.subHeader}>
                  <View style={styles.subHeaderLeft}>
                    {!!sub.image_url && (
                      <Image
                        source={{ uri: sub.image_url }}
                        style={styles.subHeaderImage}
                        resizeMode="cover"
                      />
                    )}
                    <ThemedText style={styles.subTitle}>{sub.title}</ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductsList", {
                        categoryId: sub.id,
                        categoryTitle: sub.title,
                        fetchCategoryId: item.id,
                        products: [],
                      })
                    }
                  >
                    <ThemedText style={styles.viewAll}>View All</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Grid showing the same subcategories */}
                <View style={styles.itemRow}>
                  <View style={styles.subItem}>
                    {!!sub.image_url && (
                      <Image
                        source={{ uri: sub.image_url }}
                        style={styles.subImage}
                        resizeMode="cover"
                      />
                    )}
                    <View
                      style={{
                        backgroundColor: "#F7F7F7",
                        padding: 4,
                        zIndex: 1,
                        marginTop: -5,
                        borderBottomRightRadius: 5,
                        borderBottomLeftRadius: 5,
                      }}
                    >
                      <ThemedText style={styles.subItemTitle}>
                        {sub.title}
                      </ThemedText>
                      <ThemedText style={styles.subCount}>
                        {sub.products_count ?? 0} Products
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              padding: 6,
              borderRadius: 30,
              marginLeft: 10,
              zIndex: 5,
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>

          <ThemedText font="oleo" style={styles.headerTitle}>
            Categories
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
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <TouchableOpacity 
            onPress={handleCameraSearch} 
            disabled={isCameraSearching || isSearching}
            style={styles.cameraButton}
          >
            {isCameraSearching || isSearching ? (
              <ActivityIndicator size="small" color="#888" />
            ) : (
              <Image
                source={require("../../../assets/camera-icon.png")}
                style={styles.iconImg}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color="#E53E3E" />
          <ThemedText style={styles.headerLoadingText}>Loading categories...</ThemedText>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={{ padding: 24 }}>
          <ThemedText>Failed to load categories</ThemedText>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategory}
          contentContainerStyle={{ padding: 16 }}
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
          ListHeaderComponent={
            vipProductsMapped.length > 0 ? (
              <View style={styles.vipCarouselContainer}>
                <View style={styles.vipSectionHeader}>
                  <ThemedText style={styles.vipSectionTitle}>VIP Products</ThemedText>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={vipProductsMapped}
                  renderItem={renderVipProduct}
                  keyExtractor={(item) => `vip-${item.id}`}
                  contentContainerStyle={styles.vipCarouselContent}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            categories.length === 0 && searchQuery.trim() ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <ThemedText style={{ color: '#888', textAlign: 'center' }}>
                  No categories found for "{searchQuery}"
                </ThemedText>
              </View>
            ) : null
          }
        />
      )}

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Image Source</ThemedText>
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleCameraCapture}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={32} color="#E53E3E" />
                </View>
                <ThemedText style={styles.optionText}>Take Photo</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleGallerySelection}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={32} color="#E53E3E" />
                </View>
                <ThemedText style={styles.optionText}>Choose from Gallery</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: "#fff",
    marginBottom: 12,
    paddingRight: 12,
    paddingTop: 0,
    paddingLeft: 0,
    borderRadius: 12,
    elevation: 2,
  },

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
    left: 20,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    marginLeft: -180,
    fontWeight: "400",
  },
  headerIcons: { flexDirection: "row" },
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
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  cameraButton: {
    marginLeft: 8,
    padding: 4,
  },
  cameraIcon: { marginLeft: 8 },

  categoryHeader: { flexDirection: "row", alignItems: "center" },
  categoryImage: {
    width: 75,
    height: 75,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    marginRight: 10,
    padding: 0,
  },
  categoryTextContainer: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 16 },
  subText: { color: "#888", fontSize: 13 },

  subCategoryContainer: { marginTop: 10, padding: 16 },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#E53E3E",
    borderRadius: 5,
    paddingVertical: 7,
  },
  subHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subHeaderImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  subTitle: { fontWeight: "400", fontSize: 12, color: "#fff" },
  viewAll: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "underline",
  },

  itemRow: { flexDirection: "row", flexWrap: "wrap" },
  subItem: { width: "30.3%", margin: 5 },
  subImage: { width: "100%", height: 80, borderRadius: 8 },
  subItemTitle: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  subCount: { fontSize: 10, color: "#777" },

  iconButton: { marginLeft: 9 },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
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

  // Image Picker Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 40,
    maxWidth: 400,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalOptions: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  // VIP Products Carousel Styles
  vipCarouselContainer: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  vipSectionHeader: {
    backgroundColor: "#E53E3E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  vipSectionTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  vipCarouselContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  vipCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    width: 180,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  vipImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#f0f0f0",
  },
  vipCardContent: {
    padding: 10,
  },
  vipStoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  vipStoreName: {
    fontSize: 11,
    color: "#E53E3E",
    fontWeight: "500",
    flex: 1,
    marginRight: 4,
  },
  vipRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  vipRating: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  vipProductTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
    minHeight: 36,
  },
  vipPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vipPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E53E3E",
  },
  vipOriginalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
});
