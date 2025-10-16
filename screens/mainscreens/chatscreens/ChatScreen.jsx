import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Text,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import ThemedText from "../../../components/ThemedText";
import { useChats, useCartQuantity, useCameraSearch } from "../../../config/api.config";

const { width } = Dimensions.get("window");
const COLOR = {
  primary: "#EF534E",
  primaryDark: "#E2443F",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  success: "#2ECC71",
  line: "#ECEEF2",
};

// Removed dummy data - only show real API data

// format “Today / 07:22 AM”
const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return isToday
    ? `Today / ${time}`
    : `${d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} / ${time}`;
};

export default function ChatListScreen({ navigation }) {
  const [q, setQ] = useState("");

  // Fetch chats with error handling
  const { data, isLoading, error, refetch, isFetching } = useChats();
  
  // Use shared cart quantity hook
  const { data: cartQuantity = 0, isLoading: isCartLoading } = useCartQuantity();
  
  // Camera search functionality
  const { mutate: cameraSearch, isPending: isCameraSearching } = useCameraSearch();
  const [isSearching, setIsSearching] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Show image picker modal
  const handleCameraSearch = () => {
    setShowImagePickerModal(true);
  };

  // Handle camera image capture
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
        allowsEditing: false,
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

  // Handle gallery image selection
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
        allowsEditing: false,
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

  // Process selected image
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

  // Refresh functionality
  const handleRefresh = async () => {
    try {
      console.log("Refreshing chats...");
      await refetch();
      console.log("Chats refreshed successfully");
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  // Map API → UI model with proper error handling
  const apiChats = useMemo(() => {
    const list = data?.data || [];
    if (!list?.length) return [];

    // Debug logging to see what data is available
    console.log("Chat API data sample:", list[0]);

    return list.map((c, idx) => ({
      id: String(c.chat_id),
      chat_id: c.chat_id, // IMPORTANT so details can fetch by chat id
      name: c.store || "Store",
      avatar: c.avatar || `https://i.pravatar.cc/100?img=${(idx % 70) + 1}`, // Use API avatar or fallback
      lastMessage: c.last_message || "No messages yet",
      time: formatTime(c.last_message_at),
      unread: Number(c.unread_count) || 0,
      store_order_id: c.store_order_id || c.chat_id || null, // Use chat_id as fallback if store_order_id is missing
    }));
  }, [data]);

  const source = apiChats; // Only use real API data, no fallback to dummy data

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.lastMessage || "").toLowerCase().includes(term)
    );
  }, [q, source]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, index === filtered.length - 1 && styles.lastCard]}
      onPress={() => {
        console.log("Navigating to ChatDetails with data:", {
          name: item.name,
          avatar: item.avatar,
          chat_id: item.chat_id,
          store_order_id: item.store_order_id
        });
        navigation.navigate("ServiceNavigator", {
          screen: "ChatDetails",
          params: {
            store: {
              id: item.store_order_id, // not used by UI, kept for context
              name: item.name,
              profileImage: item.avatar, // Use the actual avatar from API
            },
            chat_id: item.chat_id, // used by detail screen to fetch messages
            store_order_id: item.store_order_id, // used for dispute creation
          },
        });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, paddingRight: 10 }}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.preview} numberOfLines={1}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <View style={styles.rightCol}>
        <ThemedText style={styles.time}>{item.time}</ThemedText>
        {item.unread > 0 ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.unread}</ThemedText>
          </View>
        ) : (
          <View style={{ height: 18 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[COLOR.primary, COLOR.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <ThemedText font="oleo" style={styles.headerTitle}>
              Chats
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
                <View style={styles.cartIconContainer}>
                  <Image
                    source={require("../../../assets/cart-icon.png")}
                    style={styles.iconImg}
                  />
                  {cartQuantity > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {cartQuantity > 99 ? "99+" : cartQuantity}
                      </Text>
                    </View>
                  )}
                </View>
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

          {/* Search */}
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search chat"
              placeholderTextColor="#9BA0A6"
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.camBtn}
              onPress={handleCameraSearch}
              disabled={isCameraSearching || isSearching}
            >
              {isCameraSearching || isSearching ? (
                <ActivityIndicator size="small" color="#9BA0A6" />
              ) : (
                <Image
                  source={require("../../../assets/camera-icon.png")}
                  style={styles.iconImg}
                />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Body */}
        <ScrollView
          style={styles.bodyContainer}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.loadingText}>
                Loading chats...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load chats. Please try again.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 24,
                flexGrow: 1,
              }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={false}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={handleRefresh}
                  tintColor={COLOR.primary}
                  colors={[COLOR.primary]}
                />
              }
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={48} color={COLOR.sub} />
                  <ThemedText style={styles.emptyText}>
                    No chats available
                  </ThemedText>
                  <ThemedText style={styles.emptySubText}>
                    Start a conversation with a store
                  </ThemedText>
                </View>
              }
            />
          )}
        </ScrollView>
      </View>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    flexGrow: 1,
  },
  bodyContainer: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "400" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 60,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLOR.text },
  camBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.card,
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 15,
    elevation: 0.3,
  },
  lastCard: {
    marginBottom: 50,
  },
  avatar: { width: 53, height: 53, borderRadius: 35, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "700", color: COLOR.text },
  preview: { fontSize: 11, color: COLOR.sub, marginTop: 10 },
  rightCol: { alignItems: "flex-end", gap: 6 },
  time: { fontSize: 9, color: "#9BA0A6" },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "#EF534E",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },
  iconImg: { width: 22, height: 22, resizeMode: "contain" },

  cartIconContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLOR.sub,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLOR.primary,
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLOR.sub,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    color: COLOR.sub,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
