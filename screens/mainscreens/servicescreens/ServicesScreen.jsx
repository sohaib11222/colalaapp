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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText"; // 👈 import ThemedText

import {
  useServicesCategories,
  useCartQuantity,
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
          {/* <Image
            source={require("../../../assets/camera-icon.png")}
            style={styles.iconImg}
          />{" "} */}
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
});
