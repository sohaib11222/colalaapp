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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useOrderDetails, fileUrl, useStartChat, useAddProductReview, useAddStoreReview } from "../../../config/api.config"; // ⬅️ NEW

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
function TrackOrderModal({ visible, onClose, storeName = "Sasha Store", status = 0, trackingData = null, orderData = null, onShowFullDetails = null }) {
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

              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
                  <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Return</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
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

        {/* Confirm reveal modal */}
        <Modal
          visible={confirmOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmOpen(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={styles.alertCard}>
              <Ionicons
                name="warning-outline"
                size={46}
                color={COLOR.primary}
                style={{ alignSelf: "center", marginBottom: 8 }}
              />
              <ThemedText
                style={{ color: COLOR.text, textAlign: "center", marginBottom: 18, fontSize: 13 }}
              >
                Do you confirm that your product has been delivered
              </ThemedText>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => setConfirmOpen(false)}
                >
                  <ThemedText style={{ color: COLOR.text, fontSize: 12 }}>Go Back</ThemedText>
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
            <TouchableOpacity style={styles.addImageBtn}>
              <Ionicons name="image-outline" size={20} color={COLOR.sub} />
            </TouchableOpacity>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.imageThumb} />
            ))}
          </View>

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
function StoreBlock({ store, orderId, onTrack, showSingleItem = false, orderData = null, isExpanded = false, onToggleExpanded = null, onReviewProduct = null, onReviewStore = null, addingProductReview = false, addingStoreReview = false }) {
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
      console.log("Starting chat with store ID:", storeId);
      
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
            store_order_id: storeId,
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
                  store_order_id: storeId,
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
  const totalPay = Number(orderData?.grand_total) || (itemsCost - coupon - points + fee + shippingFee);

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
              <InfoRow left="Platform fee" right={currency(fee)} topBorder />
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

        {/* Review buttons - only show for delivered orders */}
        {store.status >= 2 && (
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

      // Map API status to UI status (0: pending, 1: out_for_delivery, 2: delivered, 3: completed)
      const getStatusIndex = (status) => {
        switch (status) {
          case 'pending': return 0;
          case 'out_for_delivery': return 1;
          case 'delivered': return 2;
          case 'completed': return 3;
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
      };
    });

    // Use order_no string visibly where needed
    return {
      id: apiOrder.order_no || String(apiOrder.id),
      stores,
    };
  }, [apiOrder]);

  // Tabs (unchanged)
  const STATUS = ["Order placed", "Out for delivery", "Delivered", "Completed"];
  
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
      <View style={styles.tabsWrap}>
        {STATUS.map((label, i) => {
          const active = i === statusIdx;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}
              onPress={() => setStatusIdx(i)}
              activeOpacity={0.9}
            >
              <ThemedText style={[styles.tabTxt, active ? { color: "#fff" } : { color: COLOR.text }]}>
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
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
  tabsWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: "row",
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: "#ECEFF3", borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontSize: 9, fontWeight: "400" },

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
});
