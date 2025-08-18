// screens/MyReviewsScreen.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

/* -------------------- THEME -------------------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  light: "#F3F4F6",
};

/* ---------- DEMO DATA ---------- */
const AV =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop";
const P1 =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop";
const P2 =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop";
const P3 =
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=400&auto=format&fit=crop";

const INITIAL_STORE_REVIEWS = [
  {
    id: "s1",
    user: "Adam Sandler",
    avatar: AV,
    rating: 5,
    time: "07-16-25/05:33AM",
    body: "The Store is amazing",
    store: { name: "Sasha Stores", rating: 4.5, image: P1 },
    gallery: [],
  },
  {
    id: "s2",
    user: "Adam Sandler",
    avatar: AV,
    rating: 5,
    time: "07-16-25/05:33AM",
    body: "The Store is amazing",
    store: { name: "Sasha Stores", rating: 4.5, image: P1 },
    gallery: [],
  },
  {
    id: "s3",
    user: "Adam Sandler",
    avatar: AV,
    rating: 4,
    time: "07-16-25/05:33AM",
    body: "The Store is amazing",
    store: { name: "Sasha Stores", rating: 4.5, image: P1 },
    gallery: [P1, P2, P3],
  },
];

const INITIAL_PRODUCT_REVIEWS = [
  {
    id: "p1",
    user: "Adam Sandler",
    avatar: AV,
    rating: 5,
    time: "07-16-25/05:33AM",
    body: "I really enjoyed using the product",
    product: { title: "Iphone 12 pro max", price: "₦2,500,000", image: P1 },
    gallery: [],
  },
  {
    id: "p2",
    user: "Adam Sandler",
    avatar: AV,
    rating: 5,
    time: "07-16-25/05:33AM",
    body: "I really enjoyed using the product",
    product: { title: "Iphone 12 pro max", price: "₦2,500,000", image: P2 },
    gallery: [],
  },
  {
    id: "p3",
    user: "Adam Sandler",
    avatar: AV,
    rating: 4,
    time: "07-16-25/05:33AM",
    body: "I really enjoyed using the product",
    product: { title: "Iphone 12 pro max", price: "₦2,500,000", image: P3 },
    gallery: [P1, P2, P3],
  },
];

/* ---------- Small helpers ---------- */
const Stars = ({ value = 0, size = 14, color = COLOR.primary }) => (
  <View style={{ flexDirection: "row" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= Math.round(value) ? "star" : "star-outline"}
        size={size}
        color={color}
        style={{ marginRight: 2 }}
      />
    ))}
  </View>
);

const StarsEditable = ({ value, onChange, size = 28 }) => (
  <View style={{ flexDirection: "row", alignSelf: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} onPress={() => onChange(i)} style={{ paddingHorizontal: 6 }}>
        <Ionicons
          name={i <= value ? "star" : "star-outline"}
          size={size}
          color={COLOR.primary}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const Capsule = ({ left, onRightPress, rightText = "View Store" }) => (
  <View style={styles.capsuleRow}>
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      <Image source={{ uri: left.image }} style={styles.capsuleImg} />
      <View style={{ marginLeft: 8 }}>
        {"rating" in left ? (
          <>
            <ThemedText style={styles.capsuleTitle}>{left.name}</ThemedText>
            <ThemedText style={styles.capsuleSub}>{left.rating} Stars</ThemedText>
          </>
        ) : (
          <>
            <ThemedText style={styles.capsuleTitle}>{left.title}</ThemedText>
            <ThemedText style={[styles.capsuleSub, { color: COLOR.primary }]}>{left.price}</ThemedText>
          </>
        )}
      </View>
    </View>

    <TouchableOpacity onPress={onRightPress} style={{ paddingHorizontal: 4, paddingVertical: 6 }}>
      <ThemedText style={styles.capsuleLink}>{rightText}</ThemedText>
    </TouchableOpacity>
  </View>
);

const Gallery = ({ images = [] }) => {
  if (!images.length) return null;
  return (
    <View style={styles.galleryRow}>
      {images.slice(0, 3).map((u, i) => (
        <Image key={`${u}-${i}`} source={{ uri: u }} style={styles.galleryImg} />
      ))}
    </View>
  );
};

/* ---------- Card ---------- */
const ReviewCard = ({ item, type = "store", onPress, onPressRight }) => {
  const isStore = type === "store";
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {/* Header */}
      <View style={styles.cardTop}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <ThemedText style={styles.name}>{item.user}</ThemedText>
            <Stars value={item.rating} />
          </View>
        </View>
        <ThemedText style={styles.time}>{item.time}</ThemedText>
      </View>

      {/* Body */}
      <ThemedText style={styles.body}>{item.body}</ThemedText>

      {/* Optional gallery */}
      <Gallery images={item.gallery} />

      {/* Bottom capsule */}
      {isStore ? (
        <Capsule left={item.store} rightText="View Store" onRightPress={onPressRight} />
      ) : (
        <Capsule left={item.product} rightText="View product" onRightPress={onPressRight} />
      )}
    </TouchableOpacity>
  );
};

/* ================== Screen ================== */
export default function MyReviewsScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState("store"); // 'store' | 'product'

  // keep editable copies
  const [storeReviews, setStoreReviews] = useState(INITIAL_STORE_REVIEWS);
  const [productReviews, setProductReviews] = useState(INITIAL_PRODUCT_REVIEWS);

  const data = useMemo(
    () => (tab === "store" ? storeReviews : productReviews),
    [tab, storeReviews, productReviews]
  );

  // view/edit modals state
  const [activeReview, setActiveReview] = useState(null); // the review object
  const [activeType, setActiveType] = useState("store");
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  // edit form state
  const [editRating, setEditRating] = useState(4);
  const [editText, setEditText] = useState("");

  const openView = (review, type) => {
    setActiveReview(review);
    setActiveType(type);
    setViewVisible(true);
  };

  const openEditFromView = () => {
    setViewVisible(false);
    setTimeout(() => {
      setEditRating(activeReview?.rating || 4);
      setEditText(activeReview?.body || "");
      setEditVisible(true);
    }, 0);
  };

  const handleDelete = () => {
    if (!activeReview) return;
    if (activeType === "store") {
      setStoreReviews((prev) => prev.filter((r) => r.id !== activeReview.id));
    } else {
      setProductReviews((prev) => prev.filter((r) => r.id !== activeReview.id));
    }
    setViewVisible(false);
    setActiveReview(null);
  };

  const handleSaveEdit = () => {
    if (!activeReview) return;
    const apply = (arr) =>
      arr.map((r) => (r.id === activeReview.id ? { ...r, rating: editRating, body: editText } : r));
    if (activeType === "store") setStoreReviews(apply);
    else setProductReviews(apply);
    setEditVisible(false);
    // also refresh what's shown in the view modal if user reopens it
    setActiveReview((r) => (r ? { ...r, rating: editRating, body: editText } : r));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
      {/* Header (white, no radius) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
            }
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            MY Reviews
          </ThemedText>

          {/* Right spacer for symmetry */}
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabsWrap}>
        <TouchableOpacity
          onPress={() => setTab("store")}
          style={[styles.tabBtn, tab === "store" ? styles.tabActive : styles.tabInactive]}
        >
          <ThemedText style={[styles.tabTxt, tab === "store" ? styles.tabTxtActive : styles.tabTxtInactive]}>
            Store Reviews
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("product")}
          style={[styles.tabBtn, tab === "product" ? styles.tabActive : styles.tabInactive]}
        >
          <ThemedText
            style={[styles.tabTxt, tab === "product" ? styles.tabTxtActive : styles.tabTxtInactive]}
          >
            Product Reviews
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <ReviewCard
            item={item}
            type={tab}
            onPress={() => openView(item, tab)}
            onPressRight={() => {
              if (tab === "store") {
                navigation.navigate("ServiceNavigator", {
                  screen: "StoreDetails",
                  params: { store: { name: item?.store?.name, rating: item?.store?.rating } },
                });
              } else {
                // navigation.navigate("ProductDetails", { id: ... })
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ===== View Modal (My review) ===== */}
      <Modal visible={viewVisible} transparent animationType="slide" onRequestClose={() => setViewVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setViewVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={[styles.sheetTitle, {marginLeft:150}]}>My review</ThemedText>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setViewVisible(false)}
              >
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {/* rating box (read-only) */}
            <View style={styles.ratingBox}>
              <Stars value={activeReview?.rating || 0} size={28} />
            </View>

            {/* The review content card */}
            {activeReview && (
              <View style={styles.viewCard}>
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={{ uri: activeReview.avatar }} style={styles.avatar} />
                    <View>
                      <ThemedText style={styles.name}>Chris Pine</ThemedText>
                      <Stars value={activeReview.rating} />
                    </View>
                  </View>
                  <ThemedText style={styles.time}>{activeReview.time}</ThemedText>
                </View>

                <Gallery images={activeReview.gallery} />
                <ThemedText style={styles.body}>{activeReview.body}</ThemedText>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnLight]}
                onPress={openEditFromView}
              >
                <ThemedText style={[styles.modalBtnText, styles.modalBtnLightTxt]}>Edit Review</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={handleDelete}
              >
                <ThemedText style={styles.modalBtnText}>Delete Review</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Edit Modal (Leave a review) ===== */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>Leave a review</ThemedText>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {/* Editable rating box */}
            <View style={styles.ratingBox}>
              <StarsEditable value={editRating} onChange={setEditRating} />
            </View>

            <ThemedText style={styles.revLabel}>Type review</ThemedText>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Type your review"
              placeholderTextColor={COLOR.sub}
              multiline
              style={styles.textArea}
            />

            {/* Static thumbs row to match design */}
            <View style={styles.photosRow}>
              <TouchableOpacity style={styles.addPhoto}>
                <Ionicons name="image-outline" size={20} color={COLOR.sub} />
              </TouchableOpacity>
              {[P1, P2, P3].map((t, i) => (
                <Image key={i} source={{ uri: t }} style={styles.photoThumb} />
              ))}
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSaveEdit}>
              <ThemedText style={styles.sendBtnTxt}>Send Review</ThemedText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================== Styles ================== */
function shadow(e = 6) {
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
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
    zIndex: 0,
  },

  /* Tabs */
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontWeight: "400", fontSize: 11 },
  tabTxtActive: { color: "#fff" },
  tabTxtInactive: { color: COLOR.text },

  /* Card */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  name: { color: COLOR.text, fontWeight: "700" },
  time: { color: COLOR.sub, fontSize: 12 },
  body: { color: COLOR.text, marginTop: 10 },

  /* Gallery */
  galleryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  galleryImg: { width: 80, height: 80, borderRadius: 10 },

  /* Capsule row */
  capsuleRow: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  capsuleImg: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLOR.light },
  capsuleTitle: { color: COLOR.text, fontWeight: "600" },
  capsuleSub: { color: COLOR.sub, fontSize: 12, marginTop: 2 },
  capsuleLink: { color: COLOR.primary, fontWeight: "600", fontSize: 12 },

  /* ===== Modals ===== */
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 68,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D8DCE2",
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text, marginLeft:130
  },
  closeBtn: {
    borderColor: "#000",
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 2,
    alignItems: "center",
  },

  ratingBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 10,
    alignItems: "center",
  },

  viewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    // borderWidth: 1,
    // borderColor: COLOR.line,
    padding: 12,
    marginBottom: 10,
  },

  modalBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnLight: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  modalBtnLightTxt: { color: COLOR.text },
  modalBtnDanger: { backgroundColor: COLOR.primary },
  modalBtnText: { color: "#fff", fontWeight: "400" },

  /* Edit modal */
  revLabel: { color: COLOR.sub, marginTop: 4, marginBottom: 6 },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    minHeight: 110,
    padding: 12,
    textAlignVertical: "top",
    color: COLOR.text,
  },
  photosRow: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 12 },
  addPhoto: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  photoThumb: { width: 48, height: 48, borderRadius: 10 },

  sendBtn: {
    height: 50,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  sendBtnTxt: { color: "#fff", fontWeight: "400" },
});
