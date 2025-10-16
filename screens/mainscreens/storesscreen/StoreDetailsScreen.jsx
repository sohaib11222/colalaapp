import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

// 🔗 API hooks + helpers
import {
  useStoreDetails,
  useStoreReviews,
  useAddStoreReview,
  fileUrl,
  useStartChat,
  useChats,
  useTogglePostLike,
  useAddPostComment,
  useGetPostComments,
} from "../../../config/api.config";

import { useToggleFollowStore } from "../../../config/api.config";
import { useCheckFollowedStore } from "../../../config/api.config";
import { useCategories, useAllBrands } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");
const COLOR = {
  primary: "#EF534E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  pill: "#F1F2F5",
  success: "#2ECC71",
  line: "#ECEDEF",
};

const COVER_H = 145;
const AVATAR = 56;
const CARD_W = (width - 48) / 2;

// Helper function for time formatting
const timeAgo = (iso) => {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

// use images instead of vector icons in the stats card (kept as-is)
const STATS_ICONS = {
  sold: require("../../../assets/shop.png"),
  users: require("../../../assets/profile-2user.png"),
  star: { uri: "https://img.icons8.com/ios/50/star--v1.png" },
};

// Helper: Image can accept require(...) or URL
const toSrc = (v) =>
  typeof v === "number" ? v : v ? { uri: String(v) } : undefined;

export default function StoreDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // From Stores screen: params: { store: item, storeId }
  let initialStore = route?.params?.store ?? {};
  const storeId =
    route?.params?.storeId ?? initialStore?._api?.id ?? initialStore?.id;

  if (typeof initialStore === "string") {
    try {
      initialStore = JSON.parse(initialStore);
    } catch {}
  }

  // ======== Fetch the live store and reviews ========
  const { data: storeRes } = useStoreDetails(storeId);
  const apiStore = storeRes?.data; // matches your response shape: { status, data: {...} }

  const { data: reviewsRes } = useStoreReviews(storeId);
  const reviewsApiList = reviewsRes?.data ?? apiStore?.store_reveiews; // prefer endpoint; fallback to payload key
  const { mutateAsync: startChat, isPending: creatingChat } = useStartChat();
  
  // Fetch existing chats to check for duplicates
  const { data: chatsData } = useChats();

  // Follow/Unfollow functionality
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  
  const { mutateAsync: toggleFollow, isPending: isTogglingFollow } = useToggleFollowStore({
    onSuccess: (response) => {
      console.log("Toggle follow response:", response);
      if (response?.status === "success") {
        setIsFollowing(response.data.following);
      }
    },
    onError: (error) => {
      console.error("Follow toggle error:", error);
    }
  });

  const { mutateAsync: checkFollow } = useCheckFollowedStore({
    onSuccess: (response) => {
      console.log("Check follow response:", response);
      if (response?.status === "success") {
        setIsFollowing(response.data.following);
      }
      setIsCheckingFollow(false);
    },
    onError: (error) => {
      console.error("Check follow error:", error);
      setIsCheckingFollow(false);
    }
  });

  // Debug logging
  console.log("Current follow state:", { isFollowing, isCheckingFollow, isTogglingFollow });

  // ======== Merge API over your existing object (keep hardcoded when absent) ========
  const mergedStore = useMemo(() => {
    // hardcoded fallbacks (KEEP per your design)
    const fallbackCover =
      initialStore?.cover ||
      "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1600&auto=format&fit=crop";
    const fallbackAvatar =
      initialStore?.avatar ||
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop";

    const fromApi = apiStore || {};

    const name = fromApi.store_name || initialStore?.name || "Store";
    const email = fromApi.store_email || "sashastores@gmail.com"; // not always present → keep hardcoded if missing
    const phone = fromApi.store_phone || "070123456789"; // not always present → keep hardcoded if missing
    const location = fromApi.store_location || "Lagos, Nigeria"; // keep your default if missing

    // media
    const cover = fileUrl(fromApi.banner_image) || fallbackCover;
    const avatar = fileUrl(fromApi.profile_image) || fallbackAvatar;

    // stats
    const qtySold =
      typeof fromApi.total_sold === "number" ? fromApi.total_sold : 100; // KEEP hardcoded if missing
    const followers = Array.isArray(fromApi.followers)
      ? fromApi.followers.length
      : 500; // KEEP hardcoded if array missing
    const rating =
      typeof fromApi.rating === "number" && fromApi.rating > 0
        ? fromApi.rating
        : 4.7; // KEEP hardcoded if 0 or absent

    // social
    const social_links = Array.isArray(fromApi.social_links)
      ? fromApi.social_links
      : [];

    // addresses (just show link text in UI; keep hardcoded line if missing)
    const addresses = Array.isArray(fromApi.addresses) ? fromApi.addresses : [];

    // banners and announcements from API
    const banners = Array.isArray(fromApi.banners) ? fromApi.banners : [];
    const announcements = Array.isArray(fromApi.announcements) ? fromApi.announcements : [];
    const posts = Array.isArray(fromApi.posts) ? fromApi.posts : [];

    // products mapping → your card expects: image, title/name, price text, store name/avatar, rating, etc.
    const productsFromApi = Array.isArray(fromApi.products)
      ? fromApi.products.map((p) => {
          const mainImg = Array.isArray(p.images)
            ? p.images.find((im) => im.is_main) || p.images[0]
            : null;
          const imgUrl = mainImg?.path ? fileUrl(mainImg.path) : null;

          return {
            id: String(p.id),
            title: p.name || "Product",
            name: p.name || "Product",
            categoryId: p.category_id ?? null,
            brandId: p.brand ? Number(p.brand) : null,
            store: name,
            store_image: avatar,
            location: location || "Lagos, Nigeria",
            rating: rating || 4.5,
            // keep your price styling; if you need ₦ formatting, you can add it later
            price:
              p.discount_price && Number(p.discount_price) > 0
                ? `₦${p.discount_price}`
                : `₦${p.price}`,
            originalPrice:
              p.discount_price && Number(p.discount_price) > 0
                ? `₦${p.price}`
                : undefined,
            image: imgUrl,
            tagImages: [], // not in API → keep empty (your demo still supports tags for DEMO items)
            sponsored: false,
            _api: p,
          };
        })
      : [];

    const finalThemeColor = fromApi.theme_color || initialStore?.theme_color || COLOR.primary;
    
    return {
      id: String(fromApi.id ?? initialStore?.id ?? storeId ?? "0"),
      name,
      email,
      phone,
      location,
      cover,
      avatar,
      theme_color: finalThemeColor,
      qtySold,
      followers,
      rating,
      social_links,
      addresses,
      banners,
      announcements,
      posts,
      // keep your original store object too:
      _api: fromApi,
      // products priority: API → fall back to your DEMO list
      productsFromApi,
    };
  }, [apiStore, initialStore, storeId]);


  // Debug logging for banners, announcements, and posts
  console.log("Banners data:", mergedStore?.banners);
  console.log("Announcements data:", mergedStore?.announcements);
  console.log("Posts data:", mergedStore?.posts);
  console.log("MergedStore object:", mergedStore);
  console.log("Theme color:", mergedStore?.theme_color);

  // ======== Products source (API first, else empty state) ========
  const productsSource = mergedStore?.productsFromApi || [];

  // ======== Social Feed (empty state when no posts) ========
  const postsSource = mergedStore?.posts || [];

  // ======== Search in Products ========
  const [tab, setTab] = useState("Products");
  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const products = useMemo(() => {
    const base = Array.isArray(productsSource) ? productsSource : [];
    const q = (query || "").toLowerCase();
    const textFiltered = q
      ? base.filter(
          (p) =>
            (p?.title || p?.name || "").toLowerCase().includes(q) ||
            (p?.store || "").toLowerCase().includes(q)
        )
      : base;

    const catOk = (p) =>
      !selectedCategoryIds?.length || selectedCategoryIds.includes(p.categoryId);
    const brandOk = (p) =>
      !selectedBrandIds?.length || selectedBrandIds.includes(p.brandId);
    const locOk = (p) =>
      !selectedLocation || (p.location || "").toLowerCase() === selectedLocation.toLowerCase();

    return textFiltered.filter((p) => catOk(p) && brandOk(p) && locOk(p));
  }, [query, productsSource, selectedCategoryIds, selectedBrandIds, selectedLocation]);

  // ======== Reviews: API ↔ UI mapping (keep demo if none) ========
  const mapApiReviewToUi = (rv) => ({
    id: String(rv.id),
    user: rv?.user?.full_name || "Anonymous",
    avatar: fileUrl(rv?.user?.profile_picture) || mergedStore?.avatar,
    rating: Number(rv.rating) || 0,
    time: new Date(rv.created_at).toLocaleString(),
    text: rv.comment || "",
    replies: [], // API doesn't include replies; keep your local reply UI
  });

  // Map API post to UI format
  const mapApiPostToUi = (post) => {
    const images = Array.isArray(post.media) 
      ? post.media.map(media => fileUrl(media.path))
      : [];
    
    const overrides = postOverrides[post.id] || {};
    const likes =
      typeof overrides.likes === "number"
        ? overrides.likes
        : Number(post.likes_count ?? 0);
    const commentsCount =
      typeof overrides.comments === "number"
        ? overrides.comments
        : Number(post.comments_count ?? 0);
    
    return {
      id: String(post.id),
      store: mergedStore?.name || "Store",
      storeId: mergedStore?.id,
      avatar: mergedStore?.avatar,
      location: mergedStore?.location || "Lagos, Nigeria",
      timeAgo: timeAgo(post.created_at),
      caption: post.body || "",
      images,
      image: images[0],
      likes,
      comments: commentsCount,
      shares: Number(post.shares_count ?? 0),
      _liked: typeof overrides.liked === "boolean" ? overrides.liked : !!post.is_liked,
    };
  };

  const apiReviewsUi = Array.isArray(reviewsApiList)
    ? reviewsApiList.map(mapApiReviewToUi)
    : [];

  const [reviewScope, setReviewScope] = useState("store"); // "store" | "product"
  const [reviewsStore, setReviewsStore] = useState(apiReviewsUi);
  const [reviewsProduct, setReviewsProduct] = useState([]);

  // If API reviews change, update local list while keeping replies feature
  useEffect(() => {
    if (apiReviewsUi.length) setReviewsStore(apiReviewsUi);
  }, [reviewsRes]); // eslint-disable-line

  // Check follow status when component mounts
  useEffect(() => {
    if (storeId) {
      checkFollow({ store_id: String(storeId) });
    }
  }, [storeId, checkFollow]);

  const handleFollowToggle = async () => {
    try {
      await toggleFollow({ store_id: String(storeId) });
    } catch (error) {
      console.error("Follow toggle error:", error);
      Alert.alert("Error", "Failed to update follow status. Please try again.");
    }
  };

  // Check if chat already exists with this store
  const findExistingChat = () => {
    const chats = chatsData?.data || [];
    const storeName = mergedStore?.name || "Store";
    
    // Look for existing chat with this store
    const existingChat = chats.find(chat => 
      chat.store === storeName || 
      chat.store_id === storeId ||
      chat.store_order_id === storeId
    );
    
    return existingChat;
  };

  // Handle chat button press - check for existing chat first
  const handleChatPress = async () => {
    try {
      const storeName = mergedStore?.name || "Store";
      const profileImage = mergedStore?.avatar;
      
      // Check if chat already exists
      const existingChat = findExistingChat();
      
      if (existingChat) {
        // Navigate to existing chat
        console.log("Opening existing chat:", existingChat);
        navigation.navigate("ServiceNavigator", {
          screen: "ChatDetails",
          params: {
            store: { 
              id: storeId, 
              name: storeName, 
              profileImage 
            },
            chat_id: existingChat.chat_id,
            store_order_id: existingChat.store_order_id || storeId,
          },
        });
      } else {
        // Create new chat
        console.log("Creating new chat with store:", storeId);
        const { chat_id } = await startChat({ storeId });
        
        navigation.navigate("ServiceNavigator", {
          screen: "ChatDetails",
          params: {
            store: { id: storeId, name: storeName, profileImage },
            chat_id,
            store_order_id: storeId,
          },
        });
      }
    } catch (e) {
      console.error("Chat error:", e);
      // Fallback: try to navigate without creating chat
      navigation.navigate("ServiceNavigator", {
        screen: "ChatDetails",
        params: {
          store: {
            id: storeId,
            name: mergedStore?.name || "Store",
            profileImage: mergedStore?.avatar,
          },
        },
      });
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch store details and reviews queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] }),
        queryClient.invalidateQueries({ queryKey: ['storeReviews', storeId] })
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, storeId]);

  const activeReviews = reviewScope === "store" ? reviewsStore : reviewsProduct;
  const reviewCount = activeReviews.length;
  const avgRating = reviewCount
    ? activeReviews.reduce((a, r) => a + (r.rating || 0), 0) / reviewCount
    : 0;

  const addReply = (reviewId, text) => {
    const reply = {
      id: `r-${Date.now()}`,
      user: mergedStore?.name || "Sasha Stores",
      avatar: mergedStore?.avatar,
      text,
    };
    const update = (arr) =>
      arr.map((r) =>
        r.id === reviewId ? { ...r, replies: [...(r.replies || []), reply] } : r
      );
    if (reviewScope === "store") setReviewsStore((p) => update(p));
    else setReviewsProduct((p) => update(p));
  };

  // ======== Post a review to API (keep your local behavior if offline) ========
  const { mutate: addReview, isLoading: addingReview } = useAddStoreReview({
    onSuccess: () => {
      setLeaveReviewVisible(false);
      setTab("Reviews");
      setReviewScope("store");
    },
    onError: (err) => {
      Alert.alert("Review", err?.message || "Failed to send review.");
    },
  });

  const [leaveReviewVisible, setLeaveReviewVisible] = useState(false);
  const handleSubmitReview = ({ rating, text }) => {
    // POST to API
    if (storeId) {
      addReview({ storeId, rating, comment: text, images: [] });
      return;
    }
    // Fallback: keep your local behavior if no storeId (shouldn’t happen)
    const newRev = {
      id: `rs-${Date.now()}`,
      user: "Chris Pine",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      rating,
      time: new Date().toISOString().slice(0, 16).replace("T", "/"),
      text: text || "Really great product, I enjoyed using it for a long time",
      replies: [],
    };
    setReviewsStore((prev) => [newRev, ...prev]);
    setLeaveReviewVisible(false);
    setTab("Reviews");
    setReviewScope("store");
  };

  // ======== Components (kept as in your file, only data sources changed) ========
  const Stars = ({ value = 0, size = 16 }) => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(value) ? "star" : "star-outline"}
          size={size}
          color={mergedStore?.theme_color || COLOR.primary}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  const ReviewCard = ({ item, onReply }) => {
    const [text, setText] = useState("");
    const send = () => {
      const v = text.trim();
      if (!v) return;
      onReply?.(item.id, v);
      setText("");
    };

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={toSrc(item.avatar)} style={styles.reviewAvatar} />
            <View>
              <ThemedText style={styles.reviewName}>{item.user}</ThemedText>
              <Stars value={item.rating} size={12} />
            </View>
          </View>
          <ThemedText style={styles.reviewTime}>{item.time}</ThemedText>
        </View>

        <ThemedText style={styles.reviewText}>{item.text}</ThemedText>

        <View style={styles.replyRow}>
          <Ionicons
            name="return-down-back-outline"
            size={18}
            color={COLOR.text}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a reply"
            placeholderTextColor={COLOR.sub}
            style={styles.replyInput}
          />
          <TouchableOpacity style={styles.replySend} onPress={send}>
            <Ionicons name="send" size={18} color={COLOR.text} />
          </TouchableOpacity>
        </View>

        {(item.replies || []).map((r) => (
          <View key={r.id} style={styles.nestedReply}>
            <Image source={toSrc(r.avatar)} style={styles.nestedAvatar} />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.nestedName}>{r.user}</ThemedText>
              <ThemedText style={styles.nestedText}>{r.text}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("CategoryNavigator", {
          screen: "ProductDetails",
          params: {
            productId: item.id,
            product: item,
          },
        })
      }
    >
      <View style={[
        styles.card,
        products.length === 1 && styles.cardSingle
      ]}>
        <View>
          {item?.image ? (
            <Image
              source={toSrc(item.image)}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: "#eee" }]} />
          )}
          {item?.sponsored && (
            <View style={styles.sponsoredBadge}>
              <ThemedText style={styles.sponsoredText}>Sponsored</ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.rowBetween, styles.grayStrip]}>
          <View style={styles.storeRow}>
            {item?.store_image ? (
              <Image
                source={toSrc(item.store_image)}
                style={styles.storeAvatar}
              />
            ) : (
              <View style={[styles.storeAvatar, { backgroundColor: "#ddd" }]} />
            )}
            <ThemedText style={[styles.storeName, { color: mergedStore?.theme_color || "#E53E3E" }]}>
              {item?.store || mergedStore?.name || "Store"}
            </ThemedText>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color={mergedStore?.theme_color || "#E53E3E"} size={12} />
            <ThemedText style={styles.ratingTxt}>
              {item?.rating ?? mergedStore?.rating ?? "4.5"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.productTitle}>
            {item?.title || item?.name || "Product"}
          </ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              {item?.price || "₦2,000,000"}
            </ThemedText>
            {!!item?.originalPrice && (
              <ThemedText style={styles.originalPrice}>
                {item.originalPrice}
              </ThemedText>
            )}
          </View>

          <View style={styles.tagsRow}>
            {(item?.tagImages || []).map((img, i) => (
              <Image
                key={i}
                source={toSrc(img)}
                style={styles.tagIcon}
                resizeMode="contain"
              />
            ))}
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color="#444"
                style={{ marginRight: 2 }}
              />
              <ThemedText style={styles.location}>
                {item?.location || mergedStore?.location || "Lagos, Nigeria"}
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

  // ======== Simple local sheets (unchanged) ========
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [addressesVisible, setAddressesVisible] = useState(false);
  
  // ======== Social Feed functionality ========
  const [activePost, setActivePost] = useState(null);
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportProcessingVisible, setReportProcessingVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [hiddenPosts, setHiddenPosts] = useState(new Set());
  const [postOverrides, setPostOverrides] = useState({}); // id -> { liked, likes, comments }

  // Social feed mutations
  const likeMutation = useTogglePostLike();
  const addCommentMutation = useAddPostComment();

  const handleToggleLike = async (postId) => {
    const res = await likeMutation.mutateAsync(postId);
    setPostOverrides((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        liked: !!res?.data?.liked,
        likes: Number(res?.data?.likes_count ?? 0),
      },
    }));
    return { liked: res?.data?.liked, likes_count: res?.data?.likes_count };
  };

  const handleSubmitComment = async (postId, body) => {
    const res = await addCommentMutation.mutateAsync({ postId, body });
    setPostOverrides((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        comments: Number((prev[postId]?.comments ?? 0) + 1),
      },
    }));
    return res?.data; // created comment payload
  };

  const openComments = (post) => {
    setActivePost(post);
    setCommentsVisible(true);
  };

  const openOptions = (post) => {
    setActivePost(post);
    setOptionsVisible(true);
  };

  const handleHidePost = (postId) => {
    console.log('Hiding post with ID:', postId);
    setHiddenPosts(prev => {
      const newSet = new Set([...prev, postId]);
      console.log('Updated hidden posts:', Array.from(newSet));
      return newSet;
    });
    setOptionsVisible(false);
  };

  const handleShare = () => {
    setOptionsVisible(false);
    setSharePopupVisible(true);
  };

  const handleReport = () => {
    setOptionsVisible(false);
    setReportModalVisible(true);
  };

  const handleReportSubmit = () => {
    if (!reportMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    setReportModalVisible(false);
    setReportProcessingVisible(true);
    // Simulate processing delay
    setTimeout(() => {
      setReportProcessingVisible(false);
      setReportMessage("");
    }, 2000);
  };

  // ======== RENDER ========
  const coverSrc = toSrc(mergedStore?.cover);
  const avatarSrc = toSrc(mergedStore?.avatar);

  const promoSrc = toSrc(
    initialStore?.promo || require("../../../assets/storeimage.png")
  );

  // Safety check to ensure mergedStore is available
  if (!mergedStore) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={{ marginTop: 10, color: COLOR.sub }}>Loading store details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLOR.bg }}
      edges={["top"]}
    >
      {/* Header loading indicator */}
      {!storeRes && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={mergedStore?.theme_color || COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading store details...</ThemedText>
        </View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[mergedStore?.theme_color || COLOR.primary]}
            tintColor={mergedStore?.theme_color || COLOR.primary}
            title="Pull to refresh"
            titleColor={COLOR.sub}
          />
        }
      >
        {/* Cover */}
        <View style={styles.coverWrap}>
          {coverSrc ? (
            <Image source={coverSrc} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: "#e9e9e9" }]} />
          )}

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.circleBtn}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.navigate('AuthNavigator', { screen: 'Search' }) }>
                <Ionicons name="search" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn} onPress={() => Alert.alert("Share", "Share is available on the live application only.") }>
                <Image
                  source={require("../../../assets/Vector (23).png")}
                  style={styles.iconImg}
                />
              </TouchableOpacity>
            </View>
          </View>

          {avatarSrc ? (
            <Image source={avatarSrc} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#fff" }]} />
          )}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Ionicons name="ellipse" size={8} color="#fff" />
            <ThemedText style={styles.statusTxt}>
              Open Now · 07:00AM - 08:00PM
            </ThemedText>
            <TouchableOpacity 
              style={[
                styles.followBtn, 
                { backgroundColor: mergedStore?.theme_color || "#E53E3E" },
                isFollowing && styles.followBtnActive,
                isTogglingFollow && styles.followBtnDisabled
              ]} 
              onPress={handleFollowToggle}
              disabled={isTogglingFollow || isCheckingFollow}
            >
              <ThemedText style={[
                styles.followTxt,
                isFollowing && styles.followTxtActive
              ]}>
                {isCheckingFollow ? "..." : isFollowing ? "Following" : "Follow"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header content */}
        <View style={styles.headerContent}>
          <View style={styles.rowBetween}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <ThemedText
                style={[
                  styles.storeNameHeader,
                  { fontSize: 16, fontWeight: 500, color: "#000" },
                ]}
              >
                {mergedStore?.name || "Store"}
              </ThemedText>
            </View>
          </View>

          {/* Contact + meta (use API when present; keep hardcoded when not) */}
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={16} color={COLOR.sub} />
            <ThemedText style={styles.metaTxt}>
              {mergedStore?.email || "sashastores@gmail.com"}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={16} color={COLOR.sub} />
            <ThemedText style={styles.metaTxt}>
              {mergedStore?.phone || "070123456789"}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={COLOR.sub} />
            <ThemedText style={[styles.metaTxt, { marginBottom: 5 }]}>
              {mergedStore?.location || "Lagos, Nigeria"}
            </ThemedText>
            <TouchableOpacity onPress={() => setAddressesVisible(true)}>
              <ThemedText
                style={[
                  styles.metaTxt,
                  { color: mergedStore?.theme_color || COLOR.primary, textDecorationLine: "underline" },
                ]}
              >
                View Store Addresses
              </ThemedText>
            </TouchableOpacity>
          </View>
          

          {/* Your tags block (not in API) — kept as-is */}
          {!!initialStore?.tags &&
            Array.isArray(initialStore.tags) &&
            initialStore.tags.length > 0 && (
              <View style={styles.tagsRow}>
                <Ionicons name="call-outline" size={16} color={COLOR.sub} />
                <ThemedText style={styles.metaTxt}>Category</ThemedText>
                {initialStore.tags.map((t, i) => (
                  <View
                    key={`${t}-${i}`}
                    style={[
                      styles.tag,
                      i === 0 ? styles.tagBlue : [styles.tagRed, { backgroundColor: mergedStore?.theme_color ? `${mergedStore.theme_color}20` : COLOR.primary + '20' }],
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.tagTxt,
                        i === 0 ? styles.tagTxtBlue : [styles.tagTxtRed, { color: mergedStore?.theme_color || COLOR.primary }],
                      ]}
                    >
                      {t}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
        </View>

        {/* Stats card (API values with hardcoded fallbacks) */}
        <View style={styles.statsCard}>
          <View style={styles.statsTop}>
            <View className="statCol" style={styles.statCol}>
              <View style={styles.statIconWrap}>
                <Image source={STATS_ICONS.sold} style={styles.statIconImg} />
              </View>
              <View>
                <ThemedText style={styles.statLabel}>Qty Sold</ThemedText>
                <ThemedText style={styles.statValue}>
                  {typeof mergedStore?.qtySold === "number"
                    ? mergedStore.qtySold
                    : 100}
                </ThemedText>
              </View>
            </View>

            <View style={styles.vline} />

            <View style={styles.statCol}>
              <View style={styles.statIconWrap}>
                <Image source={STATS_ICONS.users} style={styles.statIconImg} />
              </View>
              <View>
                <ThemedText style={styles.statLabel}>Followers</ThemedText>
                <ThemedText style={styles.statValue}>
                  {typeof mergedStore?.followers === "number"
                    ? mergedStore.followers
                    : 500}
                </ThemedText>
              </View>
            </View>

            <View style={styles.vline} />

            <View style={styles.statCol}>
              <View style={styles.statIconWrap}>
                <Image source={STATS_ICONS.star} style={styles.statIconImg} />
              </View>
              <View>
                <ThemedText style={styles.statLabel}>Ratings</ThemedText>
                <ThemedText style={styles.statValue}>
                  {mergedStore?.rating ?? 4.7}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.statsBottom, { backgroundColor: mergedStore?.theme_color || COLOR.primary }]}>
            <Ionicons name="megaphone-outline" size={16} color="#fff" />
            <ThemedText style={styles.announceTxt}>
              {mergedStore?.announcements?.[0]?.message || "New arrivals coming tomorrow"}
            </ThemedText>
          </View>
        </View>

        {/* Social icons – images (kept as-is) */}
        <View style={styles.socialCard}>
          {[
            {
              id: "wa",
              uri: "https://img.icons8.com/color/48/whatsapp--v1.png",
            },
            {
              id: "ig",
              uri: "https://img.icons8.com/color/48/instagram-new--v1.png",
            },
            { id: "x", uri: "https://img.icons8.com/ios-filled/50/x.png" },
            {
              id: "fb",
              uri: "https://img.icons8.com/color/48/facebook-new.png",
            },
          ].map((s) => (
            <TouchableOpacity key={s.id} style={styles.socialBtn}>
              <Image source={{ uri: s.uri }} style={styles.socialImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner Carousel */}
        <View style={{ marginHorizontal: 16, marginTop: 12 }}>
          {mergedStore?.banners?.length > 0 ? (
            <View style={styles.promoWrap}>
              <FlatList
                data={mergedStore.banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bannerCarouselItem}
                    onPress={() => {
                      if (item.link) {
                        Linking.openURL(item.link).catch(err => 
                          console.log("Banner link error:", err)
                        );
                      }
                    }}
                  >
                    <Image 
                      source={{ uri: fileUrl(item.image_path) }} 
                      style={styles.promoImage} 
                      resizeMode="cover" 
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={styles.promoWrap}>
              <Image
                source={promoSrc}
                style={styles.promoImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Action buttons (kept) */}
        <View style={styles.buttonStack}>
          <TouchableOpacity
            style={[styles.bigBtn, styles.bigBtnRed, { backgroundColor: mergedStore?.theme_color || COLOR.primary }]}
            onPress={async () => {
              try {
                const phone = (mergedStore?.phone || "").toString().trim();
                if (!phone) {
                  Alert.alert("Call", "Phone number not available.");
                  return;
                }
                const telUrl = `tel:${phone}`;
                const supported = await Linking.canOpenURL(telUrl);
                if (supported) await Linking.openURL(telUrl);
                else Alert.alert("Call", "Calling is not supported on this device.");
              } catch (e) {
                Alert.alert("Call", "Failed to start call.");
              }
            }}
          >
            <ThemedText style={styles.bigBtnTxt}>Call</ThemedText>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.bigBtn, styles.bigBtnBlack]}
            onPress={() =>
              navigation.navigate("StoreChat", {
                store: {
                  name: mergedStore?.name || "Sasha Stores",
                  profileImage:
                    typeof mergedStore?.avatar === "number"
                      ? mergedStore.avatar
                      : mergedStore?.avatar || require("../../../assets/Ellipse 18.png"),
                },
              })
            }
          >
            <ThemedText style={styles.bigBtnTxt}>Chat</ThemedText>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.bigBtn, styles.bigBtnBlack]}
            onPress={handleChatPress}
            disabled={creatingChat}
          >
            <ThemedText style={styles.bigBtnTxt}>
              {creatingChat ? "Opening..." : "Chat"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bigBtn, styles.bigBtnGreen]}
            onPress={() => setLeaveReviewVisible(true)}
            disabled={addingReview}
          >
            <ThemedText style={styles.bigBtnTxt}>
              {addingReview ? "Sending..." : "Leave a store review"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["Products", "Social Feed", "Reviews"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabItem, tab === t && [styles.tabActive, { backgroundColor: mergedStore?.theme_color || COLOR.primary }]]}
            >
              <ThemedText
                style={[styles.tabTxt, tab === t && styles.tabTxtActive]}
              >
                {t}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* PRODUCTS tab */}
        {tab === "Products" && (
          <View style={styles.panel}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={18} color={COLOR.sub} />
                  <TextInput
                    placeholder="Search store products"
                    placeholderTextColor={COLOR.sub}
                    value={query}
                    onChangeText={setQuery}
                    style={{ flex: 1, color: COLOR.text }}
                  />
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltersVisible(true)}>
                  <Ionicons name="options-outline" size={18} color={COLOR.text} />
                </TouchableOpacity>
              </View>

              {products.length > 0 ? (
                products.length === 1 ? (
                  <View style={styles.singleProductContainer}>
                    {products.map((item) => (
                      <View key={item.id} style={styles.singleProductWrapper}>
                        {renderProduct({ item })}
                      </View>
                    ))}
                  </View>
                ) : (
                  <FlatList
                    data={products}
                    keyExtractor={(i) => String(i.id)}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-around", gap: 10 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={renderProduct}
                    scrollEnabled={false}
                  />
                )
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons
                    name="storefront-outline"
                    size={64}
                    color={COLOR.sub}
                  />
                  <ThemedText style={styles.emptyStateTitle}>
                    No Products Available
                  </ThemedText>
                  <ThemedText style={styles.emptyStateText}>
                    This store hasn't added any products yet. Check back later for
                    new items.
                  </ThemedText>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        )}

        {/* SOCIAL FEED tab */}
        {tab === "Social Feed" && (
          <View style={{ paddingBottom: 20 }}>
            {(() => {
              const filteredPosts = postsSource.filter((p) => !hiddenPosts.has(String(p.id)));
              return filteredPosts.length > 0 ? (
                filteredPosts.map((p) => (
                  <PostCardLike 
                    key={p.id} 
                    item={mapApiPostToUi(p)} 
                    onOpenComments={openComments}
                    onOpenOptions={openOptions}
                    onToggleLike={handleToggleLike}
                    navigation={navigation}
                    mergedStore={mergedStore}
                  />
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="images-outline" size={64} color={COLOR.sub} />
                  <ThemedText style={styles.emptyStateTitle}>
                    No Social Posts
                  </ThemedText>
                  <ThemedText style={styles.emptyStateText}>
                    This store hasn't shared any posts yet. Follow them to see
                    updates.
                  </ThemedText>
                </View>
              );
            })()}
          </View>
        )}

        {/* REVIEWS tab */}
        {tab === "Reviews" && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={styles.revTabsCard}>
              <View style={styles.revTabsRow}>
                {["store", "product"].map((key) => {
                  const label =
                    key === "store" ? "Store Reviews" : "Product Reviews";
                  const active = reviewScope === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setReviewScope(key)}
                      style={styles.revTabBtn}
                    >
                      <ThemedText
                        style={[
                          styles.revTabTxt,
                          active && styles.revTabTxtActive,
                        ]}
                      >
                        {label}
                      </ThemedText>
                      {active && <View style={styles.revTabUnderline} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.ratingBlock}>
                <Stars value={avgRating} size={28} />
                <View style={styles.ratingMetaRow}>
                  <ThemedText style={styles.ratingLeft}>
                    {Math.round(avgRating) || 0} Stars
                  </ThemedText>
                  <ThemedText style={styles.ratingRight}>
                    {reviewCount} Reviews
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              {activeReviews.length > 0 ? (
                activeReviews.map((rv) => (
                  <ReviewCard key={rv.id} item={rv} onReply={addReply} />
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="star-outline" size={64} color={COLOR.sub} />
                  <ThemedText style={styles.emptyStateTitle}>
                    No Reviews Yet
                  </ThemedText>
                  <ThemedText style={styles.emptyStateText}>
                    Be the first to review this store and share your experience.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom sheets you already had (simplified to keep the file focused) */}
      <ReviewSheet
        visible={leaveReviewVisible}
        onClose={() => setLeaveReviewVisible(false)}
        onSubmit={handleSubmitReview}
        mergedStore={mergedStore}

      />
      <StoreAddressesModal
        visible={addressesVisible}
        onClose={() => setAddressesVisible(false)}
        addresses={mergedStore?.addresses || []}
        mergedStore={mergedStore}
      />
      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        selectedBrandIds={selectedBrandIds}
        setSelectedBrandIds={setSelectedBrandIds}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      {/* Social Feed Modals */}
      <CommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        post={activePost}
        onSubmitComment={handleSubmitComment}
      />
      <OptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onHidePost={() => handleHidePost(activePost?.id)}
        onShare={handleShare}
        onReport={handleReport}
      />

      {/* Share Popup */}
      <Modal
        visible={sharePopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSharePopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <ThemedText style={styles.popupTitle}>Share</ThemedText>
            <ThemedText style={styles.popupMessage}>
              Share is available on the live application only.
            </ThemedText>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => setSharePopupVisible(false)}
            >
              <ThemedText style={styles.popupButtonText}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={() => setReportModalVisible(false)} 
          />
          <View style={styles.reportModal}>
            <View style={styles.reportModalHeader}>
              <ThemedText style={styles.reportModalTitle}>Report Post</ThemedText>
              <TouchableOpacity 
                style={styles.reportCloseBtn} 
                onPress={() => setReportModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.reportModalSubtitle}>
              Please describe the issue with this post
            </ThemedText>

            <TextInput
              style={styles.reportTextInput}
              placeholder="Type your message here..."
              placeholderTextColor={COLOR.sub}
              value={reportMessage}
              onChangeText={setReportMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.reportProceedBtn,
                !reportMessage.trim() && styles.reportProceedBtnDisabled
              ]}
              onPress={handleReportSubmit}
              disabled={!reportMessage.trim()}
            >
              <ThemedText style={styles.reportProceedBtnText}>Proceed</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Report Processing Popup */}
      <Modal
        visible={reportProcessingVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportProcessingVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <ActivityIndicator size="large" color={COLOR.primary} style={{ marginBottom: 16 }} />
            <ThemedText style={styles.popupTitle}>Processing</ThemedText>
            <ThemedText style={styles.popupMessage}>
              Your request is under processing now.
            </ThemedText>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ===== Full Featured PostCard for Social Feed ===== */
function PostCardLike({ item, onOpenComments, onOpenOptions, onToggleLike, navigation, mergedStore }) {
  const [liked, setLiked] = useState(item._liked ?? false);
  const [likeCount, setLikeCount] = useState(item.likes);

  React.useEffect(() => {
    if (typeof item._liked === "boolean") setLiked(item._liked);
    if (typeof item.likes === "number") setLikeCount(item.likes);
  }, [item._liked, item.likes]);

  // carousel state
  const images = item.images?.length ? item.images : [item.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const [carouselW, setCarouselW] = useState(0);

  const onCarouselScroll = (e) => {
    if (!carouselW) return;
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / carouselW));
  };

  const handleLikePress = async () => {
    const nextLiked = !liked;

    // Optimistic update
    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await onToggleLike?.(item.id);
      if (res && typeof res.liked === "boolean") {
        setLiked(res.liked);
      }
      if (res && typeof res.likes_count === "number") {
        setLikeCount(res.likes_count);
      }
    } catch {
      // Rollback if failed
      setLiked(!nextLiked);
      setLikeCount((c) => (!nextLiked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Top bar */}
      <View style={styles.postTop}>
        <Image
          source={item.avatar ? { uri: item.avatar } : require("../../../assets/Ellipse 18.png")}
          style={styles.feedAvatar}
          defaultSource={require("../../../assets/Ellipse 18.png")}
        />
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.feedStoreName}>{item.store}</ThemedText>
          <ThemedText style={styles.metaText}>
            {item.location} • {item.timeAgo}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => onOpenOptions(item)}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLOR.sub} />
        </TouchableOpacity>
      </View>

      {/* Media (supports multiple images) */}
      <View
        style={styles.carouselWrap}
        onLayout={(e) => setCarouselW(e.nativeEvent.layout.width)}
      >
        {carouselW > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
          >
            {images.map((uri, idx) => (
              <Image
                key={`${item.id}-img-${idx}`}
                source={{ uri }}
                style={[styles.postImage, { width: carouselW }]}
              />
            ))}
          </ScrollView>
        )}

        {/* dots */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[styles.dot, i === activeIdx && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Caption pill */}
      {item.caption ? (
        <View style={styles.captionPill}>
          <ThemedText style={styles.captionText}>{item.caption}</ThemedText>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLikePress}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={23}
              color={liked ? (mergedStore?.theme_color || COLOR.primary) : COLOR.text}
            />
            <ThemedText style={styles.actionCount}>{likeCount}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenComments(item)}
          >
            <Ionicons name="chatbubble-outline" size={23} color={COLOR.text} />
            <ThemedText style={styles.actionCount}>{item.comments}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={23} color={COLOR.text} />
            <ThemedText style={styles.actionCount}>{item.shares}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRight}>
          <TouchableOpacity
            style={styles.visitBtn}
            onPress={() => {
              if (item.storeId && navigation) {
                navigation.navigate("ServiceNavigator", {
                  screen: "StoreDetails",
                  params: { storeId: item.storeId }
                });
              }
            }}
          >
            <ThemedText style={styles.visitBtnText}>Visit Store</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={async () => {
              try {
                const uri = images?.[activeIdx] || images?.[0];
                if (!uri) return;
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo library access to save images.'); return; }
                const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
                const download = await FileSystem.downloadAsync(uri, fileUri);
                if (download.status === 200) {
                  await MediaLibrary.saveToLibraryAsync(download.uri);
                  Alert.alert('Saved', 'Image saved to your gallery.');
                }
              } catch (e) { Alert.alert('Error', 'Failed to save image.'); }
            }}
          >
            <Image
              source={require("../../../assets/DownloadSimple.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ===== Comments Sheet for Social Feed ===== */
const CommentsSheet = ({ visible, onClose, post, onSubmitComment }) => {
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { commentId, username }
  const currentUser = {
    name: "You",
    avatar: "https://via.placeholder.com/100",
  };

  // Fetch comments from API
  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useGetPostComments(post?.id, {
    enabled: visible && !!post?.id,
  });

  // Process API comments data and sort by created_at descending (latest first)
  const apiComments = useMemo(() => {
    if (!commentsData?.data?.data) return [];

    return commentsData.data.data
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort latest first
      .map((comment) => {
        // Ensure user is a string, not an object
        const userName = typeof comment.user === 'object' 
          ? (comment.user?.full_name || "Unknown")
          : (comment.user || "Unknown");
        
        // Handle profile picture with better error handling
        let userAvatar = require("../../../assets/Ellipse 18.png"); // Default fallback
        
        if (typeof comment.user === 'object' && comment.user?.profile_picture) {
          const profilePic = comment.user.profile_picture.trim();
          if (profilePic !== '') {
            try {
              const avatarPath = profilePic.startsWith("/storage") 
                ? profilePic 
                : `/storage/${profilePic}`;
              userAvatar = { uri: `https://colala.hmstech.xyz${avatarPath}` };
            } catch (error) {
              userAvatar = require("../../../assets/Ellipse 18.png");
            }
          }
        }

        const commentData = {
          id: String(comment.id),
          user: userName,
          time: timeAgo(comment.created_at),
          avatar: userAvatar,
          body: comment.body || "",
          likes: 0,
          replies: comment.replies || [],
          created_at: comment.created_at, // Keep original timestamp for sorting
        };
        
        return commentData;
      });
  }, [commentsData]);

  // Local comments state - reset when post changes
  const [localComments, setLocalComments] = useState([]);

  // Reset local comments when post changes
  React.useEffect(() => {
    setLocalComments([]);
  }, [post?.id]);

  // Combine API comments with local comments and sort by created_at
  const comments = useMemo(() => {
    const allComments = [...apiComments, ...localComments];
    return allComments.sort((a, b) => {
      const aTime = a.created_at || new Date().toISOString();
      const bTime = b.created_at || new Date().toISOString();
      return new Date(bTime) - new Date(aTime);
    });
  }, [apiComments, localComments]);

  const startReply = (c) => {
    const username = typeof c.user === 'string' ? c.user : (c.user?.full_name || "Unknown");
    setReplyTo({ commentId: c.id, username });
    setText(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearReply = () => {
    setReplyTo(null);
    setText("");
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !post?.id) return;
    try {
      const created = await onSubmitComment?.(post.id, trimmed);
      const newComment = {
        id: String(created?.id ?? `c-${Date.now()}`),
        user: created?.user?.full_name ?? currentUser.name,
        time: "Just now",
        avatar: (() => {
          if (created?.user?.profile_picture) {
            const profilePic = created.user.profile_picture.trim();
            if (profilePic !== '') {
              const avatarPath = profilePic.startsWith("/storage") 
                ? profilePic 
                : `/storage/${profilePic}`;
              return { uri: `https://colala.hmstech.xyz${avatarPath}` };
            }
          }
          return require("../../../assets/Ellipse 18.png");
        })(),
        body: created?.body ?? trimmed,
        likes: 0,
        replies: [],
        created_at: new Date().toISOString(), // Add timestamp for proper sorting
      };
      setLocalComments((prev) => [...prev, newComment]);
      setText("");
      setReplyTo(null);
    } catch { }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { width: '100%' }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText font="oleo" style={styles.sheetTitle}>
              Comments
            </ThemedText>
            <TouchableOpacity
              style={{
                borderColor: "#000",
                borderWidth: 1.4,
                borderRadius: 20,
                padding: 2,
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={16} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <View style={styles.commentsLoadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.commentsLoadingText}>Loading comments...</ThemedText>
            </View>
          ) : commentsError ? (
            <View style={styles.commentsErrorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLOR.primary} />
              <ThemedText style={styles.commentsErrorText}>
                Failed to load comments. Please try again.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(i) => i.id}
              style={{ maxHeight: 420, width: '100%' }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ paddingBottom: 4 }}>
                  {/* main comment */}
                  <View style={styles.commentRow}>
                    <Image
                      source={item.avatar}
                      style={styles.commentAvatar}
                      defaultSource={require("../../../assets/Ellipse 18.png")}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <ThemedText style={styles.commentName}>
                          {typeof item.user === 'string' ? item.user : (item.user?.full_name || "Unknown")}
                        </ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {" "}
                          {item.time}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.commentBody}>
                        {item.body}
                      </ThemedText>

                      <View style={styles.commentMetaRow}>
                        <TouchableOpacity onPress={() => startReply(item)}>
                          <ThemedText style={styles.replyText}>Reply</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* replies kept for parity (not used) */}
                  {item.replies?.length ? (
                    <View style={styles.repliesWrap}>
                      {item.replies.map((r) => (
                        <View key={r.id} style={styles.replyContainer}>
                          <Image
                            source={r.avatar}
                            style={styles.commentAvatar}
                            defaultSource={require("../../../assets/Ellipse 18.png")}
                          />
                          <View style={{ flex: 1 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <ThemedText style={styles.commentName}>
                                {typeof r.user === 'string' ? r.user : (r.user?.full_name || "Unknown")}
                              </ThemedText>
                              <ThemedText style={styles.commentTime}>
                                {" "}
                                {r.time}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.commentBody}>
                              {r.body}
                            </ThemedText>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              )}
            />
          )}

          {/* Replying chip */}
          {replyTo ? (
            <View style={styles.replyingChip}>
              <ThemedText style={styles.replyingText}>
                Replying to {replyTo.username}
              </ThemedText>
              <TouchableOpacity onPress={clearReply} style={{ padding: 6 }}>
                <Ionicons name="close-circle" size={18} color={COLOR.sub} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder={
                replyTo ? `Reply to ${replyTo.username}` : "Type a message"
              }
              placeholderTextColor={COLOR.sub}
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color={COLOR.text} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ===== Options Sheet for Social Feed ===== */
const OptionsSheet = ({ visible, onClose, onHidePost, onShare, onReport }) => {
  const Row = ({ icon, label, danger, onPress }) => (
    <TouchableOpacity
      style={[styles.optionRow, danger && styles.optionRowDanger]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        {icon}
        <ThemedText
          style={[styles.optionLabel, danger && { color: COLOR.danger }]}
        >
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: "#F9F9F9" }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText font="oleo" style={styles.sheetTitle}>
              Options
            </ThemedText>
            <TouchableOpacity
              style={{
                borderColor: "#000",
                borderWidth: 1.4,
                borderRadius: 20,
                padding: 2,
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={16} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <Row
            icon={
              <Image
                source={require("../../../assets/Vector (16).png")}
                style={styles.profileImage}
              />
            }
            label="Share this post"
            onPress={onShare}
          />
          <Row
            icon={
              <Image
                source={require("../../../assets/Vector (18).png")}
                style={styles.profileImage}
              />
            }
            label="Hide Post"
            onPress={onHidePost}
          />
          <Row
            icon={
              <Image
                source={require("../../../assets/Vector (19).png")}
                style={styles.profileImage}
              />
            }
            label="Report Post"
            danger
            onPress={onReport}
          />
        </View>
      </View>
    </Modal>
  );
};

/* ===== Leave Review Sheet (kept) ===== */
function ReviewSheet({ visible, onClose, onSubmit, mergedStore }) {
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!visible) {
      setRating(4);
      setText("");
    }
  }, [visible]);

  const Star = ({ i }) => (
    <TouchableOpacity
      onPress={() => setRating(i)}
      style={{ paddingHorizontal: 6 }}
    >
      <Ionicons
        name={i <= rating ? "star" : "star-outline"}
        size={28}
        color={mergedStore?.theme_color || COLOR.primary}
      />
    </TouchableOpacity>
  );

  const thumbs = [
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=200&auto=format&fit=crop",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Leave a review</ThemedText>
            <TouchableOpacity
              style={{
                borderColor: "#000",
                borderWidth: 1.2,
                borderRadius: 20,
                padding: 2,
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.revBox}>
            <View style={styles.ratingRowLg}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star i={i} key={i} />
              ))}
            </View>
          </View>

          <ThemedText style={styles.revLabel}>Type review</ThemedText>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your review"
            placeholderTextColor={COLOR.sub}
            multiline
            style={styles.textArea}
          />

          {/* Photos row (static thumbs to match design) */}
          <View style={styles.photosRow}>
            <TouchableOpacity style={styles.addPhoto}>
              <Ionicons name="image-outline" size={20} color={COLOR.sub} />
            </TouchableOpacity>
            {thumbs.map((t, i) => (
              <Image key={i} source={{ uri: t }} style={styles.photoThumb} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.sendReviewBtn}
            onPress={() => onSubmit?.({ rating, text })}
          >
            <ThemedText style={styles.sendReviewTxt}>Send Review</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ===== Store Addresses Modal ===== */
function StoreAddressesModal({ visible, onClose, addresses, mergedStore }) {
  const openMap = async (addr) => {
    const q = [addr?.full_address, addr?.local_government, addr?.state]
      .filter(Boolean)
      .join(", ");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q || "Store"
    )}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  const defaultHours = [
    { d: "Monday", t: "08:00 AM - 07:00PM" },
    { d: "Tuesday", t: "08:00 AM - 07:00PM" },
    { d: "Wednesday", t: "08:00 AM - 07:00PM" },
    { d: "Thursday", t: "08:00 AM - 07:00PM" },
    { d: "Friday", t: "08:00 AM - 07:00PM" },
    { d: "Saturday", t: "08:00 AM - 07:00PM" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: "85%" }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Store Addresses</ThemedText>
            <TouchableOpacity
              style={{ borderColor: "#000", borderWidth: 1.2, borderRadius: 20, padding: 2 }}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {(addresses || []).map((addr, idx) => (
              <View key={addr?.id ?? idx} style={{ marginBottom: 12 }}>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: COLOR.line,
                    overflow: "hidden",
                    ...shadow(4),
                  }}
                >
                  <View
                    style={{
                      backgroundColor: mergedStore?.theme_color || COLOR.primary,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "700" }}>{`Address ${
                      idx + 1
                    }`}</ThemedText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {addr?.is_main ? (
                        <View
                          style={{
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          }}
                        >
                          <ThemedText style={{ color: COLOR.primary, fontSize: 10 }}>
                            Main Office
                          </ThemedText>
                        </View>
                      ) : null}
                      <TouchableOpacity
                        onPress={() => openMap(addr)}
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                        }}
                      >
                        <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>View on Map</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
                    <ThemedText style={{ color: COLOR.sub, fontSize: 11 }}>State</ThemedText>
                    <ThemedText style={{ color: COLOR.text, marginTop: 2 }}>{addr?.state || "-"}</ThemedText>

                    <ThemedText style={{ color: COLOR.sub, fontSize: 11, marginTop: 10 }}>
                      Local Government
                    </ThemedText>
                    <ThemedText style={{ color: COLOR.text, marginTop: 2 }}>
                      {addr?.local_government || "-"}
                    </ThemedText>

                    <ThemedText style={{ color: COLOR.sub, fontSize: 11, marginTop: 10 }}>
                      Full Address
                    </ThemedText>
                    <ThemedText style={{ color: COLOR.text, marginTop: 2 }}>
                      {addr?.full_address || "-"}
                    </ThemedText>

                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: "#FFEDED",
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#FFE1E1",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Ionicons name="time-outline" size={16} color={COLOR.text} />
                        <ThemedText style={{ marginLeft: 6, fontWeight: "700", color: COLOR.text }}>
                          Opening Hours
                        </ThemedText>
                      </View>
                      {(addr?.opening_hours && Array.isArray(addr.opening_hours)
                        ? addr.opening_hours
                        : defaultHours
                      ).map((row, i) => (
                        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <ThemedText style={{ color: COLOR.sub, fontSize: 12 }}>{row.d || row.day}</ThemedText>
                          <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>{row.t || row.time}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ===== Filters Modal ===== */
function FiltersModal({
  visible,
  onClose,
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedBrandIds,
  setSelectedBrandIds,
  selectedLocation,
  setSelectedLocation,
}) {
  const { data: categoriesRes } = useCategories();
  const { data: brandsRes } = useAllBrands();
  const categories = categoriesRes?.data || [];
  const brands = brandsRes?.data || [];

  const [openSection, setOpenSection] = useState(null); // 'category' | 'brand' | 'location'

  const toggleId = (list, setList, id) => {
    setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const reset = () => {
    setSelectedCategoryIds([]);
    setSelectedBrandIds([]);
    setSelectedLocation(null);
  };

  const LOCATIONS = ["Lagos, Nigeria", "Abuja, Nigeria", "Kano, Nigeria", "Port Harcourt, Nigeria"];

  const renderCheckboxRow = (label, checked, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLOR.line,
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <ThemedText style={{ color: COLOR.text }}>{label}</ThemedText>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: COLOR.line,
          backgroundColor: checked ? COLOR.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? <Ionicons name="checkmark" color="#fff" size={14} /> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: "90%" }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>Filters</ThemedText>
            <TouchableOpacity
              style={{ borderColor: "#000", borderWidth: 1.2, borderRadius: 20, padding: 2 }}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Category Section */}
            <TouchableOpacity
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setOpenSection((s) => (s === "category" ? null : "category"))}
            >
              <ThemedText style={{ color: COLOR.text }}>Category</ThemedText>
              <Ionicons name={openSection === "category" ? "chevron-up" : "chevron-down"} size={18} />
            </TouchableOpacity>
            {openSection === "category" && (
              <View style={{ marginTop: 6 }}>
                {categories.map((c) =>
                  renderCheckboxRow(
                    c.title,
                    selectedCategoryIds.includes(c.id),
                    () => toggleId(selectedCategoryIds, setSelectedCategoryIds, c.id)
                  )
                )}
              </View>
            )}

            {/* Brand Section */}
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setOpenSection((s) => (s === "brand" ? null : "brand"))}
            >
              <ThemedText style={{ color: COLOR.text }}>Brand</ThemedText>
              <Ionicons name={openSection === "brand" ? "chevron-up" : "chevron-down"} size={18} />
            </TouchableOpacity>
            {openSection === "brand" && (
              <View style={{ marginTop: 6 }}>
                {brands.map((b) =>
                  renderCheckboxRow(
                    b.name,
                    selectedBrandIds.includes(b.id),
                    () => toggleId(selectedBrandIds, setSelectedBrandIds, b.id)
                  )
                )}
              </View>
            )}

            {/* Location Section */}
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setOpenSection((s) => (s === "location" ? null : "location"))}
            >
              <ThemedText style={{ color: COLOR.text }}>Location</ThemedText>
              <Ionicons name={openSection === "location" ? "chevron-up" : "chevron-down"} size={18} />
            </TouchableOpacity>
            {openSection === "location" && (
              <View style={{ marginTop: 6 }}>
                {LOCATIONS.map((loc) =>
                  renderCheckboxRow(loc, selectedLocation === loc, () => setSelectedLocation(loc))
                )}
              </View>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#EFEFEF",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={reset}
            >
              <ThemedText style={{ color: COLOR.text }}>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: COLOR.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={onClose}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "700" }}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* -------------------- styles (unchanged from your file) -------------------- */
function shadow(e = 6) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: e / 2,
      shadowOffset: { width: 0, height: e / 3 },
    },
  });
}

const styles = StyleSheet.create({
  coverWrap: { position: "relative" },
  cover: { width, height: COVER_H },
  topBar: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111111CC",
    alignItems: "center",
    justifyContent: "center",
    ...shadow(8),
  },
  avatar: {
    position: "absolute",
    left: 16,
    bottom: -AVATAR / 2,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: "#fff",
  },

  headerContent: { paddingHorizontal: 16, paddingBottom: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  followBtn: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 22,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 1,
  },
  followBtnActive: {
    backgroundColor: "#2ECC71",
  },
  followBtnDisabled: {
    opacity: 0.6,
  },
  followTxt: { color: "#fff", fontWeight: "400", fontSize: 12 },
  followTxtActive: { color: "#fff" },

  statusRow: { marginTop: 12, marginBottom: 8, marginLeft: 60 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 24,
    alignSelf: "flex-start",
    color: COLOR.success,
  },
  statusTxt: { color: "#008000", fontSize: 10, fontWeight: "700" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  metaTxt: { color: "#000", fontSize: 13 },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  tag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  tagBlue: {
    backgroundColor: "#C4C6FF",
    borderWidth: 1,
    borderColor: "#3D71FF",
  },
  tagRed: {
    backgroundColor: "#FFE7E6",
    borderColor: "#FFE7E6",
    borderWidth: 1,
  },
  tagTxt: { fontWeight: "700", fontSize: 10 },
  tagTxtBlue: { color: "#3D71FF" },
  tagTxtRed: { color: COLOR.primary },

  /* Stats card */
  statsCard: {
    marginTop: 14,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    ...shadow(10),
  },
  statsTop: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "stretch",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  statLabel: { color: COLOR.sub, fontSize: 11 },
  statValue: { color: COLOR.text, fontSize: 16, fontWeight: "800" },
  vline: { width: 1, backgroundColor: "#EEE", marginVertical: 4 },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconImg: { width: 20, height: 20, resizeMode: "contain" },

  socialCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 10,
    flexDirection: "row",
    gap: 3,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  socialImg: { width: 30, height: 30, resizeMode: "contain" },

  promoWrap: { borderRadius: 20, overflow: "hidden" },
  promoImage: { width: "100%", height: 170 },
  bannerCarouselItem: { width: width - 32, height: 170 },

  statsBottom: {
    backgroundColor: COLOR.primary,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  announceTxt: { color: "#fff", fontWeight: "700" },

  tabs: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    padding: 6,
  },
  tabItem: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabTxt: { color: COLOR.text, fontWeight: "700", fontSize: 11 },
  tabTxtActive: { color: "#fff" },

  panel: { marginHorizontal: 16, marginTop: 10 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 12,
    width: CARD_W,
    overflow: "hidden",
    ...shadow(1),
  },
  cardSingle: {
    width: '100%',
    maxWidth: '100%',
  },
  singleProductContainer: {
    paddingBottom: 20,
  },
  singleProductWrapper: {
    width: '100%',
  },
  image: { width: "100%", height: 120 },
  sponsoredBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#00000080",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sponsoredText: { color: "white", fontSize: 10, fontWeight: "600" },

  grayStrip: {
    backgroundColor: "#F2F2F2",
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  storeRow: { flexDirection: "row", alignItems: "center" },
  storeAvatar: { width: 20, height: 20, borderRadius: 12, marginRight: 6 },
  storeName: { fontSize: 12, color: "#E53E3E", fontWeight: "400" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingTxt: { marginLeft: 2, fontSize: 11, color: "#000" },

  infoContainer: { padding: 10 },
  productTitle: { fontSize: 13, fontWeight: "500", marginVertical: 4 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  price: { color: "#F44336", fontWeight: "700", fontSize: 14, marginRight: 6 },
  originalPrice: {
    color: "#999",
    fontSize: 10,
    textDecorationLine: "line-through",
  },

  tagsRow: { flexDirection: "row", marginTop: 3, gap: 3 },
  tagIcon: { width: 70, height: 20, borderRadius: 50 },

  locationRow: { flexDirection: "row", alignItems: "center" },
  location: { fontSize: 9, color: "#444", fontWeight: "500" },

  /* Social Feed styles */
  postCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  postTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  feedAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  feedStoreName: { fontSize: 14, fontWeight: "700", color: COLOR.text },
  metaText: { fontSize: 12, color: COLOR.sub, marginTop: 2 },
  postImage: {
    height: 300,
    resizeMode: "cover",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  captionPill: {
    marginTop: 10,
    backgroundColor: COLOR.pill,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  captionText: { color: COLOR.text, fontSize: 13 },

  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsLeft: { flexDirection: "row", alignItems: "center" },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 14 },
  actionCount: { marginLeft: 6, fontSize: 12, color: COLOR.text },
  actionsRight: { flexDirection: "row", alignItems: "center" },
  visitBtn: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  visitBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  /* Modals (review) */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 68,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D8DCE2",
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },

  revTabsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingBottom: 8,
    ...shadow(4),
  },
  revTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 20,
  },
  revTabBtn: { paddingBottom: 10 },
  revTabTxt: { color: COLOR.sub, fontWeight: "700" },
  revTabTxtActive: { color: COLOR.text },
  revTabUnderline: {
    height: 3,
    backgroundColor: COLOR.primary,
    borderRadius: 999,
    marginTop: 6,
  },

  ratingBlock: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLOR.line,
  },
  ratingMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingLeft: { color: COLOR.text, fontWeight: "700" },
  ratingRight: { color: COLOR.primary, fontWeight: "700" },

  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  reviewName: { color: COLOR.text, fontWeight: "700", marginBottom: 2 },
  reviewTime: { color: COLOR.sub, fontSize: 11 },
  reviewText: { color: COLOR.text, marginTop: 8 },

  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 6,
    height: 40,
  },
  replyInput: { flex: 1, color: COLOR.text, fontSize: 13 },
  replySend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F7",
  },

  nestedReply: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginLeft: 36,
  },
  nestedAvatar: { width: 26, height: 26, borderRadius: 13, marginRight: 8 },
  nestedName: { color: COLOR.sub, fontSize: 11 },
  nestedText: { color: COLOR.text, marginTop: 2 },

  noReviewsBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonStack: { marginHorizontal: 16, marginTop: 12 },
  bigBtn: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  bigBtnTxt: { color: "#fff", fontWeight: "700" },
  bigBtnRed: { backgroundColor: COLOR.primary },
  bigBtnBlack: { backgroundColor: "#000" },
  bigBtnGreen: { backgroundColor: "#008000" },

  revBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  ratingRowLg: { flexDirection: "row" },

  revLabel: { color: COLOR.sub, marginBottom: 8 },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    minHeight: 110,
    padding: 12,
    textAlignVertical: "top",
    color: COLOR.text,
  },
  photosRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 12 },
  addPhoto: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  photoThumb: { width: 48, height: 48, borderRadius: 10 },
  sendReviewBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  sendReviewTxt: { color: "#fff", fontWeight: "700" },

  storeNameHeader: {
    /* kept */
  },

  // Empty state styles
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
    lineHeight: 20,
  },

  // Header loading styles
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLOR.card,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerLoadingText: {
    marginLeft: 8,
    color: COLOR.sub,
    fontSize: 14,
    fontWeight: "500",
  },

  // Social Feed additional styles
  carouselWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  dotsRow: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#bbb",
    opacity: 0.6,
  },
  dotActive: {
    backgroundColor: COLOR.primary,
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -1,
  },

  // Comments styles
  commentsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  commentsLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  commentsErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  commentsErrorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.primary,
    textAlign: "center",
    lineHeight: 24,
  },
  commentRow: { 
    flexDirection: "row", 
    paddingVertical: 10, 
    width: '100%',
    paddingHorizontal: 0,
  },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentName: { fontWeight: "700", color: COLOR.text },
  commentTime: { color: COLOR.sub, fontSize: 12 },
  commentBody: { color: COLOR.text, marginTop: 2 },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
    paddingRight: 14,
  },
  replyText: { color: COLOR.sub },
  commentLikeCount: { color: COLOR.text, fontSize: 12 },
  repliesWrap: { marginLeft: 44, marginTop: 6 },
  replyContainer: { flexDirection: "row", marginTop: 10 },
  mentionText: { color: COLOR.primary, fontWeight: "600" },
  replyingChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyingText: { color: COLOR.sub, fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.pill,
    borderRadius: 16,
    paddingLeft: 14,
    marginTop: 12,
    marginBottom: 6,
    width: '100%',
  },
  input: { flex: 1, height: 46, fontSize: 12, color: COLOR.text },
  sendBtn: {
    width: 44,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  // Options styles
  optionRow: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    elevation: 1,
  },
  optionRowDanger: { borderColor: "#FDE2E0", backgroundColor: "#FFF8F8" },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionLabel: { fontSize: 15, color: COLOR.text },
  profileImage: { width: 20, height: 20, resizeMode: "contain" },

  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.text,
    marginBottom: 12,
  },
  popupMessage: {
    fontSize: 14,
    color: COLOR.sub,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  popupButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Report Modal styles
  reportModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 7,
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.text,
  },
  reportCloseBtn: {
    position: 'absolute',
    right: 0,
  },
  reportModalSubtitle: {
    fontSize: 14,
    color: COLOR.sub,
    marginBottom: 16,
    textAlign: 'center',
  },
  reportTextInput: {
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLOR.text,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  reportProceedBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportProceedBtnDisabled: {
    backgroundColor: COLOR.sub,
    opacity: 0.5,
  },
  reportProceedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
