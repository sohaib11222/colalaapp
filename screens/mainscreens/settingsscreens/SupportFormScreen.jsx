import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useCreateSupportTicket } from "../../../config/api.config";

const COLOR = {
  primary: "#E53E3E",
  bg: "#F8F9FA",
  white: "#fff",
  text: "#2D3748",
  sub: "#718096",
  line: "#E2E8F0",
  lightGray: "#F7FAFC",
};

const CATEGORIES = [
  "Orders",
  "Payments",
  "Account",
  "Technical",
  "Refunds",
  "Other",
];

export default function SupportFormScreen() {
  const navigation = useNavigation();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Create support ticket mutation
  const { mutate: createTicket, isLoading: isCreating } = useCreateSupportTicket({
    onSuccess: (data) => {
      Alert.alert(
        "Success",
        "Support ticket created successfully. Our team will get back to you soon.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      console.log("Create ticket error:", error);
      console.log("Error details:", {
        status: error?.status,
        message: error?.message,
        data: error?.data
      });
      Alert.alert("Error", "Failed to create support ticket. Please try again.");
    },
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
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

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  const handleSubmit = () => {
    if (!category || !description.trim()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    const subject = `${category} - ${description.trim().substring(0, 50)}`;
    const descriptionText = description.trim();

    // Debug logging
    console.log("Support Form Data:", {
      category,
      subject,
      description: descriptionText,
      hasImage: !!imageUri,
    });

    if (imageUri) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("category", category);
      formData.append("subject", subject);
      formData.append("description", descriptionText);
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "support_image.jpg",
      });

      console.log("Sending FormData with image");
      createTicket(formData);
    } else {
      // Send JSON for text-only tickets
      console.log("Sending JSON without image");
      createTicket({
        category,
        subject,
        description: descriptionText,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLOR.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Support Form</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.selectRow}
            onPress={() => setShowCategoryModal(true)}
            disabled={isCreating}
          >
            <ThemedText
              style={[
                styles.selectText,
                { color: category ? COLOR.text : COLOR.sub },
              ]}
            >
              {category || "Issue Category"}
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color={COLOR.sub} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type Issue Details"
            placeholderTextColor={COLOR.sub}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
        </View>

        {/* Image Attachment */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={pickImage}
            disabled={isCreating}
          >
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  style={styles.removeImage}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.attachmentPlaceholder}>
                <Ionicons name="image-outline" size={24} color={COLOR.sub} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!category || !description.trim() || isCreating}
          style={[
            styles.submitButton,
            {
              opacity:
                !category || !description.trim() || isCreating
                  ? 0.6
                  : 1,
            },
          ]}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Proceed
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>

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
                Select Category
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryList}>
              {CATEGORIES.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    category === cat && styles.categoryItemSelected,
                  ]}
                  onPress={() => selectCategory(cat)}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </ThemedText>
                  {category === cat && (
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
    backgroundColor: COLOR.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0,
  },
  backButton: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLOR.lightGray,
  },
  headerTitle: { 
    fontSize: 18, 
    color: COLOR.text, 
    fontWeight: "600" 
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLOR.white,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOR.text,
    marginBottom: 8,
  },
  selectRow: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  selectText: { 
    fontSize: 16,
    color: COLOR.text,
  },
  input: {
    backgroundColor: COLOR.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLOR.text,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  textArea: {
    height: 200,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: COLOR.sub,
    textAlign: "right",
    marginTop: 4,
  },
  attachmentButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLOR.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOR.line,
    overflow: "hidden",
  },
  attachmentPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  imagePreview: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
    minHeight: 60,
    minWidth: 60,
  },
  removeImage: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLOR.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: COLOR.sub,
  },
  submitButton: {
    backgroundColor: COLOR.primary,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});