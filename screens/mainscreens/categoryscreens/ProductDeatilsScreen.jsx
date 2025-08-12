import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const ProductDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [showPhone, setShowPhone] = useState(false);
  const storePhoneNumber = "08077601234";

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : q));

  // ---------- Description defaults ----------
  const specs = {
    brand: product?.specs?.brand ?? "Apple",
    model: product?.specs?.model ?? "12 pro Max",
    color: product?.specs?.color ?? "Black",
    storage: product?.specs?.storage ?? "64 gig",
    resolution: product?.specs?.resolution ?? "1080 x 1920",
    display: product?.specs?.display ?? "IPS LCD",
    screenSize: product?.specs?.screenSize ?? "6.5",
    battery: product?.specs?.battery ?? "3000 mah",
    sim: product?.specs?.sim ?? "Nanosim",
    camera: product?.specs?.camera ?? "20 mega pixel",
  };

  // ---------- Reviews data (dynamic if provided, else fallback) ----------
  const fallbackReviews = [
    {
      id: "r1",
      user: { name: "Adam Sandler", avatar: require("../../../assets/Ellipse 18.png") },
      rating: 5,
      text: "Really great product, i enjoyed using it for a long time",
      date: "07-16-25/05:33AM",
      images: [],
      replies: [],
    },
    {
      id: "r2",
      user: { name: "Adam Sandler", avatar: require("../../../assets/Ellipse 18.png") },
      rating: 5,
      text: "Really great product, i enjoyed using it for a long time",
      date: "07-16-25/05:33AM",
      images: [],
      replies: [
        {
          id: "rep1",
          name: product?.store?.name ?? "Store",
          avatar: product?.store?.logo ?? require("../../../assets/Ellipse 18.png"),
          text: "Thanks for the review",
          date: "07-16-25/05:33AM",
        },
      ],
    },
    {
      id: "r3",
      user: { name: "Chris Pine", avatar: require("../../../assets/Ellipse 61.png") },
      rating: 5,
      text: "Really great product, i enjoyed using it for a long time",
      date: "07-16-25/05:33AM",
      images: [
        require("../../../assets/phone3.png"),
        require("../../../assets/phone4.png"),
        require("../../../assets/phone5.png"),
      ],
      replies: [
        {
          id: "rep2",
          name: product?.store?.name ?? "Store",
          avatar: product?.store?.logo ?? require("../../../assets/Ellipse 18.png"),
          text: "Thanks for the review",
          date: "07-16-25/05:33AM",
        },
      ],
    },
  ];

  const initialReviews =
    product?.reviews?.length ? product.reviews : fallbackReviews;

  const [reviews, setReviews] = useState(initialReviews);
  const [replyInputs, setReplyInputs] = useState({}); // { [reviewId]: "text" }

  const avg =
    Math.round(
      (reviews.reduce((s, r) => s + (r.rating || 0), 0) /
        (reviews.length || 1)) *
      2
    ) / 2;

  const handleSendReply = (reviewId) => {
    const text = (replyInputs[reviewId] || "").trim();
    if (!text) return;

    const now = new Date();
    const newReply = {
      id: `rep-${now.getTime()}`,
      name: product?.store?.name ?? "Store",
      avatar: product?.store?.logo ?? require("../../../assets/Ellipse 18.png"),
      text,
      date: `${now.toLocaleDateString()} ${now
        .toLocaleTimeString()
        .slice(0, 5)}`,
    };

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replies: [...(r.replies || []), newReply] }
          : r
      )
    );
    setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const StarRow = ({ value = 0, size = 16 }) => (
    <View style={{ flexDirection: "row" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ionicons
          key={i}
          name={
            i < Math.floor(value)
              ? "star"
              : value > i && value < i + 1
                ? "star-half"
                : "star-outline"
          }
          size={size}
          color="#E53E3E"
          style={{ marginRight: 3 }}
        />
      ))}
    </View>
  );

  const DescriptionCard = () => (
    <View style={styles.descWrap}>
      <Text style={styles.descLabel}>Product Name</Text>
      <Text style={styles.descValue}>{product?.title}</Text>
      <View style={styles.lightDivider} />

      <Text style={styles.descLabel}>Description</Text>
      <Text style={[styles.descValue, { lineHeight: 20 }]}>
        {product?.description ||
          "Very clean iphone 12 pro max , out of the box , factory unlocked"}
      </Text>
      <View style={styles.lightDivider} />

      <Text style={styles.descLabel}>Other Details</Text>

      {[
        ["Brand", specs.brand],
        ["Model", specs.model],
        ["Color", specs.color],
        ["Storage", specs.storage],
        ["Resolution", specs.resolution],
        ["Display", specs.display],
        ["Screen size", specs.screenSize],
        ["Battery", specs.battery],
        ["Sim", specs.sim],
        ["Camera", specs.camera],
      ].map(([k, v]) => (
        <View style={styles.specRow} key={k}>
          <Text style={styles.specKey}>{k}</Text>
          <Text style={styles.specVal}>{v}</Text>
        </View>
      ))}
    </View>
  );

  const ReviewsSection = () => (
    <View style={styles.reviewsWrap}>
      {/* Star summary */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <StarRow value={avg || 4} size={28} />
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLeft}>{Math.round(avg) || 4} Stars</Text>
        <Text style={styles.summaryRight}>{reviews.length} Reviews</Text>
      </View>

      {/* Reviews list */}
      {reviews.map((rv) => (
        <View key={rv.id} style={styles.reviewCard}>
          {/* Header */}
          <View style={styles.reviewTop}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={rv.user.avatar} style={styles.avatar} />
              <View>
                <Text style={styles.reviewerName}>{rv.user.name}</Text>
                <StarRow value={rv.rating} size={12} />
              </View>
            </View>
            <Text style={styles.reviewDate}>{rv.date}</Text>
          </View>

          {/* Body */}
          <Text style={styles.reviewText}>{rv.text}</Text>

          {/* Images (optional) */}
          {!!rv.images?.length && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {rv.images.map((img, i) => (
                <Image key={i} source={img} style={styles.reviewThumb} />
              ))}
            </View>
          )}

          {/* Reply row */}
          <View style={styles.replyRow}>
            <Ionicons name="return-down-back" size={18} color="#111" />
            <TextInput
              style={styles.replyInput}
              placeholder={`Reply as ${product?.store?.name ?? "Store"}...`}
              placeholderTextColor="#888"
              value={replyInputs[rv.id] ?? ""}
              onChangeText={(t) =>
                setReplyInputs((p) => ({ ...p, [rv.id]: t }))
              }
              onSubmitEditing={() => handleSendReply(rv.id)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.replySend}
              onPress={() => handleSendReply(rv.id)}
            >
              <Ionicons name="paper-plane-outline" size={16} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Seller replies */}
          {rv.replies?.map((rep) => (
            <View key={rep.id} style={styles.sellerReply}>
              <Image source={rep.avatar} style={styles.sellerAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{rep.name}</Text>
                <Text style={styles.sellerDate}>{rep.date}</Text>
                <Text style={styles.sellerText}>{rep.text}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={[styles.headerIcon, { marginRight: 10 }]}>
            <Ionicons name="ellipsis-vertical" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="heart-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* MAIN IMAGE */}
        <Image source={product.image} style={styles.mainImage} />

        {/* THUMBNAILS + TABS */}
        <View style={{ backgroundColor: "#F5F7FF" }}>
          <FlatList
            horizontal
            data={[product.image, ...(product.images || [])]}
            renderItem={({ item }) => <Image source={item} style={styles.thumbnail} />}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, marginTop: 10, marginBottom: 10 }}
          />

          <View style={styles.tabsRow}>
            {["Overview", "Description", "Reviews"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, selectedTab === tab && styles.tabActive]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CONTENT BY TAB */}
        {selectedTab === "Description" ? (
          <DescriptionCard />
        ) : selectedTab === "Reviews" ? (
          <ReviewsSection />
        ) : (
          <>
            {/* OVERVIEW */}
            <View style={styles.productInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.productName}>{product.title}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={20} color="red" />
                  <Text style={styles.rating}>{product.rating}</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{product.price}</Text>
                {!!product.originalPrice && (
                  <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                )}
              </View>
              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {product.description || "No description available"}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* SUBTOTAL & CART */}
            <View style={styles.subtotalRow}>
              <View>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotal}>{product.price}</Text>
              </View>
              <TouchableOpacity style={styles.cartIcon}>
                <Image
                  source={require("../../../assets/ShoppingCartSimple.png")}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={[styles.qtyButton, { backgroundColor: "#E53E3E", paddingHorizontal: 14 }]}
                  onPress={decrement}
                >
                  <Text style={[styles.qtyText, { color: "#fff" }]}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyButton, { backgroundColor: "#E53E3E" }]}
                  onPress={increment}
                >
                  <Text style={[styles.qtyText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />

            {/* CONTACT BUTTONS */}
            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="logo-whatsapp" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="call-outline" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn}>
                <Ionicons name="chatbubble-outline" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.revealBtn} onPress={() => setShowPhone((s) => !s)}>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  {showPhone ? storePhoneNumber : "Reveal Phone Number"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CHECKOUT BUTTON */}
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>

            {/* STORE DETAILS (unchanged) */}
            {/* STORE DETAILS (your existing block) */}
            <View style={{ paddingHorizontal: 16, marginBottom: 30 }}>
              <Text style={{ fontWeight: "500", fontSize: 15, marginBottom: 10 }}>Store Details</Text>

              <View style={{ backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", elevation: 2 }}>
                <Image
                  source={product.store?.background}
                  style={{ width: "100%", height: 110, resizeMode: "cover" }}
                />

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: -28, paddingHorizontal: 12 }}>
                  <Image
                    source={product.store?.logo}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 15, marginTop: 30 }}>
                      {product.store?.name}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                      {product.store?.categories?.map((cat, i) => (
                        <Text
                          key={i}
                          style={{
                            fontSize: 11,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            backgroundColor: i === 0 ? "#0000FF33" : "#FF000033",
                            color: i === 0 ? "#0000FF" : "#FF0000",
                            borderRadius: 6,
                            fontWeight: "500",
                            borderWidth: 0.5,
                            borderColor: i === 0 ? "#0000FF" : "#FF0000",
                          }}
                        >
                          {cat}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                    <Ionicons name="star" color="red" size={16} />
                    <Text style={{ fontSize: 14, marginLeft: 4 }}>{product.store?.rating}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, paddingHorizontal: 12 }}>
                  <Ionicons name="location-outline" size={16} color="#888" />
                  <Text style={{ marginLeft: 4, fontSize: 13, color: "#555" }}>
                    {product.store?.location}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 5,
                    marginVertical: 10,
                    paddingVertical: 5,
                    marginHorizontal: 10,
                    gap: 7,
                    borderRadius: 10,
                    borderColor: "#CDCDCD",
                    borderWidth: 1,
                  }}
                >
                  <TouchableOpacity style={styles.socialBox}>
                    <Image source={product.store?.social?.whatsapp} style={styles.socialImgLg} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBox}>
                    <Image source={product.store?.social?.instagram} style={styles.socialImgSm} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBox}>
                    <Image source={product.store?.social?.x} style={styles.socialImgXs} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBox}>
                    <Image source={product.store?.social?.facebook} style={styles.socialImgSm} />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    paddingBottom: 14,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                      <Image source={require("../../../assets/shop.png")} style={styles.statIcon} />
                      <View>
                        <Text style={{ fontSize: 10, color: "#888" }}>Qty Sold</Text>
                        <Text style={{ fontSize: 14, fontWeight: "500" }}>{product.store?.sold}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.verticalDivider} />

                  <View style={{ alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                      <Image source={require("../../../assets/profile-2user.png")} style={styles.statIcon} />
                      <View>
                        <Text style={{ fontSize: 10, color: "#888" }}>Followers</Text>
                        <Text style={{ fontSize: 14, fontWeight: "500" }}>{product.store?.followers}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.verticalDivider} />

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#E53E3E",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>Go to Shop</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerIcon: { borderColor: "#ccc", borderWidth: 1, borderRadius: 20, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "400" },

  mainImage: { width: "100%", height: 250, resizeMode: "cover" },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  tabsRow: { flexDirection: "row", paddingHorizontal: 10, marginBottom: 10 },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
    borderWidth: 0.3,
    borderColor: "#CDCDCD",
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#E53E3E" },
  tabText: { fontSize: 12, color: "#888", fontWeight: "400" },
  tabTextActive: { color: "#fff", fontWeight: "500" },

  // Overview
  productInfo: { padding: 16 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 15, fontWeight: "500", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginLeft: 5 },
  rating: { fontSize: 14, color: "#00000080", marginLeft: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  price: { color: "red", fontWeight: "700", fontSize: 18, marginRight: 8 },
  originalPrice: { fontSize: 12, color: "#888", textDecorationLine: "line-through" },
  divider: { height: 1, backgroundColor: "#E5E5E5", marginVertical: 10 },
  sectionTitle: { marginTop: 5, fontWeight: "500", fontSize: 13 },
  description: { fontSize: 12, color: "#444", marginTop: 4 },

  // Subtotal & qty
  subtotalRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: -5 },
  subtotalLabel: { fontSize: 12, color: "#444" },
  subtotal: { color: "red", fontWeight: "700", fontSize: 14 },
  cartIcon: {
    marginLeft: "auto",
    marginRight: 10,
    borderColor: "#ccc",
    borderRadius: 15,
    borderWidth: 1,
    padding: 6,
  },
  qtyControl: { flexDirection: "row", alignItems: "center", borderRadius: 6, overflow: "hidden" },
  qtyButton: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 7 },
  qtyText: { fontSize: 18 },
  qtyNumber: { paddingHorizontal: 15, color: "#E53E3E", fontSize: 16 },

  // Contact & checkout
  contactRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 12, alignItems: "center", gap: 8 },
  contactBtn: { borderColor: "#ccc", borderRadius: 15, borderWidth: 1, padding: 10 },
  revealBtn: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    paddingVertical: 15,
  },
  checkoutBtn: {
    backgroundColor: "red",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  checkoutText: { color: "#fff", fontWeight: "400" },

  // Store shared
  verticalDivider: { width: 1, height: "100%", backgroundColor: "#ccc", marginHorizontal: 10 },
  statIcon: { width: 23, height: 23, resizeMode: "contain" },
  socialBox: { borderColor: "#CDCDCD", borderWidth: 1, borderRadius: 7, padding: 5, alignItems: "center" },
  socialImgLg: { width: 32, height: 32, borderRadius: 10 },
  socialImgSm: { width: 28, height: 28, borderRadius: 10, marginTop: 2 },
  socialImgXs: { width: 26, height: 26, borderRadius: 10, marginTop: 2 },

  // Description tab card
  descWrap: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
  },
  descLabel: { color: "#7A7A7A", fontSize: 12, marginBottom: 6 },
  descValue: { color: "#161616", fontSize: 14, marginBottom: 8 },
  lightDivider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 8 },
  specRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  specKey: { color: "#6A6A6A", fontSize: 13, flex: 1 },
  specVal: { color: "#161616", fontSize: 13, flexShrink: 1, textAlign: "right" },

  // Reviews tab
  reviewsWrap: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    paddingBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  summaryLeft: { color: "#E53E3E", fontWeight: "500" },
  summaryRight: { color: "#111", fontWeight: "500" },

  reviewCard: {
    backgroundColor: "#F7F7F7",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
  },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
  reviewerName: { fontSize: 14, fontWeight: "600" },
  reviewDate: { fontSize: 10, color: "#888" },
  reviewText: { marginTop: 8, fontSize: 13, color: "#222" },
  reviewThumb: { width: 62, height: 62, borderRadius: 10, resizeMode: "cover" },

  replyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  replyInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "#111",
  },
  replySend: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },

  sellerReply: { flexDirection: "row", gap: 10, marginTop: 10 },
  sellerAvatar: { width: 28, height: 28, borderRadius: 14, marginTop: 2 },
  sellerName: { fontSize: 13, fontWeight: "600" },
  sellerDate: { fontSize: 9, color: "#999", marginTop: 2 },
  sellerText: { fontSize: 12, color: "#333", marginTop: 6 },
});
