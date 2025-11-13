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
  StyleSheet,
  Alert,
  ActivityIndicator,
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
  useDisputeDetails,
  useDisputeMessage,
  queryClient,
  fileUrl,
} from "../../../config/api.config";

const COLOR = {
  primary: "#E53E3E",
  bg: "#F8F9FA",
  lightPink: "#FCDCDC",
  white: "#fff",
  text: "#2D3748",
  sub: "#718096",
  line: "#E2E8F0",
  lightGray: "#F7FAFC",
};

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

export default function DisputeChatScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const disputeId = params?.disputeId;
  const insets = useSafeAreaInsets();

  if (!disputeId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top", "bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.primary} />
          <ThemedText style={styles.errorText}>
            Dispute information not available. Please try again.
          </ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [headerH, setHeaderH] = useState(0);
  const [inputText, setInputText] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const listRef = useRef(null);

  // Fetch dispute details
  const { data: disputeData, isLoading, error } = useDisputeDetails(disputeId, {
    enabled: !!disputeId,
  });

  // Process messages data
  const messages = useMemo(() => {
    let apiMessages = [];
    if (disputeData?.data?.dispute_chat?.messages) {
      const sorted = [...disputeData.data.dispute_chat.messages].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      
      apiMessages = sorted.map((m) => {
        const isBuyer = m.sender_type === "buyer";
        const isAdmin = m.sender_type === "admin";
        const isSystem = m.sender_type === "system";
        
        return {
          id: m.id,
          text: m.message || "",
          sender: isBuyer ? "me" : isAdmin ? "admin" : isSystem ? "system" : "seller",
          time: fmtTime(m.created_at),
          image: m.image,
          senderName: m.sender_name || (isBuyer ? "You" : isAdmin ? "Admin" : "Seller"),
          isRead: m.is_read,
        };
      });
    }
    
    return [...apiMessages, ...optimisticMessages];
  }, [disputeData, optimisticMessages]);

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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant permission to access your photo library.");
        return;
      }

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

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useDisputeMessage({
    onSuccess: (data) => {
      setOptimisticMessages([]);
      scrollToEnd();
      queryClient.invalidateQueries({ queryKey: ["disputeDetails", disputeId] });
    },
    onError: (error) => {
      console.log("Send message error:", error);
      Alert.alert("Error", error?.message || "Failed to send message. Please try again.");
    },
  });

  const handleSend = () => {
    const v = inputText.trim();
    
    if (!v && !imageUri) {
      Alert.alert("Empty Message", "Please enter a message or attach an image.");
      return;
    }

    // Create optimistic message
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      text: v || "📷 Image",
      sender: "me",
      time: fmtTime(new Date()),
      image: imageUri,
      senderName: "You",
      isRead: false,
      isOptimistic: true,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setInputText("");
    const currentImageUri = imageUri;
    setImageUri(null);
    scrollToEnd();

    // Create form data
    const formData = new FormData();
    if (v) {
      formData.append("message", v);
    }
    if (currentImageUri) {
      formData.append("image", {
        uri: currentImageUri,
        type: "image/jpeg",
        name: "dispute_image.jpg",
      });
    }

    sendMessage({ disputeId, payload: formData });
  };

  const renderMessage = ({ item }) => {
    const mine = item.sender === "me";
    const isSystem = item.sender === "system";
    const isAdmin = item.sender === "admin";
    const isOptimistic = item.isOptimistic;
    
    return (
      <View style={styles.messageContainer}>
        <View
          style={[
            styles.bubble, 
            mine ? styles.bubbleRight : isSystem ? styles.bubbleSystem : styles.bubbleLeft,
            isOptimistic && styles.bubbleOptimistic
          ]}
        >
          {!mine && !isSystem && (
            <ThemedText style={styles.senderName}>
              {item.senderName}
            </ThemedText>
          )}
          {item.text && (
            <ThemedText style={[
              styles.msg, 
              { color: mine ? "#fff" : isSystem ? COLOR.text : COLOR.text }
            ]}>
              {item.text}
            </ThemedText>
          )}
          {item.image && (
            <Image
              source={{ 
                uri: item.image.startsWith('http') 
                  ? item.image 
                  : fileUrl(item.image)
              }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.messageFooter}>
            <ThemedText style={[
              styles.time, 
              { color: mine ? "#fff" : isSystem ? COLOR.sub : COLOR.sub }
            ]}>
              {item.time}
            </ThemedText>
            {mine && (
              <View style={styles.readStatus}>
                <Ionicons 
                  name={isOptimistic ? "time" : (item.isRead ? "checkmark-done" : "checkmark")} 
                  size={12} 
                  color={isOptimistic ? "#fff" : (item.isRead ? "#4CAF50" : "#fff")} 
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading dispute details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top", "bottom"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLOR.primary} />
          <ThemedText style={styles.errorText}>
            Failed to load dispute details. Please try again.
          </ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!disputeData?.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading dispute details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const dispute = disputeData.data.dispute;
  const disputeChat = disputeData.data.dispute_chat;
  const store = disputeChat?.store || {};

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLOR.bg }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + headerH : 0}
      >
        {/* Header */}
        <View
          style={styles.header}
          onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../../assets/image copy.png")}
              style={styles.avatar}
            />
            <View>
              <ThemedText style={styles.storeName}>
                Dispute Chat
              </ThemedText>
              <ThemedText style={styles.lastSeen}>
                {store.name || store.store_name || "Store"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.cartButton} />
        </View>

        {/* Dispute Summary Card */}
        {dispute && (
          <View style={styles.disputeCard}>
            <View style={styles.disputeRow}>
              <ThemedText style={styles.disputeLabel}>Category</ThemedText>
              <ThemedText style={styles.disputeValue}>{dispute.category}</ThemedText>
            </View>
            {dispute.details && (
              <View style={styles.disputeRow}>
                <ThemedText style={styles.disputeLabel}>Details</ThemedText>
                <ThemedText style={styles.disputeDescription}>{dispute.details}</ThemedText>
              </View>
            )}
            {dispute.images && dispute.images.length > 0 && (
              <View style={styles.disputeImages}>
                {dispute.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: fileUrl(img) }}
                    style={styles.disputeImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Messages */}
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
              <Ionicons name="chatbubbles-outline" size={48} color={COLOR.sub} />
              <ThemedText style={styles.emptyText}>
                No messages yet. Start the conversation!
              </ThemedText>
            </View>
          }
        />

        {/* Composer */}
        <View style={[styles.composer, { marginBottom: 10 + insets.bottom }]}>
          <TouchableOpacity onPress={pickImage} disabled={isSending}>
            <Ionicons name="attach" size={24} color="#000" />
          </TouchableOpacity>
          
          {imageUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                style={styles.removeImage}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#777"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            editable={!isSending}
          />
          <TouchableOpacity onPress={handleSend} disabled={isSending || (!inputText.trim() && !imageUri)}>
            {isSending ? (
              <ActivityIndicator size="small" color={COLOR.primary} />
            ) : (
              <Ionicons name="send" size={24} color={(!inputText.trim() && !imageUri) ? COLOR.sub : COLOR.primary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLOR.white,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOR.text,
  },
  lastSeen: {
    fontSize: 12,
    color: COLOR.sub,
    marginTop: 2,
  },
  cartButton: {
    width: 40,
    height: 40,
  },
  disputeCard: {
    backgroundColor: COLOR.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  disputeRow: {
    marginBottom: 12,
  },
  disputeLabel: {
    fontSize: 12,
    color: COLOR.sub,
    marginBottom: 4,
  },
  disputeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR.text,
  },
  disputeDescription: {
    fontSize: 13,
    color: COLOR.text,
    lineHeight: 18,
  },
  disputeImages: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  disputeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: COLOR.primary,
    borderBottomRightRadius: 4,
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: COLOR.white,
    borderBottomLeftRadius: 4,
  },
  bubbleSystem: {
    alignSelf: "center",
    backgroundColor: COLOR.lightGray,
    maxWidth: "90%",
  },
  bubbleOptimistic: {
    opacity: 0.7,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLOR.sub,
    marginBottom: 4,
  },
  msg: {
    fontSize: 14,
    lineHeight: 20,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 10,
  },
  readStatus: {
    marginLeft: 4,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLOR.white,
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    gap: 8,
  },
  imagePreview: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeImage: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLOR.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLOR.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLOR.white,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLOR.sub,
    textAlign: "center",
  },
});

