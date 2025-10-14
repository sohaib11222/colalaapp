import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Modal,
  Linking,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode } from 'expo-av';
import ThemedText from "../../../components/ThemedText";
import { useProductDetails, useCart, useStartChat, useCartQuantity } from "../../../config/api.config";
import { useAddToCart } from "../../../config/api.config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOST = "https://colala.hmstech.xyz";

import { useSavedToggleItem } from "../../../config/api.config";
import { useCheckSavedItem } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const ProductDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Extract productId from nested structure
  const productId =
    route.params?.productId || route.params?.product?.id || route.params?.id;

  console.log("Product Id:", route.params);
  console.log("Product Id:", productId);
  const { data, isLoading, isError } = useProductDetails(productId);
  const { data: cartData } = useCart();
  const raw = data?.data;

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // State for saved status
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);

  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  // State for video playback
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);

  // Ref for main image carousel
  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  const viewerVideoRef = useRef(null);

  // Use shared cart quantity hook
  const { data: cartQuantity = 0 } = useCartQuantity();

  // Check if product is saved
  const { mutate: checkSaved } = useCheckSavedItem({
    onSuccess: (data) => {
      setIsSaved(data?.data?.saved || false);
      setIsCheckingSaved(false);
    },
    onError: (error) => {
      console.log("Error checking saved status:", error);
      setIsCheckingSaved(false);
    },
  });

  // Toggle saved status
  const { mutate: toggleSaved, isLoading: isToggling } = useSavedToggleItem({
    onSuccess: (data) => {
      setIsSaved(data?.data?.saved || false);
    },
    onError: (error) => {
      console.log("Error toggling saved status:", error);
    },
  });

  // Chat functionality
  const { mutate: startChat, isPending: creatingChat } = useStartChat();


  // Check saved status when component mounts
  useEffect(() => {
    if (productId) {
      checkSaved({
        type: "product",
        type_id: productId.toString(),
      });
    }
  }, [productId]);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch product details and cart queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['productDetails', productId] }),
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, productId]);

  // Handle heart icon press
  const handleHeartPress = () => {
    if (productId && !isToggling) {
      toggleSaved({
        type: "product",
        type_id: productId.toString(),
      });
    }
  };

  // Handle start chat
  const handleStartChat = () => {
    try {
      const storeId = product?.store?.id;
      console.log("Starting chat with store ID:", storeId);
      
      if (!storeId) {
        console.error("Store ID not available");
        Alert.alert("Error", "Store information not available");
        return;
      }
      
      startChat(
        { storeId },
        {
          onSuccess: (data) => {
            console.log("Chat created successfully:", data);
            const { chat_id } = data;
            
            navigation.navigate("ServiceNavigator", {
              screen: "ChatDetails",
              params: {
                store: {
                  id: storeId,
                  name: product?.store?.name || "Store",
                  profileImage: product?.store?.logo,
                },
                chat_id,
                store_order_id: storeId,
              },
            });
          },
          onError: (error) => {
            console.error("Failed to create chat:", error);
            Alert.alert("Error", "Failed to start chat. Please try again.");
          },
        }
      );
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat. Please try again.");
    }
  };

  // Helper function to get all media for viewer
  const getAllMedia = () => {
    const media = [];
    
    // Add video first if it exists
    if (hasVideo) {
      media.push({
        type: 'video',
        uri: `https://colala.hmstech.xyz/storage/${product.video}`,
        id: 'video'
      });
    }
    
    // Add images
    if (product?.images && product.images.length > 0) {
      media.push(...product.images.map(img => ({
        type: 'image',
        uri: `https://colala.hmstech.xyz/storage/${img.path}`,
        id: img.id
      })));
    }
    
    return media;
  };

  // Handle image click
  const handleImageClick = () => {
    setViewerImageIndex(0);
    setImageViewerVisible(true);
  };

  // Handle video play/pause
  const handleVideoPlay = async (index, isViewer = false) => {
    const ref = isViewer ? viewerVideoRef : videoRef;
    
    if (currentVideoIndex === index && isVideoPlaying) {
      // Pause current video
      if (ref.current) {
        await ref.current.pauseAsync();
        setIsVideoPlaying(false);
        setCurrentVideoIndex(-1);
      }
    } else {
      // Play new video
      if (ref.current) {
        await ref.current.playAsync();
        setIsVideoPlaying(true);
        setCurrentVideoIndex(index);
      }
    }
  };

  // Handle video status update
  const handleVideoStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsVideoPlaying(false);
      setCurrentVideoIndex(-1);
    }
  };

  // Handle media viewer navigation
  const handleNextMedia = () => {
    const media = getAllMedia();
    if (viewerImageIndex < media.length - 1) {
      setViewerImageIndex(viewerImageIndex + 1);
    }
  };

  const handlePrevMedia = () => {
    if (viewerImageIndex > 0) {
      setViewerImageIndex(viewerImageIndex - 1);
    }
  };

  const product = raw && {
    ...raw,
    store: raw.store
      ? {
        id: raw.store.id,
        name: raw.store.store_name,
        location: raw.store.store_location,
        rating: raw.store.average_rating || 0,
        followers: raw.store.followers_count ?? 0,
        sold: Number(raw.store.sold_items_sum_qty ?? 0),

        // map category titles if you later include them
        categories: [],

        // build a consistent social array from social_links
        social_links: (raw.store.social_links || []).map((link) => ({
          id: link.id,
          type: link.type,
          url: link.url,
          icon:
            {
              whatsapp: "https://img.icons8.com/color/48/whatsapp--v1.png",
              instagram: "https://img.icons8.com/color/48/instagram-new--v1.png",
              x: "https://img.icons8.com/ios-filled/50/x.png",
              facebook: "https://img.icons8.com/color/48/facebook-new.png",
            }[link.type] || null,
        })),

        logo: raw.store.profile_image
          ? { uri: `${HOST}/storage/${raw.store.profile_image}` }
          : require("../../../assets/Ellipse 18.png"),
        background: raw.store.banner_image
          ? { uri: `${HOST}/storage/${raw.store.banner_image}` }
          : require("../../../assets/Rectangle 30.png"),
      }
      : null,
  };


  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [showPhone, setShowPhone] = useState(false);
  const storePhoneNumber = "08077601234";
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Variants array (always an array)
  const variations = Array.isArray(product?.variations)
    ? product.variations
    : [];

  // Which attributes are actually used by this product's variants?
  const hasColor = variations.some((v) => !!v.color);
  const hasSize = variations.some((v) => !!v.size);

  // Consider a variant only when all required attributes are selected
  const isVariantSelectionComplete =
    (!hasColor || !!selectedColor) && (!hasSize || !!selectedSize);

  const selectedVariant = isVariantSelectionComplete
    ? variations.find(
      (v) =>
        (!hasColor || v.color === selectedColor) &&
        (!hasSize || v.size === selectedSize)
    )
    : null;

  const increment = () => {
    setQuantity((q) => q + 1);
  };
  const decrement = () => {
    setQuantity((q) => {
      if (q > 1) {
        return q - 1;
      }
      return q;
    });
  };
  // const matchedVariant = product?.variations?.find(
  //   v =>
  //     (!selectedColor || v.color === selectedColor) &&
  //     (!selectedSize || v.size === selectedSize)
  // );

  // if (isLoading) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#E53E3E" />
  //     </SafeAreaView>
  //   );
  // }

  // if (isError || !product) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ThemedText>Failed to load product details.</ThemedText>
  //     </SafeAreaView>
  //   );
  // }

  // ---------- Description Other Details ----------
  // Use variant attributes when the product has variations; otherwise hide Other Details
  const variantCandidate = (selectedVariant || (variations[0] || null));
  const specs = product?.has_variants && variantCandidate
    ? {
        SKU: variantCandidate.sku || "-",
        Color: variantCandidate.color || "-",
        Size: variantCandidate.size || "-",
        Price: `₦${Number(
          variantCandidate.discount_price ?? variantCandidate.price ?? 0
        ).toLocaleString()}`,
        Stock: variantCandidate.stock ?? "-",
      }
    : null;

  // ---------- Reviews fallback ----------
  const fallbackReviews = [
    {
      id: "r1",
      user: {
        name: "Adam Sandler",
        avatar: require("../../../assets/Ellipse 18.png"),
      },
      rating: 5,
      text: "Really great product, i enjoyed using it for a long time",
      date: "07-16-25/05:33AM",
      images: [],
      replies: [],
    },
  ];

  const initialReviews = product?.reviews?.length ? product.reviews : [];
  const [reviews, setReviews] = useState(initialReviews);
  const [replyInputs, setReplyInputs] = useState({});
  // Use product's average_rating from API instead of calculating from reviews
  const avg = Number(product?.average_rating || 0);

  const addToCartMutation = useAddToCart({
    onSuccess: (res) => {
      console.log("Cart updated:", JSON.stringify(res, null, 2));
      // Show success feedback
      Alert.alert("Success", "Product added to cart successfully!");
    },
    onError: (err) => {
      console.error("Failed to add to cart:", err);
      Alert.alert("Error", "Failed to add product to cart. Please try again.");
    },
  });

  // const handleAddToCart = () => {
  //   addToCartMutation.mutate({
  //     product_id: product.id,
  //     qty: quantity,
  //     // include variant_id if you implement variation selection:
  //     // variant_id: selectedVariantId
  //   });
  // };

  // Pick the right unit price (variant price > product price)
  const unitPrice = Number(
    (selectedVariant
      ? selectedVariant.discount_price ?? selectedVariant.price
      : product?.discount_price ?? product?.price) ?? 0
  );
  const subtotal = unitPrice * quantity;

  // Subtotal shown on the screen = unit price * qty

  const handleAddToCart = () => {
    if (!product) return;

    // const matchedVariant = product.variations?.find(
    //   v =>
    //     (!selectedColor || v.color === selectedColor) &&
    //     (!selectedSize || v.size === selectedSize)
    // );

    const payload = {
      product_id: product.id,
      qty: quantity,
    };

    if (selectedVariant?.id) {
      payload.variant_id = selectedVariant.id;
    }

    addToCartMutation.mutate(payload);
  };
  const socialIconMap= {
    whatsapp: "https://img.icons8.com/color/48/whatsapp--v1.png",
    instagram: "https://img.icons8.com/color/48/instagram-new--v1.png",
    x: "https://img.icons8.com/ios-filled/50/x.png",
    facebook: "https://img.icons8.com/color/48/facebook-new.png",
  };


  const handleSendReply = (reviewId) => {
    const text = (replyInputs[reviewId] || "").trim();
    if (!text) return;
    const now = new Date();
    const newReply = {
      id: `rep-${now.getTime()}`,
      name: product?.store?.store_name ?? "Store",
      avatar: require("../../../assets/Ellipse 18.png"),
      text,
      date: `${now.toLocaleDateString()} ${now
        .toLocaleTimeString()
        .slice(0, 5)}`,
    };
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replies: [...(r.replies || []), newReply] }
          : r
      )
    );
    setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const StarRow = ({ value = 0, size = 16 }) => (
    <View style={{ flexDirection: "row" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name={
            i < Math.floor(value)
              ? "star"
              : value > i && value < i + 1
                ? "star-half"
                : "star-outline"
          }
          size={size}
          color="#E53E3E"
          style={{ marginRight: 3 }}
        />
      ))}
    </View>
  );

  const DescriptionCard = () => (
    <View style={styles.descWrap}>
      <ThemedText style={styles.descLabel}>Product Name</ThemedText>
      <ThemedText style={styles.descValue}>{product?.name}</ThemedText>
      <View style={styles.lightDivider} />

      <ThemedText style={styles.descLabel}>Description</ThemedText>
      <ThemedText style={[styles.descValue, { lineHeight: 20 }]}>
        {product?.description ||
          "Very clean iphone 12 pro max , out of the box , factory unlocked"}
      </ThemedText>
      <View style={styles.lightDivider} />

      {specs ? (
        <>
          <View style={styles.lightDivider} />
          <ThemedText style={styles.descLabel}>Other Details</ThemedText>
          {Object.entries(specs).map(([k, v]) => (
            <View style={styles.specRow} key={k}>
              <ThemedText style={styles.specKey}>{k}</ThemedText>
              <ThemedText style={styles.specVal}>{v}</ThemedText>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );

  const ReviewsSection = () => (
    <View style={styles.reviewsWrap}>
      {reviews.length > 0 ? (
        <>
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <StarRow value={avg} size={28} />
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLeft}>
              {avg.toFixed(1)} Stars
            </ThemedText>
            <ThemedText style={styles.summaryRight}>
              {reviews.length} Reviews
            </ThemedText>
          </View>
          {reviews.map((rv) => (
            <View key={rv.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image source={rv.user.avatar} style={styles.avatar} />
                  <View>
                    <ThemedText style={styles.reviewerName}>
                      {rv.user.name}
                    </ThemedText>
                    <StarRow value={rv.rating} size={12} />
                  </View>
                </View>
                <ThemedText style={styles.reviewDate}>{rv.date}</ThemedText>
              </View>
              <ThemedText style={styles.reviewText}>{rv.text}</ThemedText>
              {!!rv.images?.length && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  {rv.images.map((img, i) => (
                    <Image key={i} source={img} style={styles.reviewThumb} />
                  ))}
                </View>
              )}
              <View style={styles.replyRow}>
                <Ionicons name="return-down-back" size={18} color="#111" />
                <TextInput
                  style={styles.replyInput}
                  placeholder={`Reply as ${product?.store?.store_name ?? "Store"
                    }...`}
                  placeholderTextColor="#888"
                  value={replyInputs[rv.id] ?? ""}
                  onChangeText={(t) =>
                    setReplyInputs((p) => ({ ...p, [rv.id]: t }))
                  }
                  onSubmitEditing={() => handleSendReply(rv.id)}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={styles.replySend}
                  onPress={() => handleSendReply(rv.id)}
                >
                  <Ionicons name="paper-plane-outline" size={16} color="#111" />
                </TouchableOpacity>
              </View>
              {rv.replies?.map((rep) => (
                <View key={rep.id} style={styles.sellerReply}>
                  <Image source={rep.avatar} style={styles.sellerAvatar} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.sellerName}>
                      {rep.name}
                    </ThemedText>
                    <ThemedText style={styles.sellerDate}>
                      {rep.date}
                    </ThemedText>
                    <ThemedText style={styles.sellerText}>
                      {rep.text}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : (
        <View style={{ padding: 24, alignItems: "center" }}>
          <ThemedText
            style={{
              color: "#888",
              textAlign: "center",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            No reviews yet
          </ThemedText>
          <ThemedText
            style={{ color: "#666", textAlign: "center", fontSize: 14 }}
          >
            Be the first to review this product!
          </ThemedText>
        </View>
      )}
    </View>
  );

  // Helper to map images and video for FlatList
  const imagesArray = product?.images || [];
  const hasVideo = product?.video && product.video !== "/tmp/php2hg0uqh6nnnn8Pmk6hP"; // Check if video exists and is not placeholder
  
  // Create media array with video first (if exists) then images
  const allMedia = [];
  
  // Add video as first item if it exists
  if (hasVideo) {
    allMedia.push({
      type: 'video',
      uri: `https://colala.hmstech.xyz/storage/${product.video}`,
      id: 'video'
    });
  }
  
  // Add images
  allMedia.push(...imagesArray.map((im) => ({
    type: 'image',
    uri: `https://colala.hmstech.xyz/storage/${im.path}`,
    id: im.id
  })));
  
  const mainImage =
    imagesArray.find((im) => Number(im.is_main) === 1) ||
    imagesArray[0] ||
    null;
  const imageSource = mainImage?.path
    ? { uri: `https://colala.hmstech.xyz/storage/${mainImage.path}` }
    : require("../../../assets/phone5.png");

  // Debug logging
  console.log("Product images:", product?.images);
  console.log("Product video:", product?.video);
  console.log("Has video:", hasVideo);
  console.log("All media:", allMedia);
  console.log("Image source:", imageSource);

  const toNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#E53E3E" />
        </View>
      ) : isError || !product ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText>Failed to load product details.</ThemedText>
        </View>
      ) : (
        <>
          {/* Header loading indicator */}
          {isLoading && (
            <View style={styles.headerLoadingContainer}>
              <ActivityIndicator size="small" color="#E53E3E" />
              <ThemedText style={styles.headerLoadingText}>Loading product details...</ThemedText>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
          >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* <TouchableOpacity
                style={[styles.headerIcon, { marginRight: 10 }]}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#000" />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.headerIcon}
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

          {/* MAIN MEDIA CAROUSEL */}
          {allMedia.length > 1 ? (
            <View style={styles.imageCarouselContainer}>
              {console.log(
                "Rendering carousel with",
                allMedia.length,
                "media items"
              )}
              {console.log("All media data:", allMedia)}
              <FlatList
                ref={carouselRef}
                data={allMedia}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width: "100%", height: 250 }}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                    event.nativeEvent.layoutMeasurement.width
                  );
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{
                      width: Dimensions.get("window").width,
                      height: 250,
                    }}
                    onPress={handleImageClick}
                  >
                    {item.type === 'video' ? (
                      <View style={styles.videoContainer}>
                        <Video
                          ref={videoRef}
                          source={{ uri: item.uri }}
                          style={styles.mainImage}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={currentVideoIndex === index && isVideoPlaying}
                          isLooping={false}
                          onPlaybackStatusUpdate={handleVideoStatusUpdate}
                          onError={(error) => {
                            console.log("Carousel video load error:", error);
                          }}
                        />
                        <TouchableOpacity
                          style={styles.videoPlayButton}
                          onPress={() => handleVideoPlay(index)}
                        >
                          <Ionicons 
                            name={currentVideoIndex === index && isVideoPlaying ? "pause-circle" : "play-circle"} 
                            size={60} 
                            color="rgba(255,255,255,0.8)" 
                          />
                        </TouchableOpacity>
                        <View style={styles.videoOverlay}>
                          <ThemedText style={styles.videoLabel}>VIDEO</ThemedText>
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.mainImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log("Carousel image load error:", error);
                        }}
                        onLoad={() => {
                          console.log(
                            "Carousel image loaded successfully:",
                            item.uri
                          );
                        }}
                      />
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              {/* Media indicators */}
              <View style={styles.imageIndicators}>
                {allMedia.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleImageClick}>
              {allMedia.length === 1 && allMedia[0].type === 'video' ? (
                <View style={styles.videoContainer}>
                  <Video
                    ref={videoRef}
                    source={{ uri: allMedia[0].uri }}
                    style={styles.mainImage}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={currentVideoIndex === 0 && isVideoPlaying}
                    isLooping={false}
                    onPlaybackStatusUpdate={handleVideoStatusUpdate}
                    onError={(error) => {
                      console.log("Single video load error:", error);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.videoPlayButton}
                    onPress={() => handleVideoPlay(0)}
                  >
                    <Ionicons 
                      name={currentVideoIndex === 0 && isVideoPlaying ? "pause-circle" : "play-circle"} 
                      size={60} 
                      color="rgba(255,255,255,0.8)" 
                    />
                  </TouchableOpacity>
                  <View style={styles.videoOverlay}>
                    <ThemedText style={styles.videoLabel}>VIDEO</ThemedText>
                  </View>
                </View>
              ) : (
                <Image
                  source={imageSource}
                  style={styles.mainImage}
                  onError={(error) => {
                    console.log("Single image load error:", error);
                  }}
                  onLoad={() => {
                    console.log("Single image loaded successfully:", imageSource);
                  }}
                />
              )}
            </TouchableOpacity>
          )}

          <View style={{ backgroundColor: "#F5F7FF" }}>
            <FlatList
              horizontal
              data={allMedia}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentImageIndex(index);
                    // Scroll the carousel to the selected media
                    if (carouselRef.current) {
                      carouselRef.current.scrollToIndex({
                        index: index,
                        animated: true,
                      });
                    }
                  }}
                  style={[
                    styles.thumbnailContainer,
                    index === currentImageIndex && styles.selectedThumbnail
                  ]}
                >
                  {item.type === 'video' ? (
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
                  ) : (
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 10,
                marginTop: 10,
                marginBottom: 10,
              }}
            />

            <View style={styles.tabsRow}>
              {["Overview", "Description", "Reviews"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    selectedTab === tab && styles.tabActive,
                  ]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      selectedTab === tab && styles.tabTextActive,
                    ]}
                  >
                    {tab}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedTab === "Description" ? (
            <DescriptionCard />
          ) : selectedTab === "Reviews" ? (
            <ReviewsSection />
          ) : (
            <>
              <View style={styles.productInfo}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.productName}>
                    {product.name}
                  </ThemedText>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={20} color="red" />
                    <ThemedText style={styles.rating}>{product?.average_rating || 0}</ThemedText>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <ThemedText style={styles.price}>
                    {toNaira(unitPrice)}
                  </ThemedText>
                  {/* Show crossed original price only when a discount is in effect for the active item */}
                  {(
                    selectedVariant?.discount_price
                      ? selectedVariant?.price
                      : !selectedVariant && product?.discount_price
                        ? product?.price
                        : null
                  ) ? (
                    <ThemedText style={styles.originalPrice}>
                      {toNaira(
                        selectedVariant?.discount_price
                          ? selectedVariant?.price
                          : product?.price
                      )}
                    </ThemedText>
                  ) : null}
                </View>

                {/* Variations */}
                {product.variations?.length ? (
                  <View style={{ marginTop: 12 }}>
                    <ThemedText style={{ fontWeight: "500", marginBottom: 6 }}>
                      Color
                    </ThemedText>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {Array.from(
                        new Set(product.variations.map((v) => v.color).filter(Boolean))
                      ).map((color, i) => (
                        <TouchableOpacity
                          key={i}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: color?.toLowerCase() || '#ccc',
                            borderWidth: 2,
                            borderColor:
                              selectedColor === color ? "#E53E3E" : "#ccc",
                          }}
                          onPress={() => setSelectedColor(color)}
                        />
                      ))}
                    </View>

                    <ThemedText
                      style={{
                        fontWeight: "500",
                        marginTop: 12,
                        marginBottom: 6,
                      }}
                    >
                      Size
                    </ThemedText>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {Array.from(
                        new Set(product.variations.map((v) => v.size).filter(Boolean))
                      ).map((size, i) => (
                        <TouchableOpacity
                          key={i}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor:
                              selectedSize === size ? "#E53E3E" : "#ccc",
                          }}
                          onPress={() => setSelectedSize(size)}
                        >
                          <ThemedText>{(size || "").toString().toUpperCase()}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.divider} />
                <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText style={styles.description}>
                  {product.description || "No description available"}
                </ThemedText>
                <View style={styles.divider} />
              </View>

              {/* SUBTOTAL & CART */}
              <View style={styles.subtotalRow}>
                <View>
                  <ThemedText style={styles.subtotalLabel}>Subtotal</ThemedText>
                  <ThemedText style={styles.subtotal}>
                    {/* {toNaira(product.discount_price || product.price)} */}
                    {toNaira(subtotal)}
                  </ThemedText>
                </View>
                {/* Cart Icon - Display only, navigates to cart */}
                <TouchableOpacity
                  style={styles.cartIcon}
                  onPress={() => navigation.navigate('ServiceNavigator', { screen: 'Cart' })}
                >
                  <View style={styles.cartIconContainer}>
                    <Image
                      source={require("../../../assets/ShoppingCartSimple.png")}
                      style={{ width: 30, height: 28, resizeMode: "contain" }}
                    />
                    {cartQuantity > 0 && (
                      <View style={styles.cartBadge}>
                        <ThemedText style={styles.cartBadgeText}>
                          {cartQuantity > 99 ? "99+" : cartQuantity}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={[
                      styles.qtyButton,
                      { backgroundColor: "#E53E3E", paddingHorizontal: 14 },
                    ]}
                    onPress={decrement}
                  >
                    <ThemedText style={[styles.qtyText, { color: "#fff" }]}>
                      -
                    </ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.qtyNumber}>{quantity}</ThemedText>
                  <TouchableOpacity
                    style={[styles.qtyButton, { backgroundColor: "#E53E3E" }]}
                    onPress={increment}
                  >
                    <ThemedText style={[styles.qtyText, { color: "#fff" }]}>
                      +
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />

              {/* CONTACT BUTTONS */}
             <View style={styles.contactRow}>
  {/* WhatsApp */}
  <TouchableOpacity
    style={styles.contactBtn}
    onPress={() => {
      if (storePhoneNumber) {
        const phone = storePhoneNumber.replace(/\D/g, ""); // clean digits
        Linking.openURL(`https://wa.me/${phone}`).catch(err =>
          console.log("WhatsApp error:", err)
        );
      }
    }}
  >
    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
  </TouchableOpacity>

  {/* Call */}
  <TouchableOpacity
    style={styles.contactBtn}
    onPress={() => {
      if (storePhoneNumber) {
        Linking.openURL(`tel:${storePhoneNumber}`).catch(err =>
          console.log("Call error:", err)
        );
      }
    }}
  >
    <Ionicons name="call-outline" size={20} color="#000" />
  </TouchableOpacity>

  {/* Chat */}
  <TouchableOpacity
    style={styles.contactBtn}
    onPress={handleStartChat}
    disabled={creatingChat}
  >
    {creatingChat ? (
      <ActivityIndicator size="small" color="#000" />
    ) : (
      <Ionicons name="chatbubble-outline" size={20} color="#000" />
    )}
  </TouchableOpacity>

  {/* Phone Number Display */}
  {showPhone && (
    <View style={styles.phoneDisplay}>
      <ThemedText style={styles.phoneNumber}>{storePhoneNumber}</ThemedText>
    </View>
  )}

  {/* Reveal Number / Dial */}
  <TouchableOpacity
    style={styles.revealBtn}
    onPress={() => {
      if (showPhone) {
        // If phone is already revealed, dial the number
        Linking.openURL(`tel:${storePhoneNumber}`).catch(err =>
          console.log("Call error:", err)
        );
      } else {
        // If phone is not revealed, reveal it
        setShowPhone(true);
      }
    }}
  >
    <ThemedText style={{ color: "#fff", fontSize: 12 }}>
      {showPhone ? "Call Now" : "Reveal Phone Number"}
    </ThemedText>
  </TouchableOpacity>
</View>


              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleAddToCart}
                disabled={addToCartMutation.isLoading}
              >
                {addToCartMutation.isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.checkoutText}>Add to Cart</ThemedText>
                )}
              </TouchableOpacity>

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
                    source={product.store?.background}
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
                      source={product.store?.logo}
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
                        {product.store?.name}
                      </ThemedText>
                      <View
                        style={{ flexDirection: "row", gap: 6, marginTop: 4 }}
                      >
                        {product.store?.categories?.map((cat, i) => (
                          <ThemedText
                            key={i}
                            style={{
                              fontSize: 11,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              backgroundColor:
                                i === 0 ? "#0000FF33" : "#FF000033",
                              color: i === 0 ? "#0000FF" : "#FF0000",
                              borderRadius: 6,
                              fontWeight: "500",
                              borderWidth: 0.5,
                              borderColor: i === 0 ? "#0000FF" : "#FF0000",
                            }}
                          >
                            {cat}
                          </ThemedText>
                        ))}
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
                        {product.store?.rating || 0}
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
                      {product.store?.location}
                    </ThemedText>
                  </View>

                  <View style={styles.socialCard}>
                    {product.store?.social_links?.length ? (
                      product.store.social_links.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          style={styles.socialBox}
                          onPress={() => Linking.openURL(s.url)}
                        >
                          <Image source={{ uri: s.icon }} style={styles.socialImgSm} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <ThemedText style={{ color: '#888', fontSize: 12 }}>
                        No social links yet
                      </ThemedText>
                    )}
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
                          style={styles.statIcon}
                        />
                        <View>
                          <ThemedText style={{ fontSize: 10, color: "#888" }}>
                            Qty Sold
                          </ThemedText>
                          <ThemedText
                            style={{ fontSize: 14, fontWeight: "500" }}
                          >
                            {product.store?.sold}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={styles.verticalDivider} />

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
                          style={styles.statIcon}
                        />
                        <View>
                          <ThemedText style={{ fontSize: 10, color: "#888" }}>
                            Followers
                          </ThemedText>
                          <ThemedText
                            style={{ fontSize: 14, fontWeight: "500" }}
                          >
                            {product.store?.followers}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={styles.verticalDivider} />

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
                            store: product.store,
                            storeId: product.store?.id || product.store_id,
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
            </>
          )}

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
                contentOffset={{ x: viewerImageIndex * Dimensions.get('window').width, y: 0 }}
              >
                {getAllMedia().map((media, index) => (
                  <View key={media.id} style={styles.imageViewerItem}>
                    {media.type === 'video' ? (
                      <View style={styles.videoViewerContainer}>
                        <Video
                          ref={viewerVideoRef}
                          source={{ uri: media.uri }}
                          style={styles.imageViewerImage}
                          resizeMode={ResizeMode.CONTAIN}
                          shouldPlay={currentVideoIndex === index && isVideoPlaying}
                          isLooping={false}
                          onPlaybackStatusUpdate={handleVideoStatusUpdate}
                          onError={(error) => {
                            console.log("Viewer video load error:", error);
                          }}
                        />
                        <TouchableOpacity
                          style={styles.videoViewerPlayButton}
                          onPress={() => handleVideoPlay(index, true)}
                        >
                          <Ionicons 
                            name={currentVideoIndex === index && isVideoPlaying ? "pause-circle" : "play-circle"} 
                            size={80} 
                            color="rgba(255,255,255,0.9)" 
                          />
                        </TouchableOpacity>
                        <View style={styles.videoViewerOverlay}>
                          <ThemedText style={styles.videoViewerLabel}>VIDEO</ThemedText>
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
                  {viewerImageIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.imageViewerNav, styles.imageViewerNavLeft]}
                      onPress={handlePrevMedia}
                    >
                      <Ionicons name="chevron-back" size={30} color="#fff" />
                    </TouchableOpacity>
                  )}

                  {viewerImageIndex < getAllMedia().length - 1 && (
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
                    {viewerImageIndex + 1} / {getAllMedia().length}
                  </ThemedText>
                </View>
              )}
            </View>
          </Modal>
        </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerIcon: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: "400" },
  mainImage: { width: "100%", height: 250, resizeMode: "cover" },
  imageCarouselContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#E53E3E",
  },
  thumbnailContainer: {
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  selectedThumbnail: {
    borderColor: "#E53E3E",
  },
  tabsRow: { flexDirection: "row", paddingHorizontal: 10, marginBottom: 10 },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
    borderWidth: 0.3,
    borderColor: "#CDCDCD",
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#E53E3E" },
  tabText: { fontSize: 12, color: "#888", fontWeight: "400" },
  tabTextActive: { color: "#fff", fontWeight: "500" },
  productInfo: { padding: 16 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: { fontSize: 15, fontWeight: "500", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginLeft: 5 },
  rating: { fontSize: 14, color: "#00000080", marginLeft: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  price: { color: "red", fontWeight: "700", fontSize: 18, marginRight: 8 },
  originalPrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
  },
  divider: { height: 1, backgroundColor: "#E5E5E5", marginVertical: 10 },
  sectionTitle: { marginTop: 5, fontWeight: "500", fontSize: 13 },
  description: { fontSize: 12, color: "#444", marginTop: 4 },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: -5,
  },
  subtotalLabel: { fontSize: 12, color: "#444" },
  subtotal: { color: "red", fontWeight: "700", fontSize: 14 },
  cartIcon: {
    marginLeft: "auto",
    marginRight: 10,
    borderColor: "#ccc",
    borderRadius: 15,
    borderWidth: 1,
    padding: 6,
  },
  cartIconContainer: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#E53E3E",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    overflow: "hidden",
  },
  qtyButton: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 7 },
  qtyText: { fontSize: 18 },
  qtyNumber: { paddingHorizontal: 15, color: "#E53E3E", fontSize: 16 },
  contactRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  contactBtn: {
    borderColor: "#ccc",
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
  },
  phoneDisplay: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  revealBtn: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    paddingVertical: 15,
  },
  checkoutBtn: {
    backgroundColor: "red",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  checkoutText: { color: "#fff", fontWeight: "400" },
  descWrap: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
  },
  descLabel: { color: "#7A7A7A", fontSize: 12, marginBottom: 6 },
  descValue: { color: "#161616", fontSize: 14, marginBottom: 8 },
  lightDivider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 8 },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  specKey: { color: "#6A6A6A", fontSize: 13, flex: 1 },
  specVal: {
    color: "#161616",
    fontSize: 13,
    flexShrink: 1,
    textAlign: "right",
  },
  reviewsWrap: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    paddingBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  summaryLeft: { color: "#E53E3E", fontWeight: "500" },
  summaryRight: { color: "#111", fontWeight: "500" },
  reviewCard: {
    backgroundColor: "#F7F7F7",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  reviewerName: { fontSize: 14, fontWeight: "600" },
  reviewDate: { fontSize: 10, color: "#888" },
  reviewText: { marginTop: 8, fontSize: 13, color: "#222" },
  reviewThumb: { width: 62, height: 62, borderRadius: 10, resizeMode: "cover" },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#111",
  },
  replySend: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerReply: { flexDirection: "row", gap: 10, marginTop: 10 },
  sellerAvatar: { width: 28, height: 28, borderRadius: 14, marginTop: 2 },
  sellerName: { fontSize: 13, fontWeight: "600" },
  sellerDate: { fontSize: 9, color: "#999", marginTop: 2 },
  sellerText: { fontSize: 12, color: "#333", marginTop: 6 },
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
    socialCard: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  socialBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  socialImgSm: {
    width: 22,
    height: 22,
    resizeMode: "contain",
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

  // Video styles
  videoContainer: {
    position: "relative",
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
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
    fontSize: 10,
    fontWeight: "600",
  },
  videoThumbnailContainer: {
    position: "relative",
    width: 60,
    height: 60,
  },
  videoThumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  videoViewerContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoViewerPlayButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
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
    fontSize: 12,
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


