import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedText from "../../../components/ThemedText";

const ServiceChatScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { service, store } = params;
  
  // Use service data if available, otherwise fallback to store data
  const chatData = service || store;

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Thank you for purchasing from us",
      sender: "store",
      time: "07:22AM",
    },
    {
      id: 2,
      text: "I will arrange a dispatch rider soon and i will contact you",
      sender: "store",
      time: "07:22AM",
    },
    {
      id: 3,
      text: "How will i get the product delivered",
      sender: "me",
      time: "07:22AM",
    },
    { id: 4, text: "Okay i will be expecting.", sender: "me", time: "07:22AM" },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  // 👇 Handle dynamic space
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      text: inputText.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={{
                padding: 5,
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 30,
              }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Image 
                source={chatData?.profileImage || require("../../../assets/Ellipse 18.png")} 
                style={styles.avatar} 
              />
              <View>
                <ThemedText style={styles.storeName}>
                  {chatData?.name || chatData?.store_name || "Service Store"}
                </ThemedText>
                <ThemedText style={styles.lastSeen}>
                  Last seen 2 mins ago
                </ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginLeft: 70 }}>
              <TouchableOpacity
                style={{
                  padding: 5,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 30,
                }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 5,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 30,
                }}
              >
                <Ionicons name="cart-outline" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Service Preview */}
          <View style={styles.serviceBox}>
            <Image 
              source={chatData?.image || require("../../../assets/Frame 264.png")} 
              style={styles.serviceImage} 
            />
            <View style={styles.serviceText}>
              <ThemedText style={styles.serviceTitle}>
                {chatData?.service || chatData?.name || "Service Name"}
              </ThemedText>
              <ThemedText style={styles.servicePrice}>
                {chatData?.price || "Price not available"}
              </ThemedText>
            </View>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "me" ? styles.rightBubble : styles.leftBubble,
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    { color: item.sender === "me" ? "#fff" : "#000" },
                  ]}
                >
                  {item.text}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeText,
                    { color: item.sender === "me" ? "#fff" : "#000" },
                  ]}
                >
                  {item.time}
                </ThemedText>
              </View>
            )}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          />

          {/* Input Box */}
          <View style={styles.chatInputContainer}>
            <TouchableOpacity>
              <Ionicons name="attach" size={20} color="#777" />
            </TouchableOpacity>
            <TextInput
              placeholder="Type a message"
              style={styles.chatInput}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              placeholderTextColor="#777"
            />
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ServiceChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: 'space-between',
    padding: 16,
    backgroundColor: "#fff",
    gap: 10,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 22,
    marginRight: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  lastSeen: {
    fontSize: 11,
    color: "#888",
  },
  serviceBox: {
    backgroundColor: "#FBEAEA",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  serviceText: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  servicePrice: {
    fontSize: 13,
    color: "#E53E3E",
    fontWeight: "bold",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  leftBubble: {
    backgroundColor: "#FCDCDC",
    alignSelf: "flex-start",
    borderTopLeftRadius: 5,
  },
  rightBubble: {
    backgroundColor: "#E53E3E",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  messageText: {
    color: "#000",
    fontSize: 13,
  },
  timeText: {
    fontSize: 10,
    textAlign: "right",
    color: "#fff",
    marginTop: 4,
  },
  inputBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0.3,
    borderColor: "#ddd",
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    marginHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 10,
    color: "#000",
  },
});
