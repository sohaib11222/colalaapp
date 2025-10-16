// screens/ReferralsScreen.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from 'expo-image-picker';
import ThemedText from "../../../components/ThemedText"; // <-- adjust path if needed
import { useQueryClient } from "@tanstack/react-query";
import {
  useReferralBalance,
  useReferralWithdraw,
  useTransfer,
  useGetAllProducts,
  useCategories,
  fileUrl,
  useGetFaqs,
  useCameraSearch
} from "../../../config/api.config";
/* -------------------- THEME -------------------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  light: "#F3F4F6",
};

export default function ReferralsScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState("wallet"); // 'wallet' | 'faqs' | 'search'
  const [copied, setCopied] = useState(false);

  // Query client for refresh functionality
  const queryClient = useQueryClient();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch referral balance data
  const { data: referralData, isLoading, error } = useReferralBalance();

  // Extract data from API response
  const userCode = referralData?.data?.user_code || "Loading...";
  const referralBalance = referralData?.data?.current_referral_balance || 0;
  const numberOfReferrals = referralData?.data?.no_of_referrals || 0;

  // Referral withdraw API integration
  const { mutate: referralWithdraw, isPending: isReferralWithdrawing } =
    useReferralWithdraw();

  // Transfer API integration
  const { mutate: transfer, isPending: isTransferring } = useTransfer();

  // Products API integration
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useGetAllProducts();
  const { data: categoriesData } = useCategories();

  // FAQs API integration
  const { data: faqsData, isLoading: faqsLoading, error: faqsError } = useGetFaqs();

  // Camera search functionality
  const { mutate: cameraSearch, isPending: isCameraSearching } = useCameraSearch();

  // Products and filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  // Camera search state variables
  const [isSearching, setIsSearching] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Camera search functions
  const handleCameraSearch = () => {
    setShowImagePickerModal(true);
  };

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
        allowsEditing: true,
        aspect: [4, 3],
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
        allowsEditing: true,
        aspect: [4, 3],
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

  // Filter modals state
  const [categoryFilterVisible, setCategoryFilterVisible] = useState(false);
  const [commissionFilterVisible, setCommissionFilterVisible] = useState(false);
  const [priceFilterVisible, setPriceFilterVisible] = useState(false);

  // Temporary filter selections (before Apply is clicked)
  const [tempCategory, setTempCategory] = useState(null);
  const [tempCommission, setTempCommission] = useState(null);
  const [tempPrice, setTempPrice] = useState(null);

  // Static filter data
  const commissionOptions = [
    { key: "5-10", label: "5 - 10 %" },
    { key: "10-20", label: "10 - 20 %" },
    { key: "20+", label: "Above 20 %" },
  ];

  const priceOptions = [
    { key: "under-1k", label: "Under ₦1,000" },
    { key: "1k-5k", label: "₦1,000 - ₦5,000" },
    { key: "5k-10k", label: "₦5,000 - ₦10,000" },
    { key: "10k-50k", label: "₦10,000 - ₦50,000" },
    { key: "50k+", label: "₦50,000+" },
  ];

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];

    let filtered = productsData.data;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (product.store?.store_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory.id
      );
    }

    // Commission filter (using discount as proxy)
    if (selectedCommission) {
      filtered = filtered.filter((product) => {
        const discount = parseFloat(product.discount || 0);
        if (selectedCommission.key === "20+") {
          return discount >= 20;
        }
        const [min, max] = selectedCommission.key.split("-").map(Number);
        return discount >= min && discount <= max;
      });
    }

    // Price filter
    if (selectedPrice) {
      switch (selectedPrice.key) {
        case "under-1k":
          filtered = filtered.filter(
            (product) => parseFloat(product.price || 0) < 1000
          );
          break;
        case "1k-5k":
          filtered = filtered.filter((product) => {
            const p = parseFloat(product.price || 0);
            return p >= 1000 && p <= 5000;
          });
          break;
        case "5k-10k":
          filtered = filtered.filter((product) => {
            const p = parseFloat(product.price || 0);
            return p >= 5000 && p <= 10000;
          });
          break;
        case "10k-50k":
          filtered = filtered.filter((product) => {
            const p = parseFloat(product.price || 0);
            return p >= 10000 && p <= 50000;
          });
          break;
        case "50k+":
          filtered = filtered.filter(
            (product) => parseFloat(product.price || 0) >= 50000
          );
          break;
      }
    }

    return filtered;
  }, [
    productsData?.data,
    searchQuery,
    selectedCategory,
    selectedCommission,
    selectedPrice,
  ]);

  // Transfer modal
  const [transferVisible, setTransferVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferSuccessVisible, setTransferSuccessVisible] = useState(false);
  const [transferredAmount, setTransferredAmount] = useState("");

  // Withdraw full-screen modal
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wAccNumber, setWAccNumber] = useState("");
  const [wBankName, setWBankName] = useState("");
  const [wAccName, setWAccName] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

  // Commission filter sheet
  const [commissionVisible, setCommissionVisible] = useState(false);
  const [commissionSel, setCommissionSel] = useState("all");

  // Validation for withdraw form
  const isWithdrawFormValid = useMemo(() => {
    return (
      wAmount.trim() !== "" &&
      wAccNumber.trim() !== "" &&
      wBankName.trim() !== "" &&
      wAccName.trim() !== ""
    );
  }, [wAmount, wAccNumber, wBankName, wAccName]);

  // Handle referral withdraw submission
  const handleReferralWithdraw = () => {
    if (!isWithdrawFormValid) return;

    const withdrawData = {
      amount: wAmount.trim(),
      bank_name: wBankName.trim(),
      account_number: wAccNumber.trim(),
      account_name: wAccName.trim(),
    };

    console.log("Submitting referral withdrawal:", withdrawData);

    referralWithdraw(withdrawData, {
      onSuccess: (data) => {
        console.log("Referral withdrawal successful:", data);
        // Reset form
        setWAmount("");
        setWAccNumber("");
        setWBankName("");
        setWAccName("");
        setSaveDetails(false);
        // Close modal
        setWithdrawVisible(false);
        // Refresh referral balance
        queryClient.invalidateQueries({ queryKey: ["referralBalance"] });
      },
      onError: (error) => {
        console.error("Referral withdrawal failed:", error);
      },
    });
  };

  // Validation for transfer form
  const isTransferFormValid = useMemo(() => {
    return amount.trim() !== "";
  }, [amount]);

  // Handle transfer submission
  const handleTransfer = () => {
    if (!isTransferFormValid) return;

    const transferData = {
      amount: amount.trim(),
    };

    console.log("Submitting transfer:", transferData);

    transfer(transferData, {
      onSuccess: (data) => {
        console.log("Transfer successful:", data);
        // Store transferred amount for success popup
        setTransferredAmount(amount.trim());
        // Reset form
        setAmount("");
        // Close modal
        setTransferVisible(false);
        // Show success popup
        setTransferSuccessVisible(true);
        // Refresh referral balance
        queryClient.invalidateQueries({ queryKey: ["referralBalance"] });
      },
      onError: (error) => {
        console.error("Transfer failed:", error);
      },
    });
  };

  const copy = async (val = userCode) => {
    try {
      await Clipboard.setStringAsync(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const steps = [
    "Invite a friend with your referral code for them to get a one time referral bonus",
    "Referral completes an order.",
    "Get commissions on their orders",
  ];

  // FAQs state
  const [openFaqId, setOpenFaqId] = useState("");

  // Process FAQs data from API
  const processedFAQs = useMemo(() => {
    if (faqsLoading || !faqsData?.data?.faqs) {
      return [];
    }
    
    return faqsData.data.faqs.map((faq) => ({
      id: `api_${faq.id}`,
      q: faq.question,
      a: faq.answer,
    }));
  }, [faqsData, faqsLoading]);

  // Get video URL and thumbnail from API
  const { videoUrl, thumbnailUrl, originalVideoUrl, hasVideo } = useMemo(() => {
    if (faqsData?.data?.category?.video) {
      const originalUrl = faqsData.data.category.video;
      
      // Extract YouTube video ID and generate thumbnail URL
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = originalUrl.match(regex);
      
      if (match && match[1]) {
        const videoId = match[1];
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        return {
          videoUrl: thumbnail,
          thumbnailUrl: thumbnail,
          originalVideoUrl: originalUrl,
          hasVideo: true
        };
      }
      
      return {
        videoUrl: originalUrl,
        thumbnailUrl: null,
        originalVideoUrl: originalUrl,
        hasVideo: true
      };
    }
    
    return {
      videoUrl: null,
      thumbnailUrl: null,
      originalVideoUrl: null,
      hasVideo: false
    };
  }, [faqsData]);

  // Handle video play
  const handleVideoPlay = async (videoUrl) => {
    try {
      const supported = await Linking.canOpenURL(videoUrl);
      
      if (supported) {
        await Linking.openURL(videoUrl);
      } else {
        Alert.alert(
          "Cannot Open Video",
          "Unable to open the video. Please try again later.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error opening video:", error);
      Alert.alert(
        "Error",
        "Failed to open video. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch all queries
      await queryClient.invalidateQueries({ queryKey: ['referralBalance'] });
      await queryClient.invalidateQueries({ queryKey: ['faqs'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  /* ----- Search data ----- */
  const PRODUCTS = [
    {
      id: "1",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/1",
    },
    {
      id: "2",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/2",
    },
    {
      id: "3",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/3",
    },
    {
      id: "4",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/4",
    },
    {
      id: "5",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/5",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={[""]}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate("Home");
            }}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Referrals
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Header loading indicator */}
      {refreshing && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>
            Refreshing referrals...
          </ThemedText>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {[
          { key: "wallet", label: "Wallet" },
          { key: "faqs", label: "FAQs" },
          { key: "search", label: "Search" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tabBtn,
                active ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <ThemedText
                style={[
                  styles.tabTxt,
                  active ? styles.tabTxtActive : styles.tabTxtInactive,
                ]}
              >
                {t.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===== Wallet tab ===== */}
      {tab === "wallet" && (
        <FlatList
          data={[{ id: "content" }]}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
              title="Pull to refresh"
              titleColor={COLOR.sub}
            />
          }
          renderItem={() => (
            <>
              {/* Gradient Wallet Card */}
              <LinearGradient
                colors={["#E90F0F", "#BD0F7B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <ThemedText style={styles.gcLabel}>
                  Referral Earnings
                </ThemedText>
                <ThemedText style={styles.gcAmount}>
                  ₦{referralBalance.toLocaleString()}
                </ThemedText>

                <View style={styles.gcBtnRow}>
                  <View>
                    <ThemedText style={styles.gcSmall}>
                      No of referrals
                    </ThemedText>
                    <ThemedText style={styles.gcCount}>
                      {numberOfReferrals}
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginLeft: "auto",
                    }}
                  >
                    <TouchableOpacity
                      style={[styles.gcBtn, styles.gcBtnLight]}
                      onPress={() => setWithdrawVisible(true)}
                    >
                      <ThemedText
                        style={[styles.gcBtnText, styles.gcBtnTextDark]}
                      >
                        Withdraw
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.gcBtn, styles.gcBtnLight]}
                      onPress={() => setTransferVisible(true)}
                    >
                      <ThemedText
                        style={[styles.gcBtnText, styles.gcBtnTextDark]}
                      >
                        Transfer
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>

              {/* Referral Code box */}
              <View style={styles.codeWrap}>
                <ThemedText style={styles.codeLabel}>Referral Code</ThemedText>
                <View style={styles.codeRow}>
                  <ThemedText style={styles.codeText}>{userCode}</ThemedText>
                  <TouchableOpacity
                    onPress={() => copy(userCode)}
                    style={styles.copyBtn}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={18}
                      color={COLOR.text}
                    />
                  </TouchableOpacity>
                </View>
                {copied ? (
                  <ThemedText style={styles.copiedTxt}>Copied!</ThemedText>
                ) : null}
              </View>

              {/* How it works */}
              <ThemedText style={styles.sectionTitle}>
                Refer and Earn on Colala
              </ThemedText>
              <ThemedText style={styles.sectionBody}>
                Refer your friends and unlock exclusive rewards. The more
                friends you bring in, the more you earn.
              </ThemedText>

              {/* Timeline steps with continuous vertical line */}
              <View style={styles.timelineWrap}>
                <View style={styles.timelineMasterLine} />
                {steps.map((t, i) => (
                  <StepRow key={i} index={i + 1} text={t} />
                ))}
              </View>
            </>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ===== FAQs tab ===== */}
      {tab === "faqs" && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
              title="Pull to refresh"
              titleColor={COLOR.sub}
            />
          }
        >
          {/* Loading indicator */}
          {faqsLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.loadingText}>Loading FAQs...</ThemedText>
            </View>
          )}

          {/* Error message */}
          {faqsError && !faqsLoading && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load FAQs. Please try again later.
              </ThemedText>
            </View>
          )}

          {/* Video banner with play icon - only show if video exists */}
          {hasVideo && videoUrl && (
            <TouchableOpacity 
              style={styles.videoCard}
              onPress={() => {
                if (originalVideoUrl) {
                  handleVideoPlay(originalVideoUrl);
                }
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: videoUrl }}
                style={styles.videoImage}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={26} color="#fff" />
              </View>
              {thumbnailUrl && (
                <View style={styles.youtubeIndicator}>
                  <Ionicons name="logo-youtube" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          )}

          <ThemedText style={styles.faqsTitle}>Referral FAQs</ThemedText>

          {/* Accordion list */}
          {processedFAQs.length > 0 ? (
            processedFAQs.map((item) => {
              const open = openFaqId === item.id;
              return (
                <View
                  key={item.id}
                  style={[styles.faqItem, open && styles.faqItemOpen]}
                >
                  <TouchableOpacity
                    onPress={() => setOpenFaqId(open ? "" : item.id)}
                    style={styles.faqHeader}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.faqQ}>{item.q}</ThemedText>
                    <Ionicons
                      name={open ? "remove" : "add"}
                      size={20}
                      color={COLOR.text}
                    />
                  </TouchableOpacity>

                  {open && (
                    <View style={styles.faqBody}>
                      <ThemedText style={styles.faqA}>{item.a}</ThemedText>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            !faqsLoading && !faqsError && (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No FAQs available</ThemedText>
              </View>
            )
          )}
        </ScrollView>
      )}

      {/* ===== Search tab ===== */}
      {tab === "search" && (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
              title="Pull to refresh"
              titleColor={COLOR.sub}
            />
          }
          ListHeaderComponent={
            <>
              {/* Search input with icon on the right */}
              <View style={styles.searchBar}>
                <TextInput
                  placeholder="Search Product"
                  placeholderTextColor={COLOR.sub}
                  style={{ flex: 1, color: COLOR.text }}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity 
                  style={styles.searchIconBtn}
                  onPress={handleCameraSearch}
                  disabled={isCameraSearching || isSearching}
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

              {/* Filters row */}
              <View style={styles.filtersRow}>
                <FilterPill
                  label={selectedCategory ? selectedCategory.title : "Category"}
                  onPress={() => {
                    setTempCategory(selectedCategory);
                    setCategoryFilterVisible(true);
                  }}
                />
                <FilterPill
                  label={
                    selectedCommission ? selectedCommission.label : "Commission"
                  }
                  onPress={() => {
                    setTempCommission(selectedCommission);
                    setCommissionFilterVisible(true);
                  }}
                />
                <FilterPill
                  label={selectedPrice ? selectedPrice.label : "Price"}
                  onPress={() => {
                    setTempPrice(selectedPrice);
                    setPriceFilterVisible(true);
                  }}
                />
              </View>
            </>
          }
          ListEmptyComponent={
            !productsLoading ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {searchQuery.trim() || selectedCategory || selectedCommission || selectedPrice
                    ? "No products found matching your filters"
                    : "No products available"}
                </ThemedText>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const mainImage =
              item.images?.find((img) => img.is_main) || item.images?.[0];
            const imageUri = mainImage ? fileUrl(mainImage.path) : null;
            const storeAvatar = item.store?.profile_image
              ? fileUrl(item.store.profile_image)
              : null;

            return (
              <TouchableOpacity 
                style={styles.productCard}
                onPress={() => {
                  navigation.navigate("CategoryNavigator", {
                    screen: "ProductDetails",
                    params: { productId: item.id.toString() },
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.thumbWrap}>
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require("../../../assets/storeimage.png")
                    }
                    style={styles.productImg}
                  />
                  <View style={styles.storeRow}>
                    <Image
                      source={
                        storeAvatar
                          ? { uri: storeAvatar }
                          : require("../../../assets/storeimage.png")
                      }
                      style={styles.storeAvatar}
                    />
                    <ThemedText style={styles.storeName}>
                      {item.store?.store_name || "Store"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.productMain}>
                  <ThemedText style={styles.productTitle} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.productPrice}>
                    ₦{parseFloat(item.price || 0).toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.productCommission}>
                    Commission : {item.discount || 0}%
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={styles.copyBtnBig}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent navigation when copy button is pressed
                    copy(`Product: ${item.name}`);
                  }}
                >
                  <ThemedText style={styles.copyBtnBigTxt}>
                    Copy link
                  </ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ===== Transfer Modal (bottom sheet) ===== */}
      <Modal
        visible={transferVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransferVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setTransferVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>Transfer</ThemedText>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setTransferVisible(false)}
              >
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount to transfer"
              placeholderTextColor={COLOR.sub}
              keyboardType="numeric"
              style={styles.amountInput}
            />

            <TouchableOpacity
              style={[
                styles.proceedBtn,
                (!isTransferFormValid || isTransferring) &&
                  styles.proceedBtnDisabled,
              ]}
              onPress={handleTransfer}
              disabled={!isTransferFormValid || isTransferring}
            >
              {isTransferring ? (
                <ThemedText style={styles.proceedTxt}>Processing...</ThemedText>
              ) : (
                <ThemedText style={styles.proceedTxt}>Proceed</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Transfer Success Popup ===== */}
      <Modal
        visible={transferSuccessVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransferSuccessVisible(false)}
      >
        <View style={styles.successPopupOverlay}>
          <View style={styles.successPopup}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </View>
            </View>

            {/* Success Message */}
            <ThemedText style={styles.successMessage}>
              You have successfully transferred{" "}
              <ThemedText style={styles.successAmount}>
                ₦{transferredAmount}
              </ThemedText>{" "}
              to your shopping wallet
            </ThemedText>

            {/* Action Buttons */}
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.successCloseBtn}
                onPress={() => setTransferSuccessVisible(false)}
              >
                <ThemedText style={styles.successCloseBtnText}>
                  Close
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.successWalletBtn}
                onPress={() => {
                  setTransferSuccessVisible(false);
                  navigation.navigate("SettingsNavigator", {
                    screen: "ShoppingWallet",
                  });
                }}
              >
                <ThemedText style={styles.successWalletBtnText}>
                  Go to wallet
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Commission Filter (bottom sheet) ===== */}
      <Modal
        visible={commissionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommissionVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setCommissionVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={[styles.sheetTitle, { fontStyle: "italic" }]}>
                Commission
              </ThemedText>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setCommissionVisible(false)}
              >
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {[
              { key: "all", label: "All" },
              { key: "5-10", label: "5 - 10 %" },
              { key: "10-20", label: "10 - 20 %" },
              { key: "20+", label: "Above 20 %" },
            ].map((opt) => {
              const selected = commissionSel === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.radioRow}
                  onPress={() => setCommissionSel(opt.key)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.radioLabel}>{opt.label}</ThemedText>
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterActive,
                    ]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.proceedBtn, { marginTop: 16 }]}
              onPress={() => setCommissionVisible(false)}
            >
              <ThemedText style={styles.proceedTxt}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Withdraw Modal (full screen) ===== */}
      <Modal
        visible={withdrawVisible}
        animationType="slide"
        onRequestClose={() => setWithdrawVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Withdraw header */}
          <View style={styles.withdrawHeader}>
            <TouchableOpacity
              onPress={() => setWithdrawVisible(false)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.withdrawTitle} pointerEvents="none">
              Withdraw
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              backgroundColor: "#F7F8FC",
              flexGrow: 1,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              placeholder="Amount to withdraw"
              value={wAmount}
              onChangeText={setWAmount}
              keyboardType="numeric"
            />
            <Input
              placeholder="Account Number"
              value={wAccNumber}
              onChangeText={setWAccNumber}
              keyboardType="number-pad"
            />
            <Input
              placeholder="Bank Name"
              value={wBankName}
              onChangeText={setWBankName}
            />
            <Input
              placeholder="Account Name"
              value={wAccName}
              onChangeText={setWAccName}
            />

            {/* Save details checkbox */}
            <TouchableOpacity
              onPress={() => setSaveDetails((p) => !p)}
              style={styles.saveRow}
              activeOpacity={0.8}
            >
              <View
                style={[styles.checkbox, saveDetails && styles.checkboxChecked]}
              >
                {saveDetails ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : null}
              </View>
              <ThemedText style={{ color: COLOR.text }}>
                Save account details
              </ThemedText>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={[
                styles.withdrawBtn,
                (!isWithdrawFormValid || isReferralWithdrawing) &&
                  styles.withdrawBtnDisabled,
              ]}
              onPress={handleReferralWithdraw}
              disabled={!isWithdrawFormValid || isReferralWithdrawing}
            >
              {isReferralWithdrawing ? (
                <ThemedText style={styles.withdrawBtnTxt}>
                  Processing...
                </ThemedText>
              ) : (
                <ThemedText style={styles.withdrawBtnTxt}>
                  Process Withdrawal
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ===== Category Filter Modal ===== */}
      <Modal
        visible={categoryFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setTempCategory(selectedCategory);
          setCategoryFilterVisible(false);
        }}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => {
              setTempCategory(selectedCategory);
              setCategoryFilterVisible(false);
            }}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <ThemedText style={styles.filterModalTitle}>Category</ThemedText>
              <TouchableOpacity
                style={styles.filterCloseBtn}
                onPress={() => {
                  setTempCategory(selectedCategory);
                  setCategoryFilterVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptionsScroll}>
              {/* All option */}
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  tempCategory === null && styles.filterOptionSelected,
                ]}
                onPress={() => setTempCategory(null)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.filterOptionLabel}>All</ThemedText>
                <View
                  style={[
                    styles.filterRadioOuter,
                    tempCategory === null && styles.filterRadioOuterSelected,
                  ]}
                >
                  {tempCategory === null && (
                    <View style={styles.filterRadioInner} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Loading state for categories */}
              {!categoriesData && (
                <View style={styles.filterLoadingContainer}>
                  <ActivityIndicator size="small" color={COLOR.primary} />
                  <ThemedText style={styles.filterLoadingText}>Loading categories...</ThemedText>
                </View>
              )}

              {/* Empty state for categories */}
              {categoriesData && (!categoriesData.data || categoriesData.data.length === 0) && (
                <View style={styles.filterEmptyContainer}>
                  <ThemedText style={styles.filterEmptyText}>No categories available</ThemedText>
                </View>
              )}

              {/* Category options */}
              {categoriesData?.data?.map((category) => {
                const selected = tempCategory?.id === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterOption,
                      selected && styles.filterOptionSelected,
                    ]}
                    onPress={() => setTempCategory(category)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.filterOptionLabel}>
                      {category.title}
                    </ThemedText>
                    <View
                      style={[
                        styles.filterRadioOuter,
                        selected && styles.filterRadioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.filterRadioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => {
                setSelectedCategory(tempCategory);
                setCategoryFilterVisible(false);
              }}
            >
              <ThemedText style={styles.filterApplyBtnText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== Commission Filter Modal ===== */}
      <Modal
        visible={commissionFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setTempCommission(selectedCommission);
          setCommissionFilterVisible(false);
        }}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => {
              setTempCommission(selectedCommission);
              setCommissionFilterVisible(false);
            }}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <ThemedText style={styles.filterModalTitle}>
                Commission
              </ThemedText>
              <TouchableOpacity
                style={styles.filterCloseBtn}
                onPress={() => {
                  setTempCommission(selectedCommission);
                  setCommissionFilterVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptionsContainer}>
              {/* All option */}
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  tempCommission === null && styles.filterOptionSelected,
                ]}
                onPress={() => setTempCommission(null)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.filterOptionLabel}>All</ThemedText>
                <View
                  style={[
                    styles.filterRadioOuter,
                    tempCommission === null && styles.filterRadioOuterSelected,
                  ]}
                >
                  {tempCommission === null && (
                    <View style={styles.filterRadioInner} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Commission options */}
              {commissionOptions.map((option) => {
                const selected = tempCommission?.key === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      selected && styles.filterOptionSelected,
                    ]}
                    onPress={() => setTempCommission(option)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.filterOptionLabel}>
                      {option.label}
                    </ThemedText>
                    <View
                      style={[
                        styles.filterRadioOuter,
                        selected && styles.filterRadioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.filterRadioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => {
                setSelectedCommission(tempCommission);
                setCommissionFilterVisible(false);
              }}
            >
              <ThemedText style={styles.filterApplyBtnText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== Price Filter Modal ===== */}
      <Modal
        visible={priceFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setTempPrice(selectedPrice);
          setPriceFilterVisible(false);
        }}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => {
              setTempPrice(selectedPrice);
              setPriceFilterVisible(false);
            }}
          />
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <ThemedText style={styles.filterModalTitle}>Price</ThemedText>
              <TouchableOpacity
                style={styles.filterCloseBtn}
                onPress={() => {
                  setTempPrice(selectedPrice);
                  setPriceFilterVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptionsContainer}>
              {/* All option */}
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  tempPrice === null && styles.filterOptionSelected,
                ]}
                onPress={() => setTempPrice(null)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.filterOptionLabel}>All</ThemedText>
                <View
                  style={[
                    styles.filterRadioOuter,
                    tempPrice === null && styles.filterRadioOuterSelected,
                  ]}
                >
                  {tempPrice === null && (
                    <View style={styles.filterRadioInner} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Price options */}
              {priceOptions.map((option) => {
                const selected = tempPrice?.key === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      selected && styles.filterOptionSelected,
                    ]}
                    onPress={() => setTempPrice(option)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.filterOptionLabel}>
                      {option.label}
                    </ThemedText>
                    <View
                      style={[
                        styles.filterRadioOuter,
                        selected && styles.filterRadioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.filterRadioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.filterApplyBtn}
              onPress={() => {
                setSelectedPrice(tempPrice);
                setPriceFilterVisible(false);
              }}
            >
              <ThemedText style={styles.filterApplyBtnText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
}

/* ---------- Small components ---------- */
const StepRow = ({ index, text }) => {
  return (
    <View style={styles.stepRow}>
      <View style={styles.timelineCol}>
        <View style={styles.stepCircle}>
          <ThemedText style={styles.stepIndex}>{index}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.stepText}>{text}</ThemedText>
    </View>
  );
};

const Input = (props) => (
  <TextInput {...props} placeholderTextColor={COLOR.sub} style={styles.input} />
);

const FilterPill = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.filterPill}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <ThemedText style={styles.filterPillTxt}>{label}</ThemedText>
    <Ionicons name="chevron-down" size={14} color={COLOR.text} />
  </TouchableOpacity>
);

/* ---------- Styles ---------- */
function shadow(e = 6) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: e / 2,
      shadowOffset: { width: 0, height: e / 3 },
    },
  });
}

const styles = StyleSheet.create({
  /* Header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 35,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
    zIndex: 0,
  },

  /* Tabs */
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  tabTxt: { fontWeight: "600" },
  tabTxtActive: { color: "#fff" },
  tabTxtInactive: { color: COLOR.text },

  /* Gradient card */
  gradientCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    ...shadow(6),
  },
  gcLabel: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  gcAmount: { color: "#fff", fontSize: 39, fontWeight: "700", marginTop: 4 },
  gcSmall: { color: "#fff", opacity: 0.9, fontSize: 12, marginBottom: 8 },
  gcCount: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },
  gcBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  gcBtn: {
    minWidth: 100,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  gcBtnLight: { backgroundColor: "#fff" },
  gcBtnText: { fontWeight: "400", fontSize: 12 },
  gcBtnTextDark: { color: "#000" },

  /* Code box */
  codeWrap: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeLabel: { color: COLOR.sub, fontSize: 12, marginBottom: 6 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    color: COLOR.text,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },
  copiedTxt: {
    marginTop: 6,
    color: COLOR.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  /* Section */
  sectionTitle: { marginTop: 18, color: COLOR.primary, fontWeight: "700" },
  sectionBody: { marginTop: 8, color: COLOR.text },

  /* Timeline (continuous line) */
  timelineWrap: { marginTop: 13, position: "relative" },
  timelineMasterLine: {
    position: "absolute",
    left: 17,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: "#E2E3E7",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 25 },
  timelineCol: { width: 36, alignItems: "center", position: "relative" },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndex: { color: COLOR.primary, fontWeight: "800" },
  stepText: { flex: 1, color: COLOR.text, lineHeight: 20 },

  /* FAQs */
  videoCard: {
    height: 210,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: "#eee",
  },
  videoImage: { width: "100%", height: "100%" },
  playOverlay: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    top: "50%",
    marginLeft: -26,
    marginTop: -26,
  },
  faqsTitle: { marginTop: 14, marginBottom: 8, fontSize: 14, color: "#000" },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginBottom: 10,
    overflow: "hidden",
  },
  faqItemOpen: { backgroundColor: "#fff" },
  faqHeader: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQ: { color: COLOR.text, fontSize: 14 },
  faqBody: { paddingHorizontal: 14, paddingBottom: 12 },
  faqA: { color: COLOR.sub },

  /* Search tab UI */
  searchBar: {
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#CDCDCD",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  filtersRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  filterPill: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    flexDirection: "row",
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  filterPillTxt: { color: COLOR.text, fontSize: 12 },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 20,
    paddingRight: 12,
    overflow: "hidden",
  },
  thumbWrap: {
    // paddingLeft: 12,
    // paddingVertical: 10,
    paddingRight: 8,
  },
  productImg: { width: 106, height: 84, borderRadius: 12 },
  productMain: { flex: 1, paddingVertical: 10 },
  productTitle: { color: COLOR.text, fontWeight: "500" },
  productPrice: { color: COLOR.primary, fontWeight: "700", marginTop: 4 },
  productCommission: { color: COLOR.sub, marginTop: 18, fontSize: 12 },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    marginLeft: 10,
    marginBottom: 4,
  },
  storeAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
  storeName: { color: COLOR.sub, fontSize: 12 },

  copyBtnBig: {
    backgroundColor: COLOR.primary,
    borderRadius: 7,
    paddingHorizontal: 14,
    height: 34,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 50,
  },
  copyBtnBigTxt: { color: "#fff", fontSize: 11 },

  /* Placeholder tabs */
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderTxt: { color: COLOR.sub },

  /* ===== Bottom sheets / modals ===== */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
    paddingVertical: 6,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
  closeBtn: {
    borderColor: "#000",
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 2,
    alignItems: "center",
  },
  amountInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: COLOR.text,
    marginTop: 8,
  },
  proceedBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  proceedTxt: { color: "#fff", fontWeight: "700" },

  /* ===== Withdraw full screen ===== */
  withdrawHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 25,
  },
  withdrawTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
  },
  input: {
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: COLOR.text,
    marginBottom: 12,
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 24,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: COLOR.primary,
    borderColor: COLOR.primary,
  },
  withdrawBtn: {
    height: 52,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  withdrawBtnDisabled: {
    backgroundColor: COLOR.sub,
    opacity: 0.5,
  },
  withdrawBtnTxt: { color: "#fff", fontWeight: "400" },

  /* Radio rows (commission) */
  radioRow: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  radioLabel: { color: COLOR.text },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: COLOR.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLOR.primary,
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
  iconImg: { width: 22, height: 22, resizeMode: "contain" },

  /* Success Popup Styles */
  successPopupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successPopup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  successMessage: {
    fontSize: 14,
    color: COLOR.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successAmount: {
    fontWeight: "bold",
    color: COLOR.text,
  },
  successButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  successCloseBtn: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  successCloseBtnText: {
    color: COLOR.text,
    fontSize: 12,
    fontWeight: "500",
  },
  successWalletBtn: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  successWalletBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },

  /* New Filter Modal Styles */
  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  filterModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: "100%",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLOR.text,
    fontFamily: "OleoScript-Bold",
  },
  filterCloseBtn: {
    position: "absolute",
    right: 0,
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 20,
  },
  filterOptionsScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  filterOptionsContainer: {
    marginBottom: 16,
  },
  filterOption: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: "#FEF2F2",
  },
  filterOptionLabel: {
    fontSize: 14,
    color: COLOR.text,
    fontWeight: "400",
  },
  filterRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterRadioOuterSelected: {
    borderColor: COLOR.primary,
  },
  filterRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLOR.primary,
  },
  filterApplyBtn: {
    height: 48,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterApplyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Loading, Error, and Empty states
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: COLOR.sub,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#856404",
    textAlign: "center",
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLOR.sub,
    fontSize: 16,
    textAlign: "center",
  },

  // YouTube indicator
  youtubeIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Filter loading and empty states
  filterLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  filterLoadingText: {
    marginLeft: 8,
    color: COLOR.sub,
    fontSize: 14,
  },
  filterEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  filterEmptyText: {
    color: COLOR.sub,
    fontSize: 14,
    textAlign: "center",
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
