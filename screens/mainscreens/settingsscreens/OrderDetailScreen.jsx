import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useOrderDetails, fileUrl, useStartChat, useAddProductReview, useAddStoreReview, usePaymentInfo, useProcessPayment, useWalletBalance, useCreateDispute } from "../../../config/api.config"; // ⬅️ NEW
import * as ImagePicker from 'expo-image-picker';

/* ---------- THEME ---------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  chip: "#F1F2F5",
};
const currency = (n) => `₦${Number(n || 0).toLocaleString()}`;
const productImg = require("../../../assets/Frame 314.png");

// Dispute categories
const DISPUTE_CATEGORIES = [
  "Order Dispute",
  "Wrong Item",
  "Damaged Item",
  "Late Delivery",
  "Refund Request",
  "Other",
];

/* ---------- FALLBACK (kept for dev safety only) ---------- */
const ORDERS_DETAIL = [
  {
    id: "Ord-1wcjcnefmvk",
    stores: [
      {
        id: "sasha",
        name: "Sasha Stores",
        status: 1,
        items: [
          { id: "i1", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
          { id: "i2", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
        ],
      },
      {
        id: "vee",
        name: "Vee Stores",
        status: 2,
        items: [
          { id: "i3", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
          { id: "i4", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
        ],
      },
    ],
  },
];

/* ---------- helpers ---------- */
function shadow(e = 10) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: e / 2,
      shadowOffset: { width: 0, height: e / 3 },
    },
  });
}

const InfoRow = ({ left, right, strongRight, topBorder }) => (
  <View
    style={[
      styles.infoRow,
      topBorder && { borderTopWidth: 1, borderTopColor: COLOR.line, marginTop: 3, paddingTop: 8 },
    ]}
  >
    <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>{left}</ThemedText>
    <ThemedText
      style={[
        { color: COLOR.text, fontSize: 12 },
        strongRight && { color: COLOR.primary, fontWeight: "800" },
      ]}
    >
      {right}
    </ThemedText>
  </View>
);

/* ---------- Track Order full-screen modal (unchanged UI) ---------- */
function TrackOrderModal({ visible, onClose, storeName = "Sasha Store", status = 0, trackingData = null, orderData = null, onShowFullDetails = null, apiOrder = null }) {
  const navigation = useNavigation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  
  // Debug modal data
  console.log("TrackOrderModal - orderData:", orderData);
  console.log("TrackOrderModal - trackingData:", trackingData);
  console.log("TrackOrderModal - first item:", orderData?.items?.[0]);
  console.log("TrackOrderModal - first item image:", orderData?.items?.[0]?.image);
  
  // Use API tracking data or fallback
  const code = trackingData?.delivery_code || "1415"; // Use API delivery code or fallback
  const trackingStatus = trackingData?.status || "pending";
  const trackingNotes = trackingData?.notes || "Order has been placed and is pending processing.";
  
  // Find the store order from apiOrder to get the store_order_id
  const storeOrder = apiOrder?.store_orders?.find(so => 
    so.store?.store_name === storeName || 
    (orderData?.store?.id && so.store_id === orderData.store.id)
  );
  const storeOrderId = storeOrder?.id || orderData?.store_order_id;
  
  // Map API status to step index for the modal
  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'out_for_delivery': return 1;
      case 'delivered': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };
  
  const currentStepIndex = getStepIndex(trackingStatus);

  const Step = ({ index, title, showWarning, showActions }) => {
    const filled = index <= currentStepIndex;
    const isDelivered = index === 2 && currentStepIndex >= 2;
    
    return (
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <View style={{ width: 46, alignItems: "center" }}>
          <View
            style={[
              styles.dot,
              filled
                ? { backgroundColor: COLOR.primary, borderColor: COLOR.primary }
                : { backgroundColor: "#fff", borderColor: COLOR.primary },
            ]}
          >
            <ThemedText style={{ color: filled ? "#fff" : COLOR.primary, fontWeight: "700" }}>
              {index + 1}
            </ThemedText>
          </View>
          {index < 2 && <View style={[styles.vLine, { backgroundColor: COLOR.primary }]} />}
        </View>

        <View style={styles.stepCard}>
          <View style={{ flexDirection: "row" }}>
              <Image 
                source={orderData?.items?.[0]?.image ? { uri: orderData.items[0].image } : productImg} 
                style={styles.stepImg} 
                onError={(error) => {
                  console.log("Modal image load error:", error.nativeEvent.error);
                  console.log("Modal image source:", orderData?.items?.[0]?.image);
                }}
                onLoad={() => {
                  console.log("Modal image loaded successfully");
                }}
              />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <ThemedText style={styles.stepTitle}>{title}</ThemedText>
              <ThemedText style={styles.stepSub}>
                {orderData?.items?.map(item => item.title).join(" + ") || "Product details..."}
              </ThemedText>
              <ThemedText style={styles.stepPrice}>
                {currency(orderData?.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0)}
              </ThemedText>
              <ThemedText style={styles.stepTime}>
                {trackingData?.created_at ? new Date(trackingData.created_at).toLocaleDateString() + " - " + new Date(trackingData.created_at).toLocaleTimeString() : "Order placed"}
              </ThemedText>
            </View>
          </View>

          {isDelivered && (
            <View style={[styles.warnRow, { backgroundColor: "#E8F5E8", borderColor: "#4CAF50" }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
              <ThemedText style={{ color: "#4CAF50", marginLeft: 8, fontSize: 10 }}>
                Your order has been successfully delivered!
              </ThemedText>
            </View>
          )}

          {showWarning && !isDelivered && (
            <View style={styles.warnRow}>
              <Ionicons name="warning-outline" size={18} color={COLOR.primary} />
              <ThemedText style={{ color: COLOR.primary, marginLeft: 8, fontSize: 10 }}>
                Do not provide your code until you have received the product
              </ThemedText>
            </View>
          )}

          {showActions && !isDelivered && (
            <>
              <TouchableOpacity style={styles.revealBtn} onPress={() => setConfirmOpen(true)}>
                <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                  Reveal Code
                </ThemedText>
              </TouchableOpacity>

              <View style={{ marginTop: 10 }}>
                <TouchableOpacity 
                  style={styles.ghostBtn}
                  onPress={() => {
                    // Navigate to ChatDetailsScreen for dispute
                    const storeId = orderData?.store?.id || orderData?.id;
                    const chatId = orderData?.chat?.id;
                    // Use storeOrderId from the modal scope (found from apiOrder)
                    const finalStoreOrderId = storeOrderId || orderData?.store_order_id;
                    
                    if (chatId) {
                      // If chat exists, navigate to it
                      navigation.navigate("ServiceNavigator", {
                        screen: "ChatDetails",
                        params: {
                          store: {
                            id: storeId,
                            name: orderData?.name || storeName,
                            profileImage: orderData?.profileImage,
                          },
                          chat_id: chatId,
                          store_order_id: finalStoreOrderId, // Use actual store_order_id
                        },
                      });
                      onClose();
                    } else {
                      // If no chat exists, create one first
                      // This will be handled by the chat creation logic in StoreBlock
                      // For now, navigate and let ChatDetailsScreen handle it
                      navigation.navigate("ServiceNavigator", {
                        screen: "ChatDetails",
                        params: {
                          store: {
                            id: storeId,
                            name: orderData?.name || storeName,
                            profileImage: orderData?.profileImage,
                          },
                          store_order_id: finalStoreOrderId, // Use actual store_order_id
                        },
                      });
                      onClose();
                    }
                  }}
                >
                  <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Dispute</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        {/* header */}
        <View style={styles.header}>
          <View className="row" style={styles.headerRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} pointerEvents="none">
              {`Order Tracker - ${storeName}`}
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        {/* top buttons */}
        <View style={{ paddingHorizontal: 16, flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity
            style={[
              styles.pillBtn,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line },
            ]}
            onPress={() => {
              if (onShowFullDetails) {
                onShowFullDetails();
              }
              onClose();
            }}
          >
            <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Full Details</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillBtn, { backgroundColor: COLOR.primary }]}>
            <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
              Open Chat
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <Step index={0} title="Order Placed" />
          <Step index={1} title="Out for Delivery" showWarning={currentStepIndex >= 1 && currentStepIndex < 2} showActions={currentStepIndex >= 1 && currentStepIndex < 2} />
          {currentStepIndex >= 2 && <Step index={2} title="Delivered" showWarning={false} showActions={false} />}
        </ScrollView>

        {/* Disclaimer modal before revealing code */}
        <Modal
          visible={confirmOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmOpen(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={[styles.alertCard, { maxHeight: '80%' }]}>
              <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 400 }}>
              <Ionicons
                name="warning-outline"
                size={46}
                color={COLOR.primary}
                  style={{ alignSelf: "center", marginBottom: 16 }}
              />
              <ThemedText
                  style={{ color: COLOR.text, textAlign: "center", marginBottom: 16, fontSize: 16, fontWeight: "700" }}
              >
                  Important Notice
              </ThemedText>

                <ThemedText
                  style={{ color: COLOR.text, marginBottom: 12, fontSize: 13, lineHeight: 20 }}
                >
                  Please ensure you have received your product and confirmed it is in good condition before revealing the delivery confirmation code. Once the code is revealed, your payment will be automatically released to the seller, and no refunds or disputes will be possible afterward.
                </ThemedText>

                <ThemedText
                  style={{ color: COLOR.text, marginBottom: 12, fontSize: 13, lineHeight: 20 }}
                >
                  You are required to reveal the delivery code immediately after inspecting your product. If you fail to do so within 48 hours, the system will automatically confirm delivery and release payment to the seller.
                </ThemedText>

                <ThemedText
                  style={{ color: COLOR.text, marginBottom: 18, fontSize: 13, lineHeight: 20 }}
                >
                  If you experience any issues with this order, please create a dispute below before the 48-hour window expires.
                </ThemedText>
              </ScrollView>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => setConfirmOpen(false)}
                >
                  <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.solidBtn, { flex: 1 }]}
                  onPress={() => {
                    setConfirmOpen(false);
                    setCodeOpen(true);
                  }}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                    Reveal Code
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Code modal */}
        <Modal
          visible={codeOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCodeOpen(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={styles.alertCard}>
              <ThemedText style={{ color: COLOR.sub, textAlign: "center", fontSize: 12 }}>
                Dear customer your code is
              </ThemedText>
              <ThemedText
                style={{
                  color: COLOR.text,
                  fontSize: 50,
                  fontWeight: "900",
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                {code}
              </ThemedText>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.ghostBtn, { flex: 1 }]}
                    onPress={() => setCodeOpen(false)}
                  >
                    <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Go Back</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.solidBtn, { flex: 1 }]}
                    onPress={async () => {
                      await Clipboard.setStringAsync(code);
                      setCodeOpen(false);
                    }}
                  >
                    <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
                      Copy Code
                    </ThemedText>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------- Review Modal Components ---------- */
function ReviewModal({ visible, onClose, type, store, onSubmit, isSubmitting = false }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  React.useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment('');
      setImages([]);
      setShowImagePickerModal(false);
    }
  }, [visible]);

  const handleCameraCapture = async () => {
    try {
      setShowImagePickerModal(false);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permission to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleGallerySelection = async () => {
    try {
      setShowImagePickerModal(false);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permission to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.log("Gallery error:", error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const handleSubmit = () => {
    if (rating === 0 || isSubmitting) return;
    onSubmit({ rating, comment, images });
    setRating(0);
    setComment('');
    setImages([]);
    onClose();
  };

  const StarButton = ({ value, onPress, filled }) => (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 8 }}>
      <Ionicons 
        name={filled ? "star" : "star-outline"} 
        size={24} 
        color={filled ? "#E53E3E" : "#ccc"} 
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={styles.reviewModal}>
          <View style={styles.reviewModalHeader}>
            <ThemedText style={styles.reviewModalTitle}>
              Leave a review
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.reviewModalClose}>
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton
                  key={star}
                  value={star}
                  filled={star <= rating}
                  onPress={() => setRating(star)}
                />
              ))}
            </View>
          </View>

          <ThemedText style={styles.reviewLabel}>Type review</ThemedText>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Type your review"
            placeholderTextColor={COLOR.sub}
            multiline
            style={styles.reviewTextArea}
          />

          {/* Image upload section */}
          <View style={styles.imageUploadRow}>
            <TouchableOpacity 
              style={styles.addImageBtn}
              onPress={() => setShowImagePickerModal(true)}
            >
              <Ionicons name="image-outline" size={20} color={COLOR.sub} />
            </TouchableOpacity>
            {images.map((img, i) => (
              <View key={i} style={{ position: 'relative', marginRight: 8 }}>
                <Image source={{ uri: img }} style={styles.imageThumb} />
                <TouchableOpacity
                  onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: COLOR.primary,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Image Picker Modal */}
          <Modal
            visible={showImagePickerModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowImagePickerModal(false)}
          >
            <View style={styles.imagePickerOverlay}>
              <View style={styles.imagePickerModalContainer}>
                <View style={styles.imagePickerModalHeader}>
                  <ThemedText style={styles.imagePickerModalTitle}>Select Image Source</ThemedText>
                  <TouchableOpacity
                    onPress={() => setShowImagePickerModal(false)}
                    style={styles.imagePickerCloseButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.imagePickerModalOptions}>
                  <TouchableOpacity
                    style={styles.imagePickerOptionButton}
                    onPress={handleCameraCapture}
                  >
                    <View style={styles.imagePickerOptionIcon}>
                      <Ionicons name="camera" size={32} color="#E53E3E" />
                    </View>
                    <ThemedText style={styles.imagePickerOptionText}>Take Photo</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.imagePickerOptionButton}
                    onPress={handleGallerySelection}
                  >
                    <View style={styles.imagePickerOptionIcon}>
                      <Ionicons name="images" size={32} color="#E53E3E" />
                    </View>
                    <ThemedText style={styles.imagePickerOptionText}>Choose from Gallery</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <TouchableOpacity 
            style={[styles.submitReviewBtn, (rating === 0 || isSubmitting) && styles.submitReviewBtnDisabled]} 
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.submitReviewBtnText}>Send Review</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------- Store block (unchanged UI) ---------- */
function StoreBlock({ store, orderId, onTrack, showSingleItem = false, orderData = null, isExpanded = false, onToggleExpanded = null, onReviewProduct = null, onReviewStore = null, addingProductReview = false, addingStoreReview = false, onPayOrder = null, onOpenDispute = null }) {
  const [expanded, setExpanded] = useState(isExpanded);
  const navigation = useNavigation();
  
  // Sync internal state with external state
  React.useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);
  
  // Chat functionality
  const { mutate: startChat, isPending: creatingChat } = useStartChat();

  const handleStartChat = async () => {
    try {
      const storeId = store.store?.id || store.id;
      const storeOrderId = store.store_order_id; // Use the actual store_order_id
      console.log("Starting chat with store ID:", storeId);
      console.log("Store order ID:", storeOrderId);
      
      // Check if we already have a chat_id from the API
      const existingChatId = store.chat?.id;
      console.log("Existing chat ID:", existingChatId);
      
      if (existingChatId) {
        // Use existing chat
        console.log("Using existing chat ID:", existingChatId);
        navigation.navigate("ServiceNavigator", {
          screen: "ChatDetails",
          params: {
            store: {
              id: storeId,
              name: store.name,
              profileImage: store.profileImage,
            },
            chat_id: existingChatId,
            store_order_id: storeOrderId, // Use actual store_order_id
          },
        });
      } else {
        // Create new chat if none exists
        console.log("Creating new chat...");
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
                  name: store.name,
                  profileImage: store.profileImage,
                },
                chat_id,
                store_order_id: storeOrderId, // Use actual store_order_id
              },
            });
          },
          onError: (error) => {
            console.error("Failed to create chat:", error);
            // Fallback: navigate without chat_id
            navigation.navigate("ServiceNavigator", {
              screen: "ChatDetails",
              params: {
                store: {
                  id: storeId,
                  name: store.name,
                  profileImage: store.profileImage,
                },
                store_order_id: storeOrderId, // Use actual store_order_id
              },
            });
          },
        }
      );
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const items = showSingleItem ? store.items.slice(0, 1) : store.items;

  // Use real API data for pricing
  const itemsCount = items.reduce((a, b) => a + b.qty, 0);
  const itemsCost = items.reduce((a, b) => a + (Number(b.price) || 0) * (Number(b.qty) || 0), 0);
  const coupon = 0;   // Set to 0 as per user request - not coming from backend
  const points = 0;   // Set to 0 as per user request - not coming from backend
  const fee = Number(orderData?.platform_fee) || 0;     // Use real platform fee from API
  const shippingFee = Number(orderData?.shipping_total) || 0;  // Use real shipping fee from API
  const totalPay = Number(orderData?.grand_total) || (itemsCost - coupon - points + shippingFee);

  return (
    <View style={styles.section}>
      {/* Red header */}
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          {store.profileImage && (
            <Image source={{ uri: store.profileImage }} style={styles.storeProfileImage} />
          )}
          <ThemedText style={styles.storeName}>{store.name}</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.chatBtn} 
          activeOpacity={0.9}
          onPress={handleStartChat}
          disabled={creatingChat}
        >
          {creatingChat ? (
            <ActivityIndicator size="small" color={COLOR.primary} />
          ) : (
            <ThemedText style={styles.chatBtnTxt}>
              {store.chat?.id ? "Open Chat" : "Start Chat"}
            </ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.roundIcon} activeOpacity={0.8}>
          <Ionicons name="chevron-down" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIcon} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* White card over header */}
      <View style={styles.itemsCard}>
        {items.map((it, idx) => (
          <View
            key={it.id}
            style={[styles.itemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: COLOR.line }]}
          >
            <Image 
              source={it.image ? { uri: it.image } : productImg} 
              style={styles.itemImg}
              onError={(error) => {
                console.log("Image load error:", error.nativeEvent.error);
                console.log("Image source:", it.image);
                console.log("Image source type:", typeof it.image);
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", it.image);
              }}
            />
            <View style={{ flex: 1, paddingRight: 8 }}>
              <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {it.title}
              </ThemedText>
              <ThemedText style={styles.price}>{currency(it.price)}</ThemedText>
              <ThemedText style={styles.qtyTxt}>{`Qty : ${it.qty}`}</ThemedText>
            </View>

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => onTrack(store.name, Math.min(store.status ?? 0, 2))}
            >
              <ThemedText style={styles.trackTxt}>Track Order</ThemedText>
            </TouchableOpacity>
          </View>
        ))}

        {/* Open Chat row */}
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={styles.openChatRow}
          onPress={handleStartChat}
          disabled={creatingChat}
        >
          {creatingChat ? (
            <ActivityIndicator size="small" color={COLOR.primary} />
          ) : (
            <ThemedText style={{ color: COLOR.text, opacity: 0.9, fontSize: 13 }}>
              {store.chat?.id ? "Open Chat" : "Start Chat"}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Expanded details (address from API) */}
        {expanded && (
          <>
            <ThemedText style={styles.sectionTitle}>Delivery Address</ThemedText>
            <View style={styles.addressCard}>
              <View style={styles.addrRow}>
                <ThemedText style={styles.addrLabel}>Name</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>{orderData?.delivery_address?.label || "Home"}</ThemedText>
                  <TouchableOpacity 
                    onPress={async () => {
                      const nameText = orderData?.delivery_address?.label || "Home";
                      await Clipboard.setStringAsync(nameText);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                  <Ionicons name="copy-outline" size={14} color={COLOR.sub} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.addrRow, { marginTop: 8 }]}>
                <ThemedText style={styles.addrLabel}>Phone number</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>{orderData?.delivery_address?.phone || "—"}</ThemedText>
                  <TouchableOpacity 
                    onPress={async () => {
                      const phoneText = orderData?.delivery_address?.phone || "—";
                      await Clipboard.setStringAsync(phoneText);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                  <Ionicons name="copy-outline" size={14} color={COLOR.sub} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.addrRow, { marginTop: 8, alignItems: "flex-start" }]}>
                <ThemedText style={styles.addrLabel}>Address</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>
                    {orderData?.delivery_address ? 
                      `${orderData.delivery_address.line1 || ""}${orderData.delivery_address.line2 ? `, ${orderData.delivery_address.line2}` : ""}, ${orderData.delivery_address.city}, ${orderData.delivery_address.state}, ${orderData.delivery_address.country}`.replace(/^,\s*/, '') : 
                      "No address available"
                    }
                  </ThemedText>
                  <TouchableOpacity 
                    onPress={async () => {
                      const addressText = orderData?.delivery_address ? 
                        `${orderData.delivery_address.line1 || ""}${orderData.delivery_address.line2 ? `, ${orderData.delivery_address.line2}` : ""}, ${orderData.delivery_address.city}, ${orderData.delivery_address.state}, ${orderData.delivery_address.country}`.replace(/^,\s*/, '') : 
                        "No address available";
                      await Clipboard.setStringAsync(addressText);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                  <Ionicons name="copy-outline" size={14} color={COLOR.sub} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.summaryWrap}>
              <InfoRow left="Ord id" right={orderId || "—"} />
              <InfoRow left="No it items" right={String(itemsCount)} topBorder />
              <InfoRow left="Items Cost" right={currency(itemsCost)} topBorder />
              <InfoRow left="Coupon Discount" right={`-${currency(coupon)}`} topBorder />
              <InfoRow left="Points Discount" right={`-${currency(points)}`} topBorder />
              <InfoRow left="Shipping fee" right={currency(shippingFee)} topBorder />
              {/* <InfoRow left="Platform fee" right={currency(fee)} topBorder /> */}
              <InfoRow left="Total to pay" right={currency(totalPay)} strongRight topBorder />
            </View>
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            const newExpanded = !expanded;
            setExpanded(newExpanded);
            if (onToggleExpanded) {
              onToggleExpanded(store.id, newExpanded);
            }
          }}
          style={styles.expandBtn}
        >
          <ThemedText style={{ color: "#E53E3E", fontSize: 11 }}>
            {expanded ? "Collapse" : "Expand"}
          </ThemedText>
        </TouchableOpacity>

        {/* Action buttons row - Pay Order and Dispute */}
        <View style={styles.reviewButtonsRow}>
          {/* Pay Order button - only show for accepted orders (status = 1) */}
          {store.status === 1 && onPayOrder && (
            <TouchableOpacity 
              style={[styles.reviewBtn, { backgroundColor: COLOR.primary, borderColor: COLOR.primary, flex: 1 }]}
              onPress={onPayOrder}
            >
              <ThemedText style={[styles.reviewBtnText, { color: '#fff', fontWeight: '700' }]}>
                Pay Order
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Dispute button - show for all orders that are not delivered yet (status 0-3) */}
          {store.status < 4 && onOpenDispute && (
            <TouchableOpacity 
              style={[
                styles.disputeBtn,
                store.status === 1 && onPayOrder && { flex: 1, marginLeft: 12 }
              ]}
              onPress={() => onOpenDispute(store)}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <ThemedText style={styles.disputeBtnText}>
                Dispute Order
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Review buttons - only show for delivered orders */}
        {store.status >= 4 && (
          <View style={styles.reviewButtonsRow}>
            <TouchableOpacity 
              style={styles.reviewBtn}
              onPress={() => onReviewProduct && onReviewProduct(store)}
              disabled={addingProductReview || addingStoreReview}
            >
              <ThemedText style={styles.reviewBtnText}>
                {addingProductReview ? "Submitting..." : "Review Product"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.reviewBtn}
              onPress={() => onReviewStore && onReviewStore(store)}
              disabled={addingProductReview || addingStoreReview}
            >
              <ThemedText style={styles.reviewBtnText}>
                {addingStoreReview ? "Submitting..." : "Review Store"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

/* ---------- Screen ---------- */
export default function SingleOrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Accept either `orderId` directly or an `order` object from the list screen
  const paramOrderId =
    route.params?.orderId ??
    route.params?.order?.id ??
    route.params?.order?.order_no; // accept order_no as id fallback

  // Fetch order details
  const { data, isLoading, isError, refetch, isFetching } = useOrderDetails(paramOrderId);

  // Refresh functionality
  const handleRefresh = async () => {
    try {
      console.log("Refreshing order details...");
      await refetch();
      console.log("Order details refreshed successfully");
    } catch (error) {
      console.error("Error refreshing order details:", error);
    }
  };

  // Transform API → UI expected structure without changing UI
  const apiOrder = data?.data;
  
  // Debug API data
  console.log("API Order Data:", apiOrder);
  console.log("Store Orders:", apiOrder?.store_orders);
  
  const transformed = useMemo(() => {
    if (!apiOrder) return null;

    // Map store_orders → UI stores
    const stores = (apiOrder.store_orders || []).map((so) => {
      const storeName = so?.store?.store_name || "Store";
      const items =
        (so?.items || []).map((it) => {
          // Debug logging for image handling
          console.log("Product item:", it.name);
          console.log("Product images:", it.product?.images);
          console.log("First image path:", it.product?.images?.[0]?.path);
          
          let imageUrl = null;
          if (it.product?.images?.[0]?.path) {
            const rawPath = it.product.images[0].path;
            console.log("Raw image path:", rawPath);
            imageUrl = fileUrl(rawPath);
            console.log("Generated image URL:", imageUrl);
            console.log("URL type:", typeof imageUrl);
            
            // Test with a direct URL to see if the issue is with fileUrl
            if (rawPath === "products/86aE4pLoKsWuprZEnzrutBSKs6k4KbbGUPsg4wzG.png") {
              console.log("Testing with direct URL construction...");
              const testUrl = `https://colala.hmstech.xyz/storage/${rawPath}`;
              console.log("Test URL:", testUrl);
            }
          } else {
            console.log("No product images found, using fallback");
          }
          
          return {
            id: it.id,
            title: it.name ?? "Item", // API has "name"
            price: Number(it.unit_price) || 0, // API unit_price is string
            qty: Number(it.qty) || 0,
            image: imageUrl || productImg, // Use API image or fallback
            product: it.product, // Keep full product data for tracking
          };
        }) || [];

      // Map API status to UI status (0: pending_acceptance, 1: accepted, 2: paid, 3: out_for_delivery, 4: delivered, 5: completed)
      const getStatusIndex = (status) => {
        switch (status) {
          case 'pending_acceptance': return 0;
          case 'accepted': return 1;
          case 'paid':
          case 'preparing': return 2;
          case 'out_for_delivery': return 3;
          case 'delivered': return 4;
          case 'completed': return 5;
          default: return 0;
        }
      };

      return {
        id: String(so.store_id ?? so.id),
        name: storeName,
        status: getStatusIndex(so.status), // Use real API status
        items,
        store: so.store, // Keep store data for tracking
        profileImage: so.store?.profile_image ? fileUrl(so.store.profile_image) : null, // Store profile image
        orderTracking: so.order_tracking, // Keep tracking data for modal
        chat: so.chat, // Keep chat data for existing chat functionality
        store_order_id: so.id, // Store the actual store_order_id for dispute creation
        store_order_status: so.status, // Keep original status string for dispute eligibility
      };
    });

    // Use order_no string visibly where needed
    return {
      id: apiOrder.order_no || String(apiOrder.id),
      stores,
    };
  }, [apiOrder]);

  // Tabs - Updated to include Pending and Accepted
  const STATUS = ["Pending", "Accepted", "In Process", "Out for delivery", "Delivered", "Completed"];
  
  const [statusIdx, setStatusIdx] = useState(0);
  
  // Update tab when order data loads
  React.useEffect(() => {
    if (transformed?.stores?.length) {
      // Get the highest status among all stores
      const maxStatus = Math.max(...transformed.stores.map(s => s.status));
      setStatusIdx(maxStatus);
    }
  }, [transformed]);

  // Expand all stores by default when order data loads
  React.useEffect(() => {
    if (transformed?.stores?.length) {
      const allStoreIds = transformed.stores.map(s => s.id);
      setExpandedStores(new Set(allStoreIds));
    }
  }, [transformed]);

  // Track modal
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackStoreName, setTrackStoreName] = useState("");
  const [trackStatus, setTrackStatus] = useState(0);

  // Expanded stores state - initialized empty, will be populated when order loads
  const [expandedStores, setExpandedStores] = useState(new Set());

  // Review modals state
  const [productReviewVisible, setProductReviewVisible] = useState(false);
  const [storeReviewVisible, setStoreReviewVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('flutterwave'); // 'flutterwave' | 'wallet'
  
  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading } = useWalletBalance({
    enabled: paymentModalVisible, // Only fetch when modal is visible
  });
  
  const walletBalance = walletData?.data?.shopping_balance || 0;

  // Dispute modal state
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [selectedStoreForDispute, setSelectedStoreForDispute] = useState(null);
  const [disputeCategory, setDisputeCategory] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [disputeImageUri, setDisputeImageUri] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Create dispute mutation
  const { mutate: createDispute, isPending: isCreatingDispute } = useCreateDispute({
    onSuccess: (data) => {
      setDisputeModalVisible(false);
      resetDisputeForm();
      
      // Navigate to dispute chat screen
      // Backend returns: { dispute: {...}, dispute_chat: {...} }
      const disputeId = data?.data?.dispute?.id || data?.data?.dispute_id;
      if (disputeId) {
        navigation.navigate("SettingsNavigator", {
          screen: "DisputeChat",
          params: { disputeId },
        });
      } else {
        showToast("Dispute created successfully! A customer agent will join you shortly.", "success");
        // Refresh order details
        handleRefresh();
      }
    },
    onError: (error) => {
      console.error('Dispute creation error:', error);
      showToast(error?.message || "Failed to create dispute. Please try again.", "error");
    }
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Review API hooks
  const { mutate: addProductReview, isPending: addingProductReview } = useAddProductReview({
    onSuccess: (response) => {
      setProductReviewVisible(false);
      setSelectedStore(null);
      showToast("Product review submitted successfully!", "success");
    },
    onError: (error) => {
      console.error('Product review error:', error);
      showToast("Failed to submit product review. Please try again.", "error");
    }
  });

  const { mutate: addStoreReview, isPending: addingStoreReview } = useAddStoreReview({
    onSuccess: (response) => {
      setStoreReviewVisible(false);
      setSelectedStore(null);
      showToast("Store review submitted successfully!", "success");
    },
    onError: (error) => {
      console.error('Store review error:', error);
      showToast("Failed to submit store review. Please try again.", "error");
    }
  });

  // Review handlers
  const handleReviewProduct = (store) => {
    setSelectedStore(store);
    setProductReviewVisible(true);
  };

  const handleReviewStore = (store) => {
    setSelectedStore(store);
    setStoreReviewVisible(true);
  };

  const handleProductReviewSubmit = ({ rating, comment, images }) => {
    if (!selectedStore || !selectedStore.items || selectedStore.items.length === 0) return;
    
    // For now, review the first item. In a real app, you might want to let user select which item
    const firstItem = selectedStore.items[0];
    addProductReview({
      orderItemId: firstItem.id,
      rating,
      comment,
      images
    });
  };

  const handleStoreReviewSubmit = ({ rating, comment, images }) => {
    if (!selectedStore) return;
    
    const storeId = selectedStore.store?.id || selectedStore.id;
    addStoreReview({
      storeId,
      rating,
      comment,
      images
    });
  };

  // Payment processing hook
  const { mutate: processPayment, isPending: processingPayment } = useProcessPayment({
    onSuccess: (response) => {
      console.log('Payment processed successfully:', response);
      setPaymentModalVisible(false);
      showToast("Payment processed successfully!", "success");
      // Refresh order details
      handleRefresh();
    },
    onError: (error) => {
      console.error('Payment error:', error);
      showToast(error?.message || "Failed to process payment. Please try again.", "error");
    }
  });

  // Handle payment button click (for accepted orders)
  const handlePayOrder = async () => {
    if (!apiOrder) return;
    
    try {
      // Fetch payment info
      const response = await fetch(`https://colala.hmstech.xyz/api/buyer/orders/${apiOrder.id}/payment-info`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem("auth_token")}`,
          'Accept': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setPaymentInfo(result.data);
        setSelectedPaymentMethod('flutterwave'); // Reset to default when opening modal
        setPaymentModalVisible(true);
      } else {
        showToast(result.message || "Failed to load payment info", "error");
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      showToast("Failed to load payment info. Please try again.", "error");
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!paymentInfo || !apiOrder) return;
    
    const amountToPay = Number(paymentInfo.amount_to_pay) || 0;
    
    if (selectedPaymentMethod === 'flutterwave') {
      // Navigate to Flutterwave WebView (email will be fetched from AsyncStorage in the component)
      setPaymentModalVisible(false);
      navigation.navigate("FlutterwaveWebView", {
        order_id: String(apiOrder.id),
        amount: amountToPay,
      });
    } else if (selectedPaymentMethod === 'wallet') {
      // Check if wallet balance is sufficient
      if (walletBalance < amountToPay) {
        Alert.alert(
          "Insufficient Balance",
          `Your wallet balance (${currency(walletBalance)}) is less than the amount to pay (${currency(amountToPay)}). Please select Flutterwave or fund your account.`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Fund Account", 
              onPress: () => {
                setPaymentModalVisible(false);
                navigation.navigate("SettingsNavigator", {
                  screen: "ShoppingWallet",
                });
              }
            },
            { 
              text: "Use Flutterwave", 
              onPress: () => setSelectedPaymentMethod('flutterwave'),
              style: "default"
            }
          ]
        );
        return;
      }
      
      // Process wallet payment
      processPayment({
        orderId: apiOrder.id,
        payment_method: 'wallet',
        tx_id: null,
      });
    }
  };
  
  // Reset payment method when modal closes
  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedPaymentMethod('flutterwave'); // Reset to default
  };

  // Dispute form handlers
  const resetDisputeForm = () => {
    setDisputeCategory("");
    setDisputeDetails("");
    setDisputeImageUri(null);
    setShowCategoryModal(false);
    setSelectedStoreForDispute(null);
  };

  const pickDisputeImage = async () => {
    try {
      // Request both camera and media library permissions
      const [cameraStatus, libraryStatus] = await Promise.all([
        ImagePicker.requestCameraPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync(),
      ]);

      if (cameraStatus.status !== "granted" && libraryStatus.status !== "granted") {
        Alert.alert("Permission Required", "Please grant permission to access your camera and photo library.");
        return;
      }

      // Show action sheet to choose camera or gallery
      Alert.alert(
        "Select Image",
        "Choose an option",
        [
          {
            text: "Camera",
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                setDisputeImageUri(result.assets[0].uri);
              }
            },
          },
          {
            text: "Gallery",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                setDisputeImageUri(result.assets[0].uri);
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Open dispute modal - no need to create chat first, backend creates it automatically
  const handleOpenDispute = (store) => {
    setSelectedStoreForDispute(store);
    setDisputeModalVisible(true);
  };

  const handleSubmitDispute = () => {
    if (!selectedStoreForDispute) return;
    
    const storeOrderId = selectedStoreForDispute.store_order_id;

    if (!disputeCategory || !disputeDetails.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    if (!storeOrderId) {
      Alert.alert("Error", "Store Order ID is not available. Please contact support.");
      return;
    }

    // Create form data - backend automatically creates dispute chat
    const formData = new FormData();
    formData.append("store_order_id", storeOrderId.toString());
    formData.append("category", disputeCategory);
    formData.append("details", disputeDetails.trim());

    // Add image if selected - backend expects images as array
    // Using images[] ensures Laravel receives it as an array
    if (disputeImageUri) {
      formData.append("images[]", {
        uri: disputeImageUri,
        type: "image/jpeg",
        name: "dispute_image.jpg",
      });
    }

    // Submit dispute
    createDispute(formData);
  };

  // Only use API data, no fallback to dummy data
  const order = transformed;

  const visibleStores = useMemo(() => {
    if (!order?.stores) return [];
    // Filter stores based on their actual status
    return order.stores.filter((s) => (s.status ?? 0) === statusIdx);
  }, [order, statusIdx]);

  // Function to handle showing full details from modal
  const handleShowFullDetails = (storeName) => {
    // Find the store and expand it
    const storeToExpand = visibleStores.find(s => s.name === storeName);
    if (storeToExpand) {
      setExpandedStores(prev => new Set([...prev, storeToExpand.id]));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
              }
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>

            <ThemedText style={styles.headerTitle} pointerEvents="none">
              Order Details
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
              }
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>

            <ThemedText style={styles.headerTitle} pointerEvents="none">
              Order Details
            </ThemedText>

            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.sub} />
          <ThemedText style={styles.loadingText}>Failed to load order details</ThemedText>
          <TouchableOpacity 
            style={[styles.solidBtn, { marginTop: 16 }]}
            onPress={handleRefresh}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
              }
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>

            <ThemedText style={styles.headerTitle} pointerEvents="none">
              Order Details
            </ThemedText>

            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="document-outline" size={48} color={COLOR.sub} />
          <ThemedText style={styles.loadingText}>No order data available</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Order Details
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsWrap}
          style={styles.tabsScrollView}
        >
        {STATUS.map((label, i) => {
          const active = i === statusIdx;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}
              onPress={() => setStatusIdx(i)}
                activeOpacity={0.7}
            >
              <ThemedText style={[styles.tabTxt, active ? { color: "#fff" } : { color: COLOR.text }]}>
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={COLOR.primary}
            colors={[COLOR.primary]}
          />
        }
      >
        {visibleStores.length > 0 ? (
          visibleStores.map((s) => (
          <StoreBlock
            key={s.id}
            store={s}
            orderId={order.id}
              orderData={apiOrder}
            showSingleItem={statusIdx === 2}
              isExpanded={expandedStores.has(s.id)}
              onToggleExpanded={(storeId, isExpanded) => {
                setExpandedStores(prev => {
                  const newSet = new Set(prev);
                  if (isExpanded) {
                    newSet.add(storeId);
                  } else {
                    newSet.delete(storeId);
                  }
                  return newSet;
                });
              }}
            onTrack={(storeName, stat) => {
              setTrackStoreName(storeName);
              setTrackStatus(stat);
              setTrackOpen(true);
            }}
              onReviewProduct={handleReviewProduct}
              onReviewStore={handleReviewStore}
              addingProductReview={addingProductReview}
              addingStoreReview={addingStoreReview}
              onPayOrder={handlePayOrder}
              onOpenDispute={handleOpenDispute}
            />
          ))
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="storefront-outline" size={48} color={COLOR.sub} />
            <ThemedText style={styles.loadingText}>
              No stores found for "{STATUS[statusIdx]}" status
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Track Order modal */}
      <TrackOrderModal
        visible={trackOpen}
        onClose={() => setTrackOpen(false)}
        storeName={trackStoreName}
        status={Math.min(trackStatus, 2)}
        trackingData={transformed?.stores?.find(s => s.name === trackStoreName)?.orderTracking?.[0]}
        orderData={transformed?.stores?.find(s => s.name === trackStoreName)}
        onShowFullDetails={() => handleShowFullDetails(trackStoreName)}
        apiOrder={apiOrder}
      />

      {/* Review Modals */}
      <ReviewModal
        visible={productReviewVisible}
        onClose={() => setProductReviewVisible(false)}
        type="product"
        store={selectedStore}
        onSubmit={handleProductReviewSubmit}
        isSubmitting={addingProductReview}
      />

      <ReviewModal
        visible={storeReviewVisible}
        onClose={() => setStoreReviewVisible(false)}
        type="store"
        store={selectedStore}
        onSubmit={handleStoreReviewSubmit}
        isSubmitting={addingStoreReview}
      />

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClosePaymentModal}
      >
        <View style={styles.centerOverlay}>
          <View style={styles.alertCard}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="card-outline" size={48} color={COLOR.primary} />
              <ThemedText style={{ fontSize: 20, fontWeight: '700', color: COLOR.text, marginTop: 12 }}>
                Payment Details
              </ThemedText>
            </View>

            {paymentInfo && (
              <View style={{ marginBottom: 20 }}>
                <View style={{ marginBottom: 12 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 4 }}>
                    Order Number
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, color: COLOR.sub }}>
                    {paymentInfo.order_no}
                  </ThemedText>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 4 }}>
                    Store
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, color: COLOR.sub }}>
                    {paymentInfo.store?.store_name}
                  </ThemedText>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 4 }}>
                    Items Subtotal
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, color: COLOR.sub }}>
                    {currency(paymentInfo.store?.items_subtotal || 0)}
                  </ThemedText>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 4 }}>
                    Delivery Fee
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, color: COLOR.sub }}>
                    {currency(paymentInfo.store?.delivery_fee || 0)}
                  </ThemedText>
                </View>

                {paymentInfo.store?.estimated_delivery && (
                  <View style={{ marginBottom: 12 }}>
                    <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 4 }}>
                      Estimated Delivery
                    </ThemedText>
                    <ThemedText style={{ fontSize: 14, color: COLOR.sub }}>
                      {paymentInfo.store.estimated_delivery}
                    </ThemedText>
                  </View>
                )}

                <View style={{ marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLOR.line }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '700', color: COLOR.text, marginBottom: 4 }}>
                    Total Amount
                  </ThemedText>
                  <ThemedText style={{ fontSize: 18, fontWeight: '800', color: COLOR.primary }}>
                    {currency(paymentInfo.amount_to_pay || 0)}
                  </ThemedText>
                </View>

                {/* Payment Method Selection */}
                <View style={{ marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLOR.line }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '600', color: COLOR.text, marginBottom: 12 }}>
                    Select Payment Method
                  </ThemedText>
                  
                  {/* Flutterwave Option */}
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'flutterwave' && styles.paymentMethodOptionSelected
                    ]}
                    onPress={() => setSelectedPaymentMethod('flutterwave')}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[
                        styles.paymentRadio,
                        selectedPaymentMethod === 'flutterwave' && styles.paymentRadioSelected
                      ]}>
                        {selectedPaymentMethod === 'flutterwave' && (
                          <View style={styles.paymentRadioInner} />
                        )}
                      </View>
                      <ThemedText style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === 'flutterwave' && styles.paymentMethodTextSelected
                      ]}>
                        Flutterwave
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Wallet Option */}
                  <TouchableOpacity
                    style={[
                      styles.paymentMethodOption,
                      selectedPaymentMethod === 'wallet' && styles.paymentMethodOptionSelected,
                      { marginTop: 8 }
                    ]}
                    onPress={() => setSelectedPaymentMethod('wallet')}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={[
                        styles.paymentRadio,
                        selectedPaymentMethod === 'wallet' && styles.paymentRadioSelected
                      ]}>
                        {selectedPaymentMethod === 'wallet' && (
                          <View style={styles.paymentRadioInner} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[
                          styles.paymentMethodText,
                          selectedPaymentMethod === 'wallet' && styles.paymentMethodTextSelected
                        ]}>
                          Wallet
                        </ThemedText>
                        {selectedPaymentMethod === 'wallet' && (
                          <ThemedText style={{ fontSize: 12, color: COLOR.sub, marginTop: 2 }}>
                            {walletLoading ? 'Loading...' : `Balance: ${currency(walletBalance)}`}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Insufficient Balance Warning */}
                  {selectedPaymentMethod === 'wallet' && walletBalance < (paymentInfo?.amount_to_pay || 0) && (
                    <View style={styles.insufficientBalanceWarning}>
                      <Ionicons name="warning-outline" size={18} color={COLOR.primary} />
                      <ThemedText style={styles.insufficientBalanceText}>
                        Insufficient balance. Please fund your account or use Flutterwave.
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.ghostBtn, { flex: 1 }]}
                onPress={handleClosePaymentModal}
                disabled={processingPayment}
              >
                <ThemedText style={{ color: COLOR.text, fontWeight: '600' }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.solidBtn, 
                  { flex: 1 },
                  (selectedPaymentMethod === 'wallet' && walletBalance < (paymentInfo?.amount_to_pay || 0)) && styles.solidBtnDisabled
                ]}
                onPress={handleProceedToPayment}
                disabled={processingPayment || (selectedPaymentMethod === 'wallet' && walletBalance < (paymentInfo?.amount_to_pay || 0))}
              >
                {processingPayment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Proceed to Payment</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispute Form Modal */}
      <Modal
        animationType="slide"
        visible={disputeModalVisible}
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setDisputeModalVisible(false);
          resetDisputeForm();
        }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fff" }}
          edges={["top", "bottom"]}
        >
          {/* Modal header */}
          <View style={styles.disputeModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setDisputeModalVisible(false);
                resetDisputeForm();
              }}
              style={styles.disputeModalBackBtn}
            >
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.disputeModalTitle}>Create Dispute</ThemedText>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView
            style={{
              flex: 1,
              backgroundColor: COLOR.bg,
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Category field */}
            <TouchableOpacity
              style={styles.disputeSelectRow}
              onPress={() => setShowCategoryModal(true)}
              disabled={isCreatingDispute}
            >
              <ThemedText
                style={[
                  styles.disputeSelectText,
                  { color: disputeCategory ? "#000" : "#9BA0A6" },
                ]}
              >
                {disputeCategory || "Issue Category"}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            {/* Details */}
            <TextInput
              style={styles.disputeDetailsInput}
              placeholder="Type Issue Details"
              placeholderTextColor="#9BA0A6"
              value={disputeDetails}
              onChangeText={setDisputeDetails}
              multiline
              textAlignVertical="top"
              editable={!isCreatingDispute}
            />

            {/* Image attach (optional) */}
            <TouchableOpacity
              style={styles.disputeImageBox}
              onPress={pickDisputeImage}
              disabled={isCreatingDispute}
            >
              {disputeImageUri ? (
                <Image
                  source={{ uri: disputeImageUri }}
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                />
              ) : (
                <Ionicons name="image" size={22} color="#9BA0A6" />
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Proceed button */}
          <View style={{ padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: COLOR.line }}>
            <TouchableOpacity
              onPress={handleSubmitDispute}
              disabled={
                !disputeCategory || !disputeDetails.trim() || isCreatingDispute
              }
              style={[
                styles.disputeProceedBtn,
                {
                  opacity:
                    !disputeCategory || !disputeDetails.trim() || isCreatingDispute
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {isCreatingDispute ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                  Submit Dispute
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={styles.categoryOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModal} onStartShouldSetResponder={() => true}>
            <View style={styles.categoryHeader}>
              <ThemedText style={styles.categoryTitle}>
                Select Issue Category
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {DISPUTE_CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    disputeCategory === category && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    setDisputeCategory(category);
                    setShowCategoryModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      disputeCategory === category && styles.categoryTextSelected,
                    ]}
                  >
                    {category}
                  </ThemedText>
                  {disputeCategory === category && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLOR.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Toast Notification */}
      {toastVisible && (
        <View style={[
          styles.toast,
          toastType === 'success' ? styles.toastSuccess : styles.toastError
        ]}>
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#fff" 
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.toastText}>{toastMessage}</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  /* header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
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
    fontSize: 14,
    fontWeight: "400",
  },

  /* tabs */
  tabsWrapper: {
    backgroundColor: COLOR.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: COLOR.chip, borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontSize: 13, fontWeight: "600" },

  /* store section */
  section: { marginBottom: 16 },

  storeHeader: {
    backgroundColor: COLOR.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  storeName: { color: "#fff", fontWeight: "700", fontSize: 14, flex: 1 },
  chatBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 27,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  chatBtnTxt: { color: COLOR.primary, fontWeight: "600", fontSize: 10 },
  roundIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E53E3E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    borderWidth: 1.3,
    borderColor: "#fff",
  },

  // white card over header
  itemsCard: {
    marginTop: -4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    overflow: "hidden",
    ...shadow(10),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemImg: { width: 104, height: 96, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, marginRight: 12 },
  itemTitle: { color: COLOR.text, fontWeight: "600", fontSize: 12 },
  price: { color: COLOR.primary, fontWeight: "800", marginTop: 6, fontSize: 12 },
  qtyTxt: { marginTop: 6, color: "#E53E3E", fontSize: 12 },

  trackBtn: {
    backgroundColor: COLOR.primary,
    borderRadius: 15,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  trackTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },

  openChatRow: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CACACA",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 8,
  },

  sectionTitle: {
    marginTop: 6,
    marginLeft: 12,
    marginBottom: 6,
  },
  addressCard: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
  },
  addrRow: {
    justifyContent: "space-between",
  },
  addrLabel: { color: COLOR.sub, fontSize: 12 },
  addrRight: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "70%" },
  addrValue: { color: COLOR.text, flexShrink: 1, fontSize: 12 },

  summaryWrap: {
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  infoRow: {
    height: 50,
    borderRadius: 5,
    backgroundColor: "#EDEDED",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  expandBtn: {
    height: 23,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#E53E3E",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Track modal styles */
  pillBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  vLine: { width: 2, flex: 1, marginTop: 4 },
  stepCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    ...shadow(6),
  },
  stepImg: { width: 104, height: 96, borderRadius: 10 },
  stepTitle: { color: COLOR.primary, fontWeight: "900", fontSize: 20, marginBottom: 2 },
  stepSub: { color: COLOR.text, opacity: 0.85, fontSize: 12 },
  stepPrice: { color: COLOR.primary, fontWeight: "800", marginTop: 6, fontSize: 12 },
  stepTime: { color: COLOR.sub, alignSelf: "flex-end", marginTop: 4, fontSize: 7 },

  warnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#FF000033",
    borderWidth: 1,
    borderColor: "#FFD2D5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  revealBtn: {
    height: 44,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  ghostBtn: {
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtn: {
    height: 44,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  centerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  alertCard: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    ...shadow(12),
  },

  /* Review buttons */
  reviewButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: {
    color: COLOR.text,
    fontSize: 12,
    fontWeight: '500',
  },
  disputeBtn: {
    backgroundColor: '#FF6B6B',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    ...shadow(4),
  },
  disputeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Review modal */
  reviewModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR.text,
  },
  reviewModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.text,
    marginBottom: 8,
  },
  reviewTextArea: {
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLOR.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imageUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addImageBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  imageThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  submitReviewBtn: {
    backgroundColor: COLOR.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitReviewBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Toast notification */
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    ...shadow(4),
  },
  toastSuccess: {
    backgroundColor: '#4CAF50',
  },
  toastError: {
    backgroundColor: '#F44336',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  /* Payment Method Selection Styles */
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: '#fff',
  },
  paymentMethodOptionSelected: {
    borderColor: COLOR.primary,
    backgroundColor: '#FFF0F0',
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLOR.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentRadioSelected: {
    borderColor: COLOR.primary,
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLOR.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLOR.text,
    fontWeight: '500',
  },
  paymentMethodTextSelected: {
    color: COLOR.primary,
    fontWeight: '600',
  },
  insufficientBalanceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD2D5',
  },
  insufficientBalanceText: {
    fontSize: 12,
    color: COLOR.primary,
    marginLeft: 8,
    flex: 1,
  },
  solidBtnDisabled: {
    backgroundColor: COLOR.sub,
    opacity: 0.5,
  },

  /* Dispute Modal Styles */
  disputeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  disputeModalBackBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  disputeModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR.text,
    flex: 1,
    textAlign: "center",
  },
  disputeSelectRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  disputeSelectText: {
    fontSize: 14,
    color: COLOR.text,
  },
  disputeDetailsInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
    height: 160,
    padding: 12,
    fontSize: 14,
    color: COLOR.text,
  },
  disputeImageBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  disputeProceedBtn: {
    backgroundColor: COLOR.primary,
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 18,
  },
  categoryOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  categoryModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  categoryList: {
    paddingVertical: 10,
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryItemSelected: {
    backgroundColor: "#FFF5F5",
  },
  categoryText: {
    fontSize: 16,
    color: "#000",
  },
  categoryTextSelected: {
    color: COLOR.primary,
    fontWeight: "600",
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  imagePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.text,
  },
  imagePickerCloseButton: {
    padding: 4,
  },
  imagePickerModalOptions: {
    gap: 16,
  },
  imagePickerOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLOR.chip,
    borderRadius: 12,
    gap: 12,
  },
  imagePickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: COLOR.text,
    fontWeight: '500',
  },
});
