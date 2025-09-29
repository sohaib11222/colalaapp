import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../../components/ThemedText";
import { useProductDetails, useCart } from "../../../config/api.config";
import { useAddToCart } from "../../../config/api.config";

const HOST = "https://colala.hmstech.xyz";

import { useSavedToggleItem } from "../../../config/api.config";
import { useCheckSavedItem } from "../../../config/api.config";

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

  // State for saved status
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  
  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  // Calculate total cart items count
  const cartCount =
    cartData?.data?.items?.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    ) || 0;

  // Debug cart data
  console.log("Cart Data:", cartData);
  console.log("Cart Count:", cartCount);

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

  // Check saved status when component mounts
  useEffect(() => {
    if (productId) {
      checkSaved({
        type: "product",
        type_id: productId.toString(),
      });
    }
  }, [productId]);

  // Handle heart icon press
  const handleHeartPress = () => {
    if (productId && !isToggling) {
      toggleSaved({
        type: "product",
        type_id: productId.toString(),
      });
    }
  };

  // Helper function to get all images for viewer
  const getAllImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images.map(img => ({ uri: `https://colala.hmstech.xyz/storage/${img.path}` }));
    }
    return [];
  };

  // Handle image click
  const handleImageClick = () => {
    setViewerImageIndex(0);
    setImageViewerVisible(true);
  };

  // Handle image viewer navigation
  const handleNextImage = () => {
    const images = getAllImages();
    if (viewerImageIndex < images.length - 1) {
      setViewerImageIndex(viewerImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (viewerImageIndex > 0) {
      setViewerImageIndex(viewerImageIndex - 1);
    }
  };

  const product = raw && {
    ...raw,
    store: raw.store
      ? {
          name: raw.store.store_name,
          location: raw.store.store_location,
          rating: 4.5, // Default rating since not in API
          followers: 0, // Default value since not in API
          sold: 0, // Default value since not in API
          categories: [], // Default empty array since not in API
          social: {
            whatsapp: null,
            instagram: null,
            x: null,
            facebook: null,
          },
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

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : q));

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

  // ---------- Description defaults ----------
  const specs = {
    brand: product?.brand ?? "Apple",
    model: product?.name ?? "12 pro Max",
    color: "Black",
    storage: "64 gig",
    resolution: "1080 x 1920",
    display: "IPS LCD",
    screenSize: "6.5",
    battery: "3000 mah",
    sim: "Nanosim",
    camera: "20 mega pixel",
  };

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
  const avg =
    Math.round(
      (reviews.reduce((s, r) => s + (r.rating || 0), 0) /
        (reviews.length || 1)) *
        2
    ) / 2;

  const addToCartMutation = useAddToCart({
    onSuccess: (res) => {
      // console.log("Cart updated:", res);
      console.log("Cart updated:", JSON.stringify(res, null, 2));
      // You can show a toast or navigate to Cart screen here
    },
    onError: (err) => {
      console.error("Failed to add to cart:", err);
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

      <ThemedText style={styles.descLabel}>Other Details</ThemedText>
      {Object.entries(specs).map(([k, v]) => (
        <View style={styles.specRow} key={k}>
          <ThemedText style={styles.specKey}>{k}</ThemedText>
          <ThemedText style={styles.specVal}>{v}</ThemedText>
        </View>
      ))}
    </View>
  );

  const ReviewsSection = () => (
    <View style={styles.reviewsWrap}>
      {reviews.length > 0 ? (
        <>
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <StarRow value={avg || 4} size={28} />
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLeft}>
              {Math.round(avg) || 4} Stars
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
                  placeholder={`Reply as ${
                    product?.store?.store_name ?? "Store"
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

  // Helper to map images for FlatList
  // const mainImage = product?.images?.find((im) => Number(im.is_main) === 1) || product?.images?.[0];
  // const imageSource = mainImage?.path
  //   ? { uri: `https://colala.hmstech.xyz/storage/${mainImage.path}` }
  //   : require("../../../assets/phone5.png");
  // const allImages = (product.images || []).map((im) => ({
  //   uri: `https://colala.hmstech.xyz/storage/${im.path}`,
  // }));

  const imagesArray = product?.images || [];
  const mainImage =
    imagesArray.find((im) => Number(im.is_main) === 1) ||
    imagesArray[0] ||
    null;
  const imageSource = mainImage?.path
    ? { uri: `https://colala.hmstech.xyz/storage/${mainImage.path}` }
    : require("../../../assets/phone5.png");
  const allImages = imagesArray.map((im) => ({
    uri: `https://colala.hmstech.xyz/storage/${im.path}`,
  }));

  // Debug logging
  console.log("Product images:", product?.images);
  console.log("Images array:", imagesArray);
  console.log("All images:", allImages);
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

          {/* MAIN IMAGE CAROUSEL */}
          {allImages.length > 1 ? (
            <View style={styles.imageCarouselContainer}>
              {console.log(
                "Rendering carousel with",
                allImages.length,
                "images"
              )}
              {console.log("All images data:", allImages)}
              <FlatList
                data={allImages}
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
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      width: Dimensions.get("window").width,
                      height: 250,
                    }}
                    onPress={handleImageClick}
                  >
                    <Image
                      source={item}
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
                  </TouchableOpacity>
                )}
                keyExtractor={(_, index) => index.toString()}
              />
              {/* Image indicators */}
              <View style={styles.imageIndicators}>
                {allImages.map((_, index) => (
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
            </TouchableOpacity>
          )}

          <View style={{ backgroundColor: "#F5F7FF" }}>
            <FlatList
              horizontal
              data={allImages}
              renderItem={({ item }) => (
                <Image source={item} style={styles.thumbnail} />
              )}
              keyExtractor={(_, index) => index.toString()}
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
                    <ThemedText style={styles.rating}>4.5</ThemedText>
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
                        new Set(product.variations.map((v) => v.color))
                      ).map((color, i) => (
                        <TouchableOpacity
                          key={i}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: color.toLowerCase(),
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
                        new Set(product.variations.map((v) => v.size))
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
                          <ThemedText>{size.toUpperCase()}</ThemedText>
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
                <TouchableOpacity
                  style={styles.cartIcon}
                  onPress={handleAddToCart}
                >
                  {addToCartMutation.isLoading ? (
                    <ActivityIndicator size="small" color="#E53E3E" />
                  ) : (
                    <View style={styles.cartIconContainer}>
                      <Image
                        source={require("../../../assets/ShoppingCartSimple.png")}
                        style={{ width: 24, height: 24, resizeMode: "contain" }}
                      />
                      {(cartCount > 0 || cartData) && (
                        <View style={styles.cartBadge}>
                          <ThemedText style={styles.cartBadgeText}>
                            {cartCount > 99 ? "99+" : cartCount || "0"}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}
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
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="logo-whatsapp" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="call-outline" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.revealBtn}
                  onPress={() => setShowPhone((s) => !s)}
                >
                  <ThemedText style={{ color: "#fff", fontSize: 12 }}>
                    {showPhone ? storePhoneNumber : "Reveal Phone Number"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => {
                  navigation.navigate("ServiceNavigator", {
                    screen: "Shipping",
                    params: {
                      stores: [
                        {
                          id: product.store?.id || product.store_id,
                          name:
                            product.store?.name || product.store?.store_name,
                          selected: true,
                          items: [
                            {
                              id: product.id,
                              name: product.name,
                              price: unitPrice,
                              quantity: quantity,
                              image: imageSource,
                              store: product.store,
                            },
                          ],
                        },
                      ],
                    },
                  });
                }}
              >
                <ThemedText style={styles.checkoutText}>Checkout</ThemedText>
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
                        {product.store?.rating}
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

                  <View
                    style={{
                      flexDirection: "row",
                      paddingHorizontal: 5,
                      marginVertical: 10,
                      paddingVertical: 5,
                      marginHorizontal: 10,
                      gap: 7,
                      borderRadius: 10,
                      borderColor: "#CDCDCD",
                      borderWidth: 1,
                    }}
                  >
                    <TouchableOpacity style={styles.socialBox}>
                      <Image
                        source={product.store?.social?.whatsapp}
                        style={styles.socialImgLg}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBox}>
                      <Image
                        source={product.store?.social?.instagram}
                        style={styles.socialImgSm}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBox}>
                      <Image
                        source={product.store?.social?.x}
                        style={styles.socialImgXs}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBox}>
                      <Image
                        source={product.store?.social?.facebook}
                        style={styles.socialImgSm}
                      />
                    </TouchableOpacity>
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
                {getAllImages().map((image, index) => (
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
              {getAllImages().length > 1 && (
                <>
                  {viewerImageIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.imageViewerNav, styles.imageViewerNavLeft]}
                      onPress={handlePrevImage}
                    >
                      <Ionicons name="chevron-back" size={30} color="#fff" />
                    </TouchableOpacity>
                  )}
                  
                  {viewerImageIndex < getAllImages().length - 1 && (
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
              {getAllImages().length > 1 && (
                <View style={styles.imageCounter}>
                  <ThemedText style={styles.imageCounterText}>
                    {viewerImageIndex + 1} / {getAllImages().length}
                  </ThemedText>
                </View>
              )}
            </View>
          </Modal>
        </ScrollView>
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
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
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
});
