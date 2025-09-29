import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import {
  useChatMessages,
  useSendChatMessage,
  queryClient,
  useCreateDispute,
} from "../../../config/api.config";

const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  lightPink: "#FCDCDC",
  white: "#fff",
  text: "#101318",
  sub: "#6C727A",
};
const toSrc = (v) =>
  typeof v === "number" ? v : v ? { uri: String(v) } : undefined;
const CATEGORIES = [
  "Order Dispute",
  "Wrong Item",
  "Damaged Item",
  "Late Delivery",
  "Refund Request",
  "Other",
];

// import { useCreateDispute } from '../../../config/api.config';

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

export default function ChatDetailsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const store = params?.store || {};
  const chatId = params?.chat_id;

  // Debug logging to see what data is received
  console.log("ChatDetailsScreen received params:", {
    store: store,
    chatId: chatId,
    storeName: store?.name,
    storeProfileImage: store?.profileImage
  });

  // Handle case where chatId is not provided
  if (!chatId) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Chat information not available. Please try again.
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

  // Use store data from API response or fallback to params
  const currentStore = (storeData && storeData.id) ? storeData : store;
  const avatarSrc = toSrc(currentStore?.profile_image || currentStore?.profileImage) || toSrc("https://i.pravatar.cc/100?img=65");
  const insets = useSafeAreaInsets();

  const [headerH, setHeaderH] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDispute, setShowDispute] = useState(false);

  // Messages: API + optimistic locals
  const { data: apiRes, isLoading: messagesLoading, error: messagesError } = useChatMessages(chatId, {
    enabled: !!chatId, // Only fetch if chatId exists
  });
  const apiMsgs = apiRes?.data?.messages || [];
  const storeData = apiRes?.data?.store || {};
  const disputeData = apiRes?.data?.dispute || null;
  
  const mappedApi = useMemo(() => {
    if (!apiMsgs || !Array.isArray(apiMsgs)) return [];
    
    const sorted = [...apiMsgs].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    return sorted.map((m) => {
      if (!m || !m.id) return null; // Skip invalid messages
      return {
        id: m.id,
        text: m.message || (m.image ? "(image)" : ""), // Handle both text and image messages
        sender: m.sender_type === "buyer" ? "me" : "store",
        time: fmtTime(m.created_at),
        image: m.image, // Store image URL for display
        senderInfo: m.sender, // Store sender information
      };
    }).filter(Boolean); // Remove null entries
  }, [apiMsgs]);

  const [messages, setMessages] = useState(mappedApi);
  useEffect(() => setMessages(mappedApi), [mappedApi]);

  const [inputText, setInputText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", scrollToEnd);
    const b = Keyboard.addListener("keyboardDidHide", scrollToEnd);
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  const { mutate: sendMessage } = useSendChatMessage();

  const handleSend = () => {
    const v = inputText.trim();
    if (!v || !chatId) return;

    // optimistic bubble
    const time = new Date()
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, text: v, sender: "me", time },
    ]);
    setInputText("");
    scrollToEnd();

    // send to API
    sendMessage(
      { chatId, message: v },
      {
        onSuccess: () => {
          // refresh thread + chat list meta (last msg/time/unread)
          queryClient.invalidateQueries({ queryKey: ["chatMessages", chatId] });
          queryClient.invalidateQueries({ queryKey: ["chats"] }); // <- ensure chat list updates
        },
        onError: () => {
          // Optional rollback of optimistic bubble
        },
      }
    );
  };

  const KAV_OFFSET = Platform.OS === "ios" ? insets.top + headerH : 0;

  // ---------- Dispute modal state ----------
  const [issueCategory, setIssueCategory] = useState("");
  const [issueDetails, setIssueDetails] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Get store_order_id from route params
  const storeOrderId = params?.store_order_id;

  // Create dispute mutation
  const { mutate: createDispute, isLoading: isCreatingDispute } =
    useCreateDispute({
      onSuccess: (data) => {
        const time = new Date()
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "dispute",
            sender: "me",
            time,
            payload: {
              category: issueCategory,
              details: issueDetails.trim(),
              imageUri,
            },
          },
        ]);
        setShowDispute(false);
        resetDisputeForm();
        scrollToEnd();
        Alert.alert(
          "Success",
          "Dispute created successfully. A customer agent will join you shortly."
        );
      },
      onError: (error) => {
        console.log("Dispute creation error:", error);
        Alert.alert("Error", "Failed to create dispute. Please try again.");
      },
    });

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const resetDisputeForm = () => {
    setIssueCategory("");
    setIssueDetails("");
    setImageUri(null);
    setIsSubmitting(false);
    setShowCategoryModal(false);
  };

  const submitDispute = () => {
    // Debug logging
    console.log("Submit dispute debug:", {
      issueCategory,
      issueDetails: issueDetails.trim(),
      chatId,
      storeOrderId,
      finalStoreOrderId: storeOrderId || chatId,
      params,
    });

    if (!issueCategory || !issueDetails.trim() || !chatId) {
      Alert.alert(
        "Missing Information",
        `Please fill in all required fields.\n\nDebug info:\n- Category: ${issueCategory}\n- Details: ${issueDetails.trim()}\n- Chat ID: ${chatId}\n- Store Order ID: ${storeOrderId}`
      );
      return;
    }

    // If storeOrderId is not available, use chatId as fallback
    const finalStoreOrderId = storeOrderId || chatId;

    if (!finalStoreOrderId) {
      Alert.alert(
        "Store Order ID Missing",
        "Store Order ID is not available. Please contact support or try again later."
      );
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append("store_order_id", finalStoreOrderId.toString());
    formData.append("category", issueCategory);
    formData.append("details", issueDetails.trim());

    // Add image if selected
    if (imageUri) {
      formData.append("images[]", {
        uri: imageUri,
        type: "image/jpeg",
        name: "dispute_image.jpg",
      });
    }

    // Submit dispute using the hook
    createDispute(formData);
  };

  const selectCategory = (category) => {
    setIssueCategory(category);
    setShowCategoryModal(false);
  };

  const renderMessage = ({ item }) => {
    if (item.type === "dispute") {
      const { category, details } = item.payload || {};
      return (
        <View style={styles.disputeCard}>
          <ThemedText style={styles.disputeLabel}>Category</ThemedText>
          <ThemedText style={styles.disputeValue}>{category}</ThemedText>
          <ThemedText style={[styles.disputeLabel, { marginTop: 10 }]}>
            Details
          </ThemedText>
          <ThemedText style={styles.disputeValue}>{details}</ThemedText>
          <View style={styles.disputeNotice}>
            <ThemedText style={styles.disputeNoticeText}>
              Kindly be patient, a customer agent will join you shortly
            </ThemedText>
          </View>
        </View>
      );
    }
    const mine = item.sender === "me";
    return (
      <View
        style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft]}
      >
        {item.text && (
          <ThemedText style={[styles.msg, { color: mine ? "#fff" : "#000" }]}>
            {item.text}
          </ThemedText>
        )}
        {item.image && (
          <Image
            source={{ uri: `https://colala.hmstech.xyz/storage/${item.image}` }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        <ThemedText style={[styles.time, { color: mine ? "#fff" : "#000" }]}>
          {item.time}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLOR.bg }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={KAV_OFFSET}
      >
        {/* Header (unchanged UI) */}
        <View
          style={styles.header}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          <TouchableOpacity
            style={styles.hIcon}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={avatarSrc} style={styles.avatar} />
            <View>
              <ThemedText style={styles.storeName}>
                {currentStore?.store_name || currentStore?.name || "Store"}
              </ThemedText>
              <ThemedText style={styles.lastSeen}>
                {currentStore?.status === "active" ? "Online" : "Offline"}
              </ThemedText>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={styles.hIcon}
              onPress={() => setMenuOpen((v) => !v)}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hIcon}>
              <Image
                source={require("../../../assets/msg-cart.png")}
                style={styles.iconImg}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Popover menu */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuOpen(false)}
          />
          <View
            style={[
              styles.popover,
              { top: insets.top + headerH + 6, right: 16 },
            ]}
          >
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setMenuOpen(false);
                setShowDispute(true);
              }}
            >
              <ThemedText style={styles.popoverText}>
                Create a dispute
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Messages */}
        {messagesLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
          </View>
        ) : messagesError ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Failed to load messages. Please try again.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 8 + insets.bottom,
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            renderItem={renderMessage}
            onContentSizeChange={scrollToEnd}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No messages yet. Start the conversation!
                </ThemedText>
              </View>
            }
          />
        )}

        {/* Composer */}
        <View style={[styles.composer, { marginBottom: 10 + insets.bottom }]}>
          <TouchableOpacity>
            <Image
              source={require("../../../assets/Vector (21).png")}
              style={styles.iconImg}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#777"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend}>
            <Image
              source={require("../../../assets/Vector (22).png")}
              style={styles.iconImg}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Dispute full-screen modal (unchanged UI) */}
      <Modal
        animationType="slide"
        visible={showDispute}
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDispute(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fff" }}
          edges={["top", "bottom"]}
        >
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDispute(false)}
              style={styles.hIcon}
            >
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Support Form</ThemedText>
            <View style={{ width: 32 }} />
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: COLOR.bg,
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
          >
            {/* Category field */}
            <TouchableOpacity
              style={styles.selectRow}
              onPress={() => setShowCategoryModal(true)}
              disabled={isCreatingDispute}
            >
              <ThemedText
                style={[
                  styles.selectText,
                  { color: issueCategory ? "#000" : "#9BA0A6" },
                ]}
              >
                {issueCategory || "Issue Category"}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            {/* Details */}
            <TextInput
              style={styles.detailsInput}
              placeholder="Type Issue Details"
              placeholderTextColor="#9BA0A6"
              value={issueDetails}
              onChangeText={setIssueDetails}
              multiline
              textAlignVertical="top"
            />

            {/* Image attach (optional) */}
            <TouchableOpacity
              style={styles.imageBox}
              onPress={pickImage}
              disabled={isSubmitting}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                />
              ) : (
                <Ionicons name="image" size={22} color="#9BA0A6" />
              )}
            </TouchableOpacity>
          </View>

          {/* Proceed */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={submitDispute}
              disabled={
                !issueCategory || !issueDetails.trim() || isCreatingDispute
              }
              style={[
                styles.proceedBtn,
                {
                  opacity:
                    !issueCategory || !issueDetails.trim() || isCreatingDispute
                      ? 0.6
                      : 1,
                },
              ]}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "400" }}>
                {isCreatingDispute ? "Creating Dispute..." : "Proceed"}
              </ThemedText>
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
          <View style={styles.categoryModal}>
            <View style={styles.categoryHeader}>
              <ThemedText style={styles.categoryTitle}>
                Select Issue Category
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryList}>
              {CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    issueCategory === category && styles.categoryItemSelected,
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      issueCategory === category && styles.categoryTextSelected,
                    ]}
                  >
                    {category}
                  </ThemedText>
                  {issueCategory === category && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLOR.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hIcon: { padding: 6, borderColor: "#ddd", borderWidth: 1, borderRadius: 20 },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginHorizontal: 10,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  storeName: {
    fontSize: 14,
    color: "#000",
    fontWeight: "400",
    marginBottom: 5,
  },
  lastSeen: { fontSize: 8, color: "#888" },

  bubble: { maxWidth: "76%", padding: 12, borderRadius: 20, marginVertical: 5 },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: COLOR.lightPink,
    borderTopLeftRadius: 6,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: COLOR.primary,
    borderBottomRightRadius: 6,
  },
  msg: { fontSize: 13 },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  time: { fontSize: 8, textAlign: "right", marginTop: 6, color: "#FFFFFF80" },

  composer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#CDCDCD",
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 10,
    color: "#000",
    marginHorizontal: 10,
  },

  // Popover
  overlay: { position: "absolute", inset: 0, backgroundColor: "transparent" },
  popover: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 170,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  popoverItem: { paddingHorizontal: 14, paddingVertical: 10 },
  popoverText: { color: "#000" },

  // Dispute card
  disputeCard: {
    backgroundColor: "#FFE8E8",
    borderColor: "#F7B6B6",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignSelf: "stretch",
  },
  disputeLabel: { color: "#7A7A7A", fontSize: 12 },
  disputeValue: { color: "#000", fontSize: 13, marginTop: 2 },
  disputeNotice: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EF534E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#FFE8E8",
  },
  disputeNoticeText: { color: "#EF534E", fontSize: 12 },

  // Modal
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 16, color: "#000", fontWeight: "600" },

  selectRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  selectText: { fontSize: 14 },

  detailsInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
    height: 160,
    padding: 12,
    fontSize: 14,
    color: "#000",
  },
  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  proceedBtn: {
    backgroundColor: COLOR.primary,
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 18,
  },

  // Category Modal Styles
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

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLOR.primary,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
