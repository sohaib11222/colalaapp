// screens/FAQsScreen.jsx
import React, { useState, useCallback, useMemo, useRef } from "react";
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
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import ThemedText from "../../../components/ThemedText";

import { useGetFaqs, useKnowledgeBase, fileUrl } from "../../../config/api.config";
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
  const [selectedTab, setSelectedTab] = useState("video"); // "faqs" or "video"

  // API hooks
  const { data: apiData, isLoading, error } = useGetFaqs();
  const { data: knowledgeBaseData, isLoading: knowledgeBaseLoading, error: knowledgeBaseError } = useKnowledgeBase();

  // Video FAQs state
  const [openVideoFaqId, setOpenVideoFaqId] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const videoFaqsVideosRef = useRef({});

  // Extract knowledge base items (used for Video FAQs)
  const videoFaqsItems = useMemo(() => {
    const items = knowledgeBaseData?.data?.knowledge_base || [];
    console.log("📚 Video FAQs Items loaded:", items.length, items);
    return items;
  }, [knowledgeBaseData]);

  // Helper function to extract YouTube video ID and generate embed URL
  const getYouTubeVideoInfo = (url) => {
    if (!url) return null;
    
    // Normalize URL - if it's a relative path, convert to full URL
    let normalizedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      // It's a relative path, construct full URL
      normalizedUrl = fileUrl(url);
      console.log("🔗 Converted relative URL:", url, "→", normalizedUrl);
    }
    
    // Match various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = normalizedUrl.match(regex);
    
    if (match && match[1]) {
      const videoId = match[1];
      console.log("📺 Detected YouTube video:", videoId);
      return {
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        isYouTube: true,
        originalUrl: normalizedUrl,
      };
    }
    
    // Check if it's a direct video URL (mp4, mov, avi, webm, mkv)
    if (normalizedUrl && normalizedUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
      console.log("🎬 Detected custom video URL:", normalizedUrl);
      return {
        videoId: null,
        thumbnailUrl: null,
        embedUrl: normalizedUrl,
        isYouTube: false,
        originalUrl: normalizedUrl,
      };
    }
    
    console.log("❌ Could not determine video type for URL:", normalizedUrl);
    return null;
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch FAQs and Knowledge Base queries
      await queryClient.invalidateQueries({ queryKey: ['faqs'] });
      await queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
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
          {videoFaqsItems.length > 0 && (
            <View style={[
              styles.tabBadge,
              selectedTab === "video" && styles.tabBadgeActive,
            ]}>
              <ThemedText style={[
                styles.tabBadgeText,
                selectedTab === "video" && styles.tabBadgeTextActive,
              ]}>
                {videoFaqsItems.length}
              </ThemedText>
            </View>
          )}
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
        {(isLoading || (selectedTab === "video" && knowledgeBaseLoading)) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR.primary} />
            <ThemedText style={styles.loadingText}>
              {selectedTab === "video" ? "Loading Video FAQs..." : "Loading FAQs..."}
            </ThemedText>
          </View>
        )}

        {/* Error message */}
        {((error && !isLoading) || (selectedTab === "video" && knowledgeBaseError && !knowledgeBaseLoading)) && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Failed to load {selectedTab === "video" ? "Video FAQs" : "FAQs"}. Please try again later.
            </ThemedText>
          </View>
        )}

        {/* Video FAQs Tab Content (using Knowledge Base data) */}
        {selectedTab === "video" && (
          <View style={{ marginTop: 12 }}>
            {knowledgeBaseLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR.primary} />
                <ThemedText style={styles.loadingText}>Loading Video FAQs...</ThemedText>
              </View>
            ) : videoFaqsItems.length > 0 ? (
              videoFaqsItems.map((item) => {
                const open = openVideoFaqId === item.id.toString();
                const videoInfo = getYouTubeVideoInfo(item.media_url);
                const isPlaying = playingVideoId === item.id.toString();

                return (
                  <View
                    key={`video-faq-${item.id}`}
                    style={[styles.knowledgeBaseItem, open && styles.knowledgeBaseItemOpen]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        console.log("Toggling Video FAQ:", item.id, item.title);
                        setOpenVideoFaqId(open ? "" : item.id.toString());
                      }}
                      style={styles.knowledgeBaseHeader}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <ThemedText style={styles.knowledgeBaseTitle} numberOfLines={open ? 0 : 2}>
                          {item.title || "Untitled"}
                        </ThemedText>
                      </View>
                      <Ionicons
                        name={open ? "remove" : "add"}
                        size={20}
                        color={COLOR.text}
                      />
                    </TouchableOpacity>

                    {open && (
                      <View style={styles.knowledgeBaseBody}>
                        {/* Description Section */}
                        {item.description && (
                          <View style={styles.knowledgeBaseDescription}>
                            <ThemedText style={styles.knowledgeBaseDescriptionText}>
                              {item.description}
                            </ThemedText>
                          </View>
                        )}

                        {/* Video Section */}
                        {item.media_url ? (
                          videoInfo ? (
                            <View style={styles.knowledgeBaseVideoContainer}>
                              {videoInfo.isYouTube ? (
                                // YouTube video - use WebView with HTML iframe for in-app playback
                                <View style={styles.knowledgeBaseVideoCard}>
                                  <WebView
                                    source={{
                                      html: `
                                        <!DOCTYPE html>
                                        <html>
                                          <head>
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <style>
                                              body {
                                                margin: 0;
                                                padding: 0;
                                                background: #000;
                                              }
                                              .video-container {
                                                position: relative;
                                                width: 100%;
                                                height: 100%;
                                                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                                              }
                                              iframe {
                                                position: absolute;
                                                top: 0;
                                                left: 0;
                                                width: 100%;
                                                height: 100%;
                                              }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="video-container">
                                              <iframe
                                                src="${videoInfo.embedUrl}"
                                                frameborder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowfullscreen
                                              ></iframe>
                                            </div>
                                          </body>
                                        </html>
                                      `
                                    }}
                                    style={styles.knowledgeBaseVideoPlayer}
                                    allowsFullscreenVideo={true}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                  />
                                </View>
                              ) : (
                                // Custom video URL - use Video component
                                <View style={styles.knowledgeBaseVideoCard}>
                                  <Video
                                    ref={(ref) => {
                                      if (ref) {
                                        videoFaqsVideosRef.current[item.id.toString()] = ref;
                                      }
                                    }}
                                    source={{ uri: videoInfo.embedUrl }}
                                    style={styles.knowledgeBaseVideoPlayer}
                                    resizeMode={ResizeMode.CONTAIN}
                                    shouldPlay={false}
                                    isLooping={false}
                                    useNativeControls={true}
                                    onPlaybackStatusUpdate={(status) => {
                                      if (status.isLoaded && status.didJustFinish) {
                                        setPlayingVideoId(null);
                                      }
                                    }}
                                    onError={(error) => {
                                      console.log("Video FAQ video error:", error);
                                      Alert.alert(
                                        "Video Error",
                                        "Unable to load video. Please check your internet connection.",
                                        [{ text: "OK" }]
                                      );
                                    }}
                                  />
                                </View>
                              )}
                            </View>
                          ) : (
                            <View style={styles.knowledgeBaseDescription}>
                              <ThemedText style={[styles.knowledgeBaseDescriptionText, { color: COLOR.primary, fontStyle: 'italic' }]}>
                                Video URL format not supported or invalid
                              </ThemedText>
                            </View>
                          )
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              !knowledgeBaseLoading && !knowledgeBaseError && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="videocam-off-outline" size={48} color={COLOR.sub} style={{ marginBottom: 12 }} />
                  <ThemedText style={styles.emptyText}>No Video FAQs available</ThemedText>
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

  // Knowledge Base Styles
  knowledgeBaseItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginBottom: 10,
    overflow: "hidden",
  },
  knowledgeBaseItemOpen: {
    backgroundColor: "#fff",
  },
  knowledgeBaseHeader: {
    height: 60,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  knowledgeBaseTitle: {
    flex: 1,
    color: COLOR.text,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 12,
  },
  knowledgeBaseBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  knowledgeBaseVideoContainer: {
    marginBottom: 12,
  },
  knowledgeBaseVideoCard: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLOR.line,
    position: "relative",
  },
  knowledgeBaseVideoPlayer: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
  },
  knowledgeBaseDescription: {
    marginTop: 8,
  },
  knowledgeBaseDescriptionText: {
    color: COLOR.sub,
    fontSize: 13,
    lineHeight: 20,
  },
});

