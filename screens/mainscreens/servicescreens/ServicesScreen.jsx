import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText"; // 👈 import ThemedText

import { useServicesCategories } from "../../../config/api.config";



const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 3;

const ServicesScreen = () => {
  const navigation = useNavigation();
  
  // Fetch services categories from API
  const { data: servicesData, isLoading, error } = useServicesCategories();
  
  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return require("../../../assets/Rectangle 32 (1).png");
    return { uri: `https://colala.hmstech.xyz/storage/${imagePath}` };
  };

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
            
        {/* 🔍 Search Inside Header */}
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

      {/* ⚪️ Card Body Overlapping Header */}
      <View style={styles.bodyCard}>
        <TouchableOpacity style={styles.viewAllButton}>
          <ThemedText style={styles.viewAllText}>View All Services</ThemedText>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53E3E" />
            <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Failed to load services</ThemedText>
          </View>
        ) : (
          <FlatList
            key={"three-columns"}
            numColumns={3}
            data={servicesData?.data || []}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 14,
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
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
                <Image source={getImageUrl(item.image)} style={styles.cardImage} />
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
});
