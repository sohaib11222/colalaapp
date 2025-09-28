import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

// adjust import path to where your api.config.js lives
import { useCreateSupportTicket } from "../../../config/api.config";

const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
};

const CATEGORIES = [
  "Account",
  "Orders",
  "Payments",
  "Delivery",
  "Technical",
  "Other",
];

export default function SupportFormScreen() {
  const navigation = useNavigation();

  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const createTicket = useCreateSupportTicket({
    onSuccess: () => {
      Alert.alert("Success", "Ticket created");
      navigation.goBack();
    },
    onError: (err) => {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Could not create the ticket. Please try again.";
      Alert.alert("Error", String(msg));
    },
  });

  const subject = useMemo(() => {
    const head = (details || "").trim().replace(/\s+/g, " ").slice(0, 60);
    return `${category || "General"} - ${head || "Issue"}`;
  }, [category, details]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
  };

  const submit = () => {
    if (!category.trim()) return Alert.alert("Validation", "Select an issue category.");
    if (!details.trim()) return Alert.alert("Validation", "Type issue details.");

    // We keep exactly your UI; subject is generated here to satisfy the API.
    createTicket.mutate({
      category: category.trim(),
      subject: subject,
      description: details.trim(),
      order_id: null,
      store_order_id: null,
      // image is only used if your hook posts FormData (see comments in api.config.js)
      image: imageUri || undefined,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FF" }}>
      <StatusBar style="dark" />

      {/* Top bar */}
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, {borderWidth:0.3, borderColor:"#ccc"}]}>
          <Ionicons name="chevron-back" size={20} color={COLOR.text} />
        </TouchableOpacity>
        <ThemedText style={styles.barTitle}>Support Form</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      {/* Body */}
      <View style={styles.screenPad}>
        {/* Category row (select) */}
        <TouchableOpacity style={styles.categoryRow} onPress={() => setPickerOpen(true)} activeOpacity={0.9}>
          <ThemedText
            style={[
              styles.categoryText,
              !category ? { color: "#9CA3AF", fontSize:14 } : { color: COLOR.text },
            ]}
            numberOfLines={1}
          >
            {category || "Issue Category"}
          </ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Details box */}
        <TextInput
          style={styles.detailsBox}
          value={details}
          onChangeText={setDetails}
          placeholder="Type Issue Details"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
        />

        {/* Image tile */}
        <TouchableOpacity style={styles.imageTile} onPress={pickImage} activeOpacity={0.9}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Ionicons name="image-outline" size={24} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      {/* Proceed button */}
      <TouchableOpacity
        style={[styles.proceedBtn, createTicket.isPending && { opacity: 0.7 }]}
        onPress={submit}
        disabled={createTicket.isPending}
        activeOpacity={0.9}
      >
        <ThemedText style={styles.proceedText}>
          {createTicket.isPending ? "Submitting..." : "Proceed"}
        </ThemedText>
      </TouchableOpacity>

      {/* Simple Category Picker (modal) */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setPickerOpen(false);
                  }}
                >
                  <ThemedText style={styles.modalItemText}>{item}</ThemedText>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSep} />}
            />
            <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.modalClose}>
              <ThemedText style={styles.modalCloseText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function iosShadow(d = 8) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: d / 2,
      shadowOffset: { width: 0, height: d / 3 },
    },
    android: { elevation: d / 2 },
  });
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 8,
    backgroundColor:"#fff"
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",

  },
  barTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: COLOR.text,
  },

  screenPad: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  categoryRow: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // ...iosShadow(4),
  },
  categoryText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },

  detailsBox: {
    marginTop: 12,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
    color: COLOR.text,
    // ...iosShadow(2),
  },

  imageTile: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: "#E6E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  imagePreview: { width: 56, height: 56, borderRadius: 10 },

  proceedBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    ...iosShadow(10),
  },
  proceedText: { color: "#fff", fontWeight: "600" },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 10,
    ...iosShadow(12),
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOR.text,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  modalItem: { paddingHorizontal: 14, paddingVertical: 12 },
  modalItemText: { fontSize: 14, color: COLOR.text },
  modalSep: { height: 1, backgroundColor: "#F0F1F4" },
  modalClose: { padding: 12, alignItems: "center" },
  modalCloseText: { color: COLOR.primary, fontWeight: "600" },
});
