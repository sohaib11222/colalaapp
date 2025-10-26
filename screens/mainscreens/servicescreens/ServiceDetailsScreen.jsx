import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode } from "expo-av";
import ThemedText from "../../../components/ThemedText";

import { useServicesDetail } from "../../../config/api.config";
import { useSavedToggleItem } from "../../../config/api.config";
import { useCheckSavedItem } from "../../../config/api.config";
import { useStartServiceChat } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";
import GuestService from "../../../utils/guestService";
import LoginPromptModal from "../../../components/LoginPromptModal";

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

  // State for main image/media
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isShowingVideo, setIsShowingVideo] = useState(false);

  // Video state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true); // Start with true for autoplay
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Start with 0 to autoplay first video
  const [videoLoadError, setVideoLoadError] = useState(false);
  
  // Phone number reveal state
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  // Guest functionality
  const [isGuest, setIsGuest] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Video refs
  const videoRef = useRef(null);
  const viewerVideoRef = useRef(null);

  // Query client for refresh functionality
  const queryClient = useQueryClient();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

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

  console.log("serviceData", serviceData);
  // Toggle saved status
  const { mutate: toggleSaved, isLoading: isToggling } = useSavedToggleItem({
    onSuccess: (data) => {
      setIsSaved(data?.data?.saved || false);
    },
    onError: (error) => {
      console.error("Error toggling saved status:", error);
    },
  });

  // Service chat functionality
  const { mutate: startServiceChat, isPending: creatingServiceChat } =
    useStartServiceChat();

  // Check saved status when component mounts
  useEffect(() => {
    if (service?.id) {
      checkSaved({
        type: "service",
        type_id: service.id.toString(),
      });
    }
  }, [service?.id]);

  // Set initial display state when service data loads
  useEffect(() => {
    if (serviceInfo) {
      // Reset video error state
      setVideoLoadError(false);
      // Reset phone reveal state
      setIsPhoneRevealed(false);
      
      // If video is available, show video by default
      if (hasVideo(serviceInfo)) {
        setIsShowingVideo(true);
        // Video will autoplay automatically with shouldPlay=true
      } else {
        setIsShowingVideo(false);
      }
    }
  }, [serviceInfo]);

  // Check guest status
  useEffect(() => {
    const checkGuestStatus = async () => {
      const guestStatus = await GuestService.isGuest();
      console.log("ServiceDetailsScreen - Guest status:", guestStatus);
      setIsGuest(guestStatus);
    };
    checkGuestStatus();
  }, []);

  // Guest action handler
  const handleGuestAction = (action) => {
    console.log("ServiceDetailsScreen - handleGuestAction called, isGuest:", isGuest);
    if (isGuest) {
      console.log("ServiceDetailsScreen - Showing login modal for guest");
      setShowLoginModal(false);
      setTimeout(() => {
        console.log("ServiceDetailsScreen - Setting showLoginModal to true");
        setShowLoginModal(true);
      }, 10);
    } else {
      console.log("ServiceDetailsScreen - User is authenticated, proceeding with action");
      action();
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch service details query
      await queryClient.invalidateQueries({
        queryKey: ["serviceDetails", service?.id],
      });
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, service?.id]);

  // Handle heart icon press
  const handleHeartPress = () => {
    handleGuestAction(() => {
      if (service?.id && !isToggling) {
        toggleSaved({
          type: "service",
          type_id: service.id.toString(),
        });
      }
    });
  };

  // Handle start service chat
  const handleStartServiceChat = () => {
    handleGuestAction(() => {
      try {
        const serviceId = service?.id;
        const storeId = serviceInfo?.store?.id || serviceInfo?.store_id;

        if (!serviceId) {
          console.error("Service ID not available");
          return;
        }

        if (!storeId) {
          console.error("Store ID not available");
          return;
        }

        console.log("Starting service chat:", { serviceId, storeId });

        startServiceChat(
          { storeId, serviceId },
          {
            onSuccess: (data) => {
              console.log("Service chat created successfully:", data);
              const { chat_id } = data;

              navigation.navigate("ServiceNavigator", {
                screen: "ChatDetails",
                params: {
                  store: {
                    id: storeId,
                    name: serviceInfo?.store?.store_name || "Service Store",
                    profileImage: serviceInfo?.store?.profile_image
                      ? `https://colala.hmstech.xyz/storage/${serviceInfo.store.profile_image}`
                      : require("../../../assets/Ellipse 18.png"),
                  },
                  chat_id,
                  store_order_id: storeId,
                },
              });
            },
            onError: (error) => {
              console.error("Failed to create service chat:", error);
              // Fallback: navigate without chat_id
              navigation.navigate("ServiceNavigator", {
                screen: "ChatDetails",
                params: {
                  store: {
                    id: storeId,
                    name: serviceInfo?.store?.store_name || "Service Store",
                    profileImage: serviceInfo?.store?.profile_image
                      ? `https://colala.hmstech.xyz/storage/${serviceInfo.store.profile_image}`
                      : require("../../../assets/Ellipse 18.png"),
                  },
                },
              });
            },
          }
        );
      } catch (error) {
        console.error("Error starting service chat:", error);
      }
    });
  };

  // Handle video play/pause
  const handleVideoPlay = async (index = 0, isViewer = false) => {
    const ref = isViewer ? viewerVideoRef : videoRef;

    if (currentVideoIndex === index && isVideoPlaying) {
      // Pause current video
      if (ref.current) {
        try {
          await ref.current.pauseAsync();
          setIsVideoPlaying(false);
          setCurrentVideoIndex(-1);
        } catch (error) {
          console.log("Error pausing video:", error);
        }
      }
    } else {
      // Play new video
      if (ref.current) {
        try {
          await ref.current.playAsync();
          setIsVideoPlaying(true);
          setCurrentVideoIndex(index);
        } catch (error) {
          console.log("Error playing video:", error);
        }
      }
    }
  };

  // Handle video status update
  const handleVideoStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Video finished, it will loop automatically
      // Keep playing state as true for continuous playback
    }
  };

  // Handle image click
  const handleImageClick = () => {
    setCurrentImageIndex(mainImageIndex);
    setImageViewerVisible(true);
  };

  // Helper function to format price
  const formatPrice = (priceFrom, priceTo) => {
    const from = Number(priceFrom || 0);
    const to = Number(priceTo || 0);
    return `₦${from.toLocaleString()} - ₦${to.toLocaleString()}`;
  };

  // Helper function to get service image
  const getServiceImage = (media, index = 0) => {
    if (media && media.length > 0) {
      const imageMedia = media.filter((item) => item.type === "image");
      if (imageMedia.length > 0) {
        const selectedIndex = Math.min(index, imageMedia.length - 1);
        return {
          uri: `https://colala.hmstech.xyz/storage/${imageMedia[selectedIndex].path}`,
        };
      }
    }
    return require("../../../assets/Frame 264.png"); // Default image
  };

  // Helper function to check if service has video
  const hasVideo = (serviceInfo) => {
    return serviceInfo?.video && serviceInfo.video.trim() !== "";
  };

  // Helper function to get video URI
  const getVideoUri = (serviceInfo) => {
    if (serviceInfo?.video && serviceInfo.video.trim() !== "") {
      return { uri: `https://colala.hmstech.xyz/storage/${serviceInfo.video}` };
    }
    return null;
  };

  // Helper function to get all media for viewer
  const getAllMedia = () => {
    const media = [];

    // Add video first if it exists
    if (hasVideo(serviceInfo)) {
      media.push({
        type: "video",
        uri: getVideoUri(serviceInfo).uri,
        id: "video",
      });
    }

    // Add images
    if (serviceInfo?.media && serviceInfo.media.length > 0) {
      media.push(
        ...serviceInfo.media
          .filter((item) => item.type === "image")
          .map((item) => ({
            type: "image",
            uri: `https://colala.hmstech.xyz/storage/${item.path}`,
            id: item.id,
          }))
      );
    }

    return media;
  };

  // Handle media viewer navigation
  const handleNextMedia = () => {
    const media = getAllMedia();
    if (currentImageIndex < media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevMedia = () => {
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
    // If no sub_services, show the main service price
    return [
      {
        name: "Service Price",
        price: serviceInfo?.discount_price
          ? `₦${Number(serviceInfo.discount_price).toLocaleString()}`
          : formatPrice(serviceInfo?.price_from, serviceInfo?.price_to),
      },
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

  // Store phone number for contact functionality
  const storePhoneNumber = serviceInfo?.store?.store_phone || "08077601234"; // Default fallback

  return (
    <>
      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color="#E53E3E" />
          <ThemedText style={styles.headerLoadingText}>
            Loading service details...
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.container}
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
      >
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
          <TouchableOpacity
            onPress={
              isShowingVideo ? () => handleVideoPlay(0) : handleImageClick
            }
          >
            {isShowingVideo ? (
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  source={{ uri: getVideoUri(serviceInfo).uri }}
                  style={styles.mainImage}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={currentVideoIndex === 0 && isVideoPlaying}
                  isLooping={true}
                  onPlaybackStatusUpdate={handleVideoStatusUpdate}
                  onError={(error) => {
                    console.log("Video load error:", error);
                    setVideoLoadError(true);
                  }}
                  onLoad={() => {
                    console.log("Video loaded successfully");
                    setVideoLoadError(false);
                  }}
                />
                {/* Only show pause button when video is playing, otherwise show play */}
                {(currentVideoIndex !== 0 || !isVideoPlaying) && (
                  <TouchableOpacity
                    style={styles.videoPlayButton}
                    onPress={() => handleVideoPlay(0)}
                  >
                    <Ionicons
                      name="play-circle"
                      size={60}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                )}
                {/* Show pause button overlay when playing */}
                {currentVideoIndex === 0 && isVideoPlaying && (
                  <TouchableOpacity
                    style={styles.videoPlayButton}
                    onPress={() => handleVideoPlay(0)}
                  >
                    <Ionicons
                      name="pause-circle"
                      size={60}
                      color="rgba(255,255,255,0.6)"
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.videoOverlay}>
                  <ThemedText style={styles.videoLabel}>VIDEO</ThemedText>
                </View>
              </View>
            ) : (
              <Image
                source={getServiceImage(serviceInfo?.media, mainImageIndex)}
                style={styles.mainImage}
              />
            )}
          </TouchableOpacity>

          {/* Store Info Overlay */}
          <View style={styles.storeOverlay}>
            <Image
              source={
                serviceInfo?.store?.profile_image
                  ? {
                      uri: `https://colala.hmstech.xyz/storage/${serviceInfo.store.profile_image}`,
                    }
                  : require("../../../assets/Ellipse 18.png")
              }
              style={styles.avatar}
            />
            <ThemedText style={styles.storeName}>
              {serviceInfo?.store?.store_name || "Service Store"}
            </ThemedText>
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
                {serviceInfo?.store?.average_rating || 4.5}
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
          {/* Video thumbnail */}
          {hasVideo(serviceInfo) && (
            <TouchableOpacity
              onPress={() => {
                setIsShowingVideo(true);
                setMainImageIndex(0);
              }}
              style={[
                styles.thumbnailContainer,
                isShowingVideo && styles.selectedThumbnail,
              ]}
            >
              <View style={styles.videoThumbnailContainer}>
                <Image
                  source={require("../../../assets/vedio-overlay.png")}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.videoThumbnailOverlay}>
                  <Ionicons name="play" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Image thumbnails */}
          {serviceInfo?.media
            ?.filter((item) => item.type === "image")
            .map((media, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setIsShowingVideo(false);
                  setMainImageIndex(index);
                }}
                style={[
                  styles.thumbnailContainer,
                  !isShowingVideo &&
                    mainImageIndex === index &&
                    styles.selectedThumbnail,
                ]}
              >
                <Image
                  source={{
                    uri: `https://colala.hmstech.xyz/storage/${media.path}`,
                  }}
                  style={styles.thumbnail}
                />
              </TouchableOpacity>
            )) ||
            [getServiceImage(serviceInfo?.media)].map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setIsShowingVideo(false);
                  setMainImageIndex(index);
                }}
                style={[
                  styles.thumbnailContainer,
                  !isShowingVideo &&
                    mainImageIndex === index &&
                    styles.selectedThumbnail,
                ]}
              >
                <Image source={img} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
        </ScrollView>

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.title}>
              {serviceInfo?.name || "Service Name"}
            </ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#E53E3E" />
              <ThemedText style={styles.ratingText}>
                {serviceInfo?.store?.average_rating || 4.5}
              </ThemedText>
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
                <ThemedText style={styles.breakdownLabel}>
                  {item.name}
                </ThemedText>
                <ThemedText style={styles.breakdownPrice}>
                  {item.price}
                </ThemedText>
              </View>
            );
          })}

        

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (storePhoneNumber) {
                  const phone = storePhoneNumber.replace(/\D/g, ""); // clean digits
                  Linking.openURL(`https://wa.me/${phone}`).catch((err) =>
                    console.log("WhatsApp error:", err)
                  );
                }
              }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>

            {/* Call */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                if (storePhoneNumber) {
                  Linking.openURL(`tel:${storePhoneNumber}`).catch((err) =>
                    console.log("Call error:", err)
                  );
                }
              }}
            >
              <Ionicons name="call-outline" size={20} color="#000" />
            </TouchableOpacity>

             {/* SMS */}
             <TouchableOpacity
               style={styles.iconBtn}
               onPress={handleStartServiceChat}
             >
               <Ionicons name="chatbox-outline" size={20} color="#000" />
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.messageBtn}
               onPress={() => {
                 if (isPhoneRevealed) {
                   // If phone is already revealed, make the call
                   if (storePhoneNumber) {
                     Linking.openURL(`tel:${storePhoneNumber}`).catch((err) =>
                       console.log("Call error:", err)
                     );
                   }
                 } else {
                   // If phone is not revealed, reveal it
                   setIsPhoneRevealed(true);
                 }
               }}
             >
               <ThemedText style={styles.messageText}>
                 {isPhoneRevealed ? (storePhoneNumber || "Call Store") : "Reveal Number"}
               </ThemedText>
             </TouchableOpacity>
          </View>

            {/* Store Details Section */}
            <View style={{ paddingHorizontal: 16, marginBottom: 30 }}>
            <ThemedText
              style={{ fontWeight: "500", fontSize: 15, marginBottom: 10 }}
            >
              Store Details
            </ThemedText>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                elevation: 2,
              }}
            >
              <Image
                source={
                  serviceInfo?.store?.banner_image
                    ? { uri: `https://colala.hmstech.xyz/storage/${serviceInfo.store.banner_image}` }
                    : require("../../../assets/Frame 264.png")
                }
                style={{ width: "100%", height: 110, resizeMode: "cover" }}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: -28,
                  paddingHorizontal: 12,
                }}
              >
                <Image
                  source={
                    serviceInfo?.store?.profile_image
                      ? { uri: `https://colala.hmstech.xyz/storage/${serviceInfo.store.profile_image}` }
                      : require("../../../assets/Ellipse 18.png")
                  }
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    marginRight: 10,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      fontWeight: "600",
                      fontSize: 15,
                      marginTop: 30,
                    }}
                  >
                    {serviceInfo?.store?.store_name || "Service Store"}
                  </ThemedText>
                  <View
                    style={{ flexDirection: "row", gap: 6, marginTop: 4 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 11,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        backgroundColor: "#0000FF33",
                        color: "#0000FF",
                        borderRadius: 6,
                        fontWeight: "500",
                        borderWidth: 0.5,
                        borderColor: "#0000FF",
                      }}
                    >
                      Service Provider
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <Ionicons name="star" color="red" size={16} />
                  <ThemedText style={{ fontSize: 14, marginLeft: 4 }}>
                    {serviceInfo?.store?.average_rating || 0}
                  </ThemedText>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons name="location-outline" size={16} color="#888" />
                <ThemedText
                  style={{ marginLeft: 4, fontSize: 13, color: "#555" }}
                >
                  {serviceInfo?.store?.store_location || "Lagos, Nigeria"}
                </ThemedText>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingBottom: 14,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Image
                      source={require("../../../assets/shop.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <View>
                      <ThemedText style={{ fontSize: 10, color: "#888" }}>
                        Services
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 14, fontWeight: "500" }}
                      >
                        0
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={{ width: 1, height: 30, backgroundColor: "#E0E0E0" }} />

                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Image
                      source={require("../../../assets/profile-2user.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <View>
                      <ThemedText style={{ fontSize: 10, color: "#888" }}>
                        Followers
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 14, fontWeight: "500" }}
                      >
                        0
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={{ width: 1, height: 30, backgroundColor: "#E0E0E0" }} />

                <TouchableOpacity
                  style={{
                    backgroundColor: "#E53E3E",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    navigation.navigate("ServiceNavigator", {
                      screen: "StoreDetails",
                      params: {
                        store: serviceInfo?.store,
                        storeId: serviceInfo?.store?.id || serviceInfo?.store_id,
                      },
                    });
                  }}
                >
                  <ThemedText
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Go to Shop
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
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
              contentOffset={{
                x: currentImageIndex * Dimensions.get("window").width,
                y: 0,
              }}
            >
              {getAllMedia().map((media, index) => (
                <View key={media.id} style={styles.imageViewerItem}>
                  {media.type === "video" ? (
                    <View style={styles.videoViewerContainer}>
                      <Video
                        ref={viewerVideoRef}
                        source={{ uri: media.uri }}
                        style={styles.imageViewerImage}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={
                          currentVideoIndex === index && isVideoPlaying
                        }
                        isLooping={true}
                        onPlaybackStatusUpdate={handleVideoStatusUpdate}
                        onError={(error) => {
                          console.log("Viewer video load error:", error);
                        }}
                      />
                      {/* Only show pause button when video is playing, otherwise show play */}
                      {(currentVideoIndex !== index || !isVideoPlaying) && (
                        <TouchableOpacity
                          style={styles.videoViewerPlayButton}
                          onPress={() => handleVideoPlay(index, true)}
                        >
                          <Ionicons
                            name="play-circle"
                            size={80}
                            color="rgba(255,255,255,0.9)"
                          />
                        </TouchableOpacity>
                      )}
                      {/* Show pause button overlay when playing */}
                      {currentVideoIndex === index && isVideoPlaying && (
                        <TouchableOpacity
                          style={styles.videoViewerPlayButton}
                          onPress={() => handleVideoPlay(index, true)}
                        >
                          <Ionicons
                            name="pause-circle"
                            size={80}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      )}
                      <View style={styles.videoViewerOverlay}>
                        <ThemedText style={styles.videoViewerLabel}>
                          VIDEO
                        </ThemedText>
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: media.uri }}
                      style={styles.imageViewerImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Navigation buttons */}
            {getAllMedia().length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.imageViewerNav, styles.imageViewerNavLeft]}
                    onPress={handlePrevMedia}
                  >
                    <Ionicons name="chevron-back" size={30} color="#fff" />
                  </TouchableOpacity>
                )}

                {currentImageIndex < getAllMedia().length - 1 && (
                  <TouchableOpacity
                    style={[styles.imageViewerNav, styles.imageViewerNavRight]}
                    onPress={handleNextMedia}
                  >
                    <Ionicons name="chevron-forward" size={30} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Media counter */}
            {getAllMedia().length > 1 && (
              <View style={styles.imageCounter}>
                <ThemedText style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {getAllMedia().length}
                </ThemedText>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
      
      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          navigation.navigate('MainNavigator', { screen: 'Home' });
        }}
        onLogin={() => {
          setShowLoginModal(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'AuthNavigator', state: { routes: [{ name: 'Login' }], index: 0 } }],
          });
        }}
        title="Login Required"
        message="Please login to save services or start chatting with service providers."
      />
    </>
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
  videoContainer: {
    position: "relative",
  },
  videoPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  videoOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  videoViewerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoViewerPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -40 }],
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  videoViewerOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  videoViewerLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  videoThumbnailContainer: {
    position: "relative",
  },
  videoThumbnailOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -8 }, { translateY: -8 }],
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    width: 16,
    height: 16,
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
  thumbnailContainer: {
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumbnail: {
    borderColor: "#E53E3E",
  },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
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
    width: Dimensions.get("window").width,
  },
  imageViewerItem: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
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
