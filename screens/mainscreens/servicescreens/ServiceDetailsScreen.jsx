import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../../components/ThemedText";

import { useServicesDetail } from "../../../config/api.config";
import { useSavedToggleItem } from "../../../config/api.config";
import { useCheckSavedItem } from "../../../config/api.config";



const ServiceDetailsScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { service } = params;

  // Handle case where service is not passed or doesn't have an id
  if (!service || !service.id) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Service information not available. Please try again.
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // State for saved status
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  
  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch service details from API
  const {
    data: serviceData,
    isLoading,
    error,
  } = useServicesDetail(service?.id);

  // Check if service is saved
  const { mutate: checkSaved } = useCheckSavedItem({
    onSuccess: (data) => {
      setIsSaved(data?.data?.saved || false);
      setIsCheckingSaved(false);
    },
    onError: () => {
      setIsSaved(false);
      setIsCheckingSaved(false);
    },
  });

  // Toggle saved status
  const { mutate: toggleSaved, isLoading: isToggling } = useSavedToggleItem({
    onSuccess: (data) => {
      setIsSaved(data?.data?.saved || false);
    },
    onError: (error) => {
      console.error("Error toggling saved status:", error);
    },
  });

  // Check saved status when component mounts
  useEffect(() => {
    if (service?.id) {
      checkSaved({
        type: "service",
        type_id: service.id.toString(),
      });
    }
  }, [service?.id]);

  // Handle heart icon press
  const handleHeartPress = () => {
    if (service?.id && !isToggling) {
      toggleSaved({
        type: "service",
        type_id: service.id.toString(),
      });
    }
  };

  // Handle video play
  const handleVideoPlay = () => {
    const videoUri = getFirstVideo(serviceInfo?.media);
    if (videoUri) {
      // TODO: Implement video player
      console.log("Play video:", videoUri);
      // You can integrate with react-native-video or expo-av here
    }
  };

  // Handle image click
  const handleImageClick = () => {
    setCurrentImageIndex(0);
    setImageViewerVisible(true);
  };

  // Helper function to format price
  const formatPrice = (priceFrom, priceTo) => {
    const from = Number(priceFrom || 0);
    const to = Number(priceTo || 0);
    return `₦${from.toLocaleString()} - ₦${to.toLocaleString()}`;
  };

  // Helper function to get service image
  const getServiceImage = (media) => {
    if (media && media.length > 0) {
      return { uri: `https://colala.hmstech.xyz/storage/${media[0].path}` };
    }
    return require("../../../assets/Frame 264.png"); // Default image
  };

  // Helper function to check if media has video
  const hasVideo = (media) => {
    return media && media.some(item => item.type === 'video');
  };

  // Helper function to get first video
  const getFirstVideo = (media) => {
    if (media && media.length > 0) {
      const video = media.find(item => item.type === 'video');
      return video ? { uri: `https://colala.hmstech.xyz/storage/${video.path}` } : null;
    }
    return null;
  };

  // Helper function to get all images for viewer
  const getAllImages = (media) => {
    if (media && media.length > 0) {
      return media
        .filter(item => item.type === 'image')
        .map(item => ({ uri: `https://colala.hmstech.xyz/storage/${item.path}` }));
    }
    return [getServiceImage(media)];
  };

  // Handle image viewer navigation
  const handleNextImage = () => {
    const images = getAllImages(serviceInfo?.media);
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Helper function to get price breakdown from sub_services
  const getPriceBreakdown = (subServices) => {
    if (subServices && subServices.length > 0) {
      return subServices.map((sub) => ({
        name: sub.name,
        price: formatPrice(sub.price_from, sub.price_to),
      }));
    }
    // Fallback to dummy data
    return [
      { name: "General", price: "₦10,000 - ₦50,000" },
      { name: "Male Wear", price: "₦15,000 - ₦60,000" },
      { name: "Female wear", price: "₦20,000 - ₦80,000" },
      { name: "Kids Wear", price: "₦8,000 - ₦30,000" },
      { name: "Wedding Wears", price: "₦50,000 - ₦200,000" },
      { name: "Tents", price: "₦30,000 - ₦100,000" },
    ];
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <ThemedText style={styles.loadingText}>
          Loading service details...
        </ThemedText>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Failed to load service details
        </ThemedText>
      </View>
    );
  }

  // Use API data or fallback to dummy data
  const serviceInfo = serviceData?.data || service;
  const priceBreakdown = getPriceBreakdown(serviceInfo?.sub_services);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      {/* Top Image */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={{
            padding: 3,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 20,
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.topHeaderTitle}>Service Details</ThemedText>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* <TouchableOpacity
            style={{
              padding: 5,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 30,
            }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#000" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={{
              padding: 5,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 30,
            }}
            onPress={handleHeartPress}
            disabled={isToggling || isCheckingSaved}
          >
            {isToggling || isCheckingSaved ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={22} 
                color={isSaved ? "#E53E3E" : "#000"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={hasVideo(serviceInfo?.media) ? handleVideoPlay : handleImageClick}>
          <Image
            source={getServiceImage(serviceInfo?.media)}
            style={styles.mainImage}
          />
          {hasVideo(serviceInfo?.media) && (
            <View style={styles.videoIcon}>
              <Ionicons name="play-circle" size={50} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Store Info Overlay */}
        <View style={styles.storeOverlay}>
          <Image
            source={require("../../../assets/Ellipse 18.png")}
            style={styles.avatar}
          />
          <ThemedText style={styles.storeName}>Service Store</ThemedText>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#E53E3E" />
            <ThemedText
              style={[
                styles.ratingText,
                {
                  color: "#fff",
                },
              ]}
            >
              4.5
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Gallery */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.gallery}
      >
        {serviceInfo?.media?.map((media, index) => (
          <Image
            key={index}
            source={{ uri: `https://colala.hmstech.xyz/storage/${media.path}` }}
            style={styles.thumbnail}
          />
        )) ||
          [getServiceImage(serviceInfo?.media)].map((img, index) => (
            <Image key={index} source={img} style={styles.thumbnail} />
          ))}
      </ScrollView>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>
            {serviceInfo?.name || "Service Name"}
          </ThemedText>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#E53E3E" />
            <ThemedText style={styles.ratingText}>4.5</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.price}>
          {serviceInfo?.discount_price
            ? `₦${Number(serviceInfo.discount_price).toLocaleString()}`
            : formatPrice(serviceInfo?.price_from, serviceInfo?.price_to)}
        </ThemedText>
        <View style={styles.divider} />
        {/* Description */}
        <ThemedText style={styles.sectionTitle}>Description</ThemedText>
        <ThemedText style={styles.description}>
          {serviceInfo?.full_description ||
            serviceInfo?.short_description ||
            "Service description not available"}
        </ThemedText>
        <View style={styles.divider} />

        {/* Price Breakdown */}
        <ThemedText style={styles.sectionTitle}>Price Breakdown</ThemedText>
        {priceBreakdown.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === priceBreakdown.length - 1;
          return (
            <View
              key={index}
              style={[
                styles.priceRow,
                isFirst && styles.firstPriceRow,
                isLast && styles.lastPriceRow,
              ]}
            >
              <ThemedText style={styles.breakdownLabel}>{item.name}</ThemedText>
              <ThemedText style={styles.breakdownPrice}>
                {item.price}
              </ThemedText>
            </View>
          );
        })}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="logo-whatsapp" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbox-outline" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() =>
              navigation.navigate("ServiceChat", { service: serviceInfo })
            }
          >
            <ThemedText style={styles.messageText}>Message Store</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageViewerScroll}
            contentOffset={{ x: currentImageIndex * Dimensions.get('window').width, y: 0 }}
          >
            {getAllImages(serviceInfo?.media).map((image, index) => (
              <View key={index} style={styles.imageViewerItem}>
                <Image
                  source={image}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Navigation buttons */}
          {getAllImages(serviceInfo?.media).length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.imageViewerNav, styles.imageViewerNavLeft]}
                  onPress={handlePrevImage}
                >
                  <Ionicons name="chevron-back" size={30} color="#fff" />
                </TouchableOpacity>
              )}
              
              {currentImageIndex < getAllImages(serviceInfo?.media).length - 1 && (
                <TouchableOpacity
                  style={[styles.imageViewerNav, styles.imageViewerNavRight]}
                  onPress={handleNextImage}
                >
                  <Ionicons name="chevron-forward" size={30} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Image counter */}
          {getAllImages(serviceInfo?.media).length > 1 && (
            <View style={styles.imageCounter}>
              <ThemedText style={styles.imageCounterText}>
                {currentImageIndex + 1} / {getAllImages(serviceInfo?.media).length}
              </ThemedText>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainImage: { width: "100%", height: 250 },
  topHeader: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
    marginLeft: 30,
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "#0006",
    padding: 6,
    borderRadius: 20,
  },
  videoIcon: {
    position: "absolute",
    top: 120,
    left: "48%",
    fontSize: 32,
    color: "#fff",
  },
  imageContainer: {
    position: "relative",
  },
  videoIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    backgroundColor: "#000000CC",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  storeOverlay: {
    position: "absolute",

    bottom: 0,
    width: "100%",
    backgroundColor: "#000000B2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  storeName: {
    color: "#fff",
    fontSize: 12,
    marginRight: "auto",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
  },

  gallery: { flexDirection: "row", padding: 10 },
  thumbnail: { width: 60, height: 60, borderRadius: 10, marginRight: 8 },
  details: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, fontSize: 14 },
  price: {
    color: "#E53E3E",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  description: { fontSize: 13, color: "#444" },
  firstPriceRow: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  lastPriceRow: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  priceRow: {
    backgroundColor: "#EDEDED",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 5,
    marginVertical: 1.5,
  },
  breakdownLabel: { fontSize: 13 },
  breakdownPrice: { fontSize: 13, color: "#E53E3E" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 40, // adds spacing at the bottom
    gap: 10,
  },

  iconBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 15,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  messageBtn: {
    flex: 1,
    backgroundColor: "#E53E3E",
    paddingVertical: 14,
    borderRadius: 15,
  },
  messageText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
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
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "#00000080",
    borderRadius: 20,
    padding: 10,
  },
  imageViewerScroll: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  imageViewerItem: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  imageViewerNav: {
    position: "absolute",
    top: "50%",
    backgroundColor: "#00000080",
    borderRadius: 25,
    padding: 15,
    zIndex: 10,
  },
  imageViewerNavLeft: {
    left: 20,
  },
  imageViewerNavRight: {
    right: 20,
  },
  imageCounter: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#00000080",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Error handling styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
