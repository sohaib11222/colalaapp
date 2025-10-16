import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Text,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import ThemedText from "../../../components/ThemedText"; // 👈 import ThemedText

import {
  useServicesCategories,
  useCartQuantity,
  useCameraSearch,
} from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");

const CARD_WIDTH = (width - 48) / 3;

const ServicesScreen = () => {
  const navigation = useNavigation();

  // Query client for refresh functionality
  const queryClient = useQueryClient();

  // Use shared cart quantity hook
  const { data: cartQuantity = 0, isLoading: isCartLoading } =
    useCartQuantity();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch services categories from API
  const { data: servicesData, isLoading, error } = useServicesCategories();

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return require("../../../assets/Rectangle 32 (1).png");
    return { uri: `https://colala.hmstech.xyz/storage/${imagePath}` };
  };

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!servicesData?.data) return [];

    if (!searchQuery.trim()) {
      return servicesData.data;
    }

    const query = searchQuery.toLowerCase().trim();
    return servicesData.data.filter(
      (service) =>
        service.title?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query)
    );
  }, [servicesData, searchQuery]);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch services categories query
      await queryClient.invalidateQueries({ queryKey: ["servicesCategories"] });
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View style={styles.container}>
      {/* 🔴 Header with Search */}
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
            Services
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

        {/* 🔍 Search Inside Header */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          <ThemedText style={styles.headerLoadingText}>
            Loading services...
          </ThemedText>
        </View>
      )}

      {/* ⚪️ Card Body Overlapping Header */}
      <View style={styles.bodyCard}>
        <TouchableOpacity style={styles.viewAllButton}>
          <ThemedText style={styles.viewAllText}>View All Services</ThemedText>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53E3E" />
            <ThemedText style={styles.loadingText}>
              Loading services...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Failed to load services
            </ThemedText>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {searchQuery.trim()
                ? `No services found for "${searchQuery}"`
                : "No services available"}
            </ThemedText>
            {searchQuery.trim() && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery("")}
              >
                <ThemedText style={styles.clearSearchText}>
                  Clear Search
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            key={"three-columns"}
            numColumns={3}
            data={filteredServices}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 14,
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#E53E3E"]}
                tintColor={"#E53E3E"}
                title="Pull to refresh"
                titleColor={"#6C727A"}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("ServiceStore", {
                    categoryId: item.id,
                    serviceTitle: item.title,
                  })
                }
              >
                <Image
                  source={getImageUrl(item.image)}
                  style={styles.cardImage}
                />
                <View style={styles.cardInfo}>
                  <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.cardListings}>
                    {item.services?.length || 0} Listings
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

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
    </View>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    marginLeft: -180,
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
  cameraButton: {
    marginLeft: 8,
    padding: 4,
  },
  cameraIcon: {
    marginLeft: 8,
  },
  viewAllButton: {
    backgroundColor: "#E53E3E",
    marginHorizontal: 16,
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 45,
    marginBottom: 20,
  },
  viewAllText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 14,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 2,
    overflow: "hidden",
    height: 130,
  },
  cardImage: {
    width: "100%",
    height: 70,
  },
  cardInfo: {
    padding: 6,
  },
  bodyCard: {
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -40,
    paddingHorizontal: 16,
    paddingTop: 20,
    flex: 1,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#222",
  },
  cardListings: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },
  iconButton: {
    marginLeft: 9,
  },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: "contain" },

  cartIconContainer: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#E53E3E",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
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
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
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

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: "#fff",
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
});
