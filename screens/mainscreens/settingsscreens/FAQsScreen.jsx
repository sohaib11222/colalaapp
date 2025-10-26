// screens/FAQsScreen.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

import { useGetFaqs } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";


/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

export default function FAQsScreen() {
  const navigation = useNavigation();

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Tab state
  const [selectedTab, setSelectedTab] = useState("faqs"); // "faqs" or "video"

  // API hook
  const { data: apiData, isLoading, error } = useGetFaqs();

  // Extract YouTube video ID and generate thumbnail URL
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      const videoId = match[1];
      // Return high quality thumbnail
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
  };

  // Handle video play
  const handleVideoPlay = async (videoUrl) => {
    try {
      console.log("Opening video:", videoUrl);
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
      // Invalidate and refetch FAQs query
      await queryClient.invalidateQueries({ queryKey: ['faqs'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);


  // Map API data to component format
  const mapApiFaqToComponent = (apiFaq) => {
    return {
      id: `api_${apiFaq.id}`,
      q: apiFaq.question,
      bullets: apiFaq.answer ? [apiFaq.answer] : [],
    };
  };

  // Process FAQs data
  const FAQS = React.useMemo(() => {
    // If loading or no data yet, return empty array
    if (isLoading || !apiData?.data?.faqs) {
      return [];
    }
    
    console.log("API FAQs Data:", apiData.data.faqs);
    return apiData.data.faqs.map(mapApiFaqToComponent);
  }, [apiData, isLoading, error]);

  // Get video URL and thumbnail from API
  const { videoUrl, thumbnailUrl, originalVideoUrl, hasVideo } = React.useMemo(() => {
    if (apiData?.data?.category?.video) {
      const originalUrl = apiData.data.category.video;
      console.log("API Video URL:", originalUrl);
      
      const thumbnail = getYouTubeThumbnail(originalUrl);
      console.log("Generated Thumbnail URL:", thumbnail);
      
      return {
        videoUrl: thumbnail || originalUrl,
        thumbnailUrl: thumbnail,
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
  }, [apiData]);

  const [openId, setOpenId] = useState("");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLOR.bg }}
      edges={["top"]}
    >
      {/* Header (white, no radius) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            FAQs
          </ThemedText>

          {/* spacer for symmetry */}
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading FAQs...</ThemedText>
        </View>
      )}

      {/* Tabs - always show */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "video" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("video")}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="play-circle" 
            size={18} 
            color={selectedTab === "video" ? COLOR.primary : COLOR.sub} 
          />
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "video" && styles.tabTextActive,
            ]}
          >
            Video FAQs
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "faqs" && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab("faqs")}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="document-text" 
            size={18} 
            color={selectedTab === "faqs" ? COLOR.primary : COLOR.sub} 
          />
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "faqs" && styles.tabTextActive,
            ]}
          >
            FAQs
          </ThemedText>
          {FAQS.length > 0 && (
            <View style={[
              styles.tabBadge,
              selectedTab === "faqs" && styles.tabBadgeActive,
            ]}>
              <ThemedText style={[
                styles.tabBadgeText,
                selectedTab === "faqs" && styles.tabBadgeTextActive,
              ]}>
                {FAQS.length}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR.primary} />
            <ThemedText style={styles.loadingText}>Loading FAQs...</ThemedText>
          </View>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Failed to load FAQs. Please try again later.
            </ThemedText>
          </View>
        )}

        {/* Video FAQs Tab Content */}
        {selectedTab === "video" && (
          <View style={{ marginTop: 12 }}>
            {hasVideo && videoUrl ? (
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
                  source={{
                    uri: videoUrl,
                  }}
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
            ) : (
              !isLoading && !error && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="videocam-off-outline" size={48} color={COLOR.sub} style={{ marginBottom: 12 }} />
                  <ThemedText style={styles.emptyText}>No video FAQs available</ThemedText>
                </View>
              )
            )}
          </View>
        )}

        {/* Text FAQs Tab Content */}
        {selectedTab === "faqs" && (
          <View style={{ marginTop: 12 }}>
            {FAQS.length > 0 ? (
              FAQS.map((item) => {
                const open = item.id === openId;
                
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.card,
                      open && {
                        borderColor: COLOR.primary,
                        backgroundColor: "#fff",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setOpenId(open ? "" : item.id)}
                      activeOpacity={0.85}
                      style={styles.cardHead}
                    >
                      <ThemedText style={styles.cardTitle}>{item.q}</ThemedText>
                      <Ionicons
                        name={open ? "chevron-down" : "chevron-forward"}
                        size={18}
                        color={COLOR.text}
                      />
                    </TouchableOpacity>

                    {open && item.bullets?.length > 0 && (
                      <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                        {item.bullets.map((b, i) => (
                          <View key={`${item.id}-b${i}`} style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <ThemedText style={styles.bulletText}>{b}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              !isLoading && !error && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={48} color={COLOR.sub} style={{ marginBottom: 12 }} />
                  <ThemedText style={styles.emptyText}>No FAQs available</ThemedText>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---- styles ---- */
function shadow(e = 8) {
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
  /* Header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    marginBottom: 20,
  },
  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "600",
  },

  /* Video banner */
  videoCard: {
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#eee",
    ...shadow(4),
  },
  videoImage: { width: "100%", height: "100%" },
  playOverlay: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    top: "50%",
    marginLeft: -28,
    marginTop: -28,
  },
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

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginTop: 10,
  },
  cardHead: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { color: COLOR.text },

  /* bullets */
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLOR.text,
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: { color: COLOR.sub },

  /* Loading and Error */
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

  // Empty state
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

  // Tab styles
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLOR.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FFF0F0",
    borderColor: COLOR.primary,
  },
  tabText: {
    color: COLOR.sub,
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLOR.primary,
    fontWeight: "600",
  },
  tabBadge: {
    backgroundColor: COLOR.sub,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeActive: {
    backgroundColor: COLOR.primary,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  tabBadgeTextActive: {
    color: "#fff",
  },
});
