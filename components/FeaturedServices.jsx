import React from "react";
import ThemedText from "./ThemedText";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

import { useServices } from "../config/api.config";


const FeaturedServices = () => {
  const navigation = useNavigation();
  
  // Fetch services from API
  const { data: servicesData, isLoading, error } = useServices();
  
  // Helper function to format price
  const formatPrice = (priceFrom, priceTo) => {
    const from = Number(priceFrom || 0);
    const to = Number(priceTo || 0);
    return `₦${from.toLocaleString()} - ₦${to.toLocaleString()}`;
  };
  
  // Helper function to get service image
  const getServiceImage = (service) => {
    if (service?.media && service.media.length > 0) {
      return { uri: `https://colala.hmstech.xyz/storage/${service.media[0].path}` };
    }
    // Fallback to default images
    const defaultImages = [
      require("../assets/Frame 264 (4).png"),
      require("../assets/Frame 264 (5).png"),
      require("../assets/Rectangle 32.png"),
    ];
    return defaultImages[service.id % defaultImages.length];
  };
  
  const services = (servicesData?.data || []).slice(0, 4);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Features Services</ThemedText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ServiceNavigator", {
                screen: "ServicesScreen",
              })
            }
          >
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53E3E" />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Features Services</ThemedText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ServiceNavigator", {
                screen: "ServicesScreen",
              })
            }
          >
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Error loading services: {error.message}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Features Services</ThemedText>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ServiceNavigator", {
              screen: "ServicesScreen",
            })
          }
        >
          <ThemedText style={styles.viewAll}>View All</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Scrollable Cards */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              console.log("FeaturedServices navigating to ServiceDetails with service:", item);
              navigation.navigate("ServiceNavigator", {
                screen: "ServiceDetails",
                params: { service: item }
              });
            }}
          >
            <Image
              source={getServiceImage(item)}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Store Row */}
            <View style={styles.rowBetween}>
              <View style={styles.storeRow}>
                <Image 
                  source={require("../assets/Ellipse 18.png")} 
                  style={styles.storeAvatar} 
                />
                <ThemedText style={styles.storeName}>
                  Store {item.store_id || "N/A"}
                </ThemedText>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={10} color="#FF0000" />
                <ThemedText style={styles.rating}>4.5</ThemedText>
              </View>
            </View>

            <View style={styles.cardContent}>
              <ThemedText style={styles.serviceTitle}>{item.name}</ThemedText>
              <ThemedText style={styles.priceRange}>
                {formatPrice(item.price_from, item.price_to)}
              </ThemedText>

              <TouchableOpacity 
                style={styles.detailsBtn}
                onPress={() => {
                  console.log("FeaturedServices navigating to ServiceDetails with service:", item);
                  navigation.navigate("ServiceNavigator", {
                    screen: "ServiceDetails",
                    params: { service: item }
                  });
                }}
              >
                <ThemedText style={styles.detailsBtnText}>Details</ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default FeaturedServices;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAll: {
    color: "white",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  card: {
    width: width * 0.5,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginRight: 16,
    overflow: "hidden",
    elevation: 1,
  },
  image: {
    width: "100%",
    height: 100,
  },
  cardContent: {
    padding: 10,
  },
  rowBetween: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeAvatar: {
    width: 16,
    height: 16,
    borderRadius: 9,
    marginRight: 6,
  },
  storeName: {
    fontSize: 9,
    color: "#F44336",
    fontWeight: "400",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 3,
    fontSize: 8,
    color: "#000",
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  priceRange: {
    fontSize: 12,
    color: "#F44336",
    marginVertical: 6,
    fontWeight: "bold",
  },
  detailsBtn: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  detailsBtnText: {
    color: "white",
    fontSize: 9,
    fontWeight: "400",
  },
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
