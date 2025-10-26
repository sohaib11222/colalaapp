import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
   RefreshControl,   // ⬅️ add this
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../components/ThemedText";
import { useCart, useUpdateCartItem, useDeleteCartItem, fileUrl, useStartChat } from "../../config/api.config";

/* -------------------- THEME -------------------- */
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
const PRODUCT_IMG = require("../../assets/Frame 314.png");

export default function CartScreen() {
  const navigation = useNavigation();

  // Fetch cart from API (include refetch so we can refresh after mutations)
  const { data, isLoading, isError, refetch } = useCart();

  const [agree, setAgree] = useState(false);
  const [stores, setStores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);  // ⬅️ new

  // Chat functionality
  const { mutate: startChat, isPending: creatingChat } = useStartChat();

  // Handle start chat
  const handleStartChat = (store) => {
    try {
      const storeId = store.store?.id || store.id;
      console.log("Starting chat with store ID:", storeId);
      
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
                  profileImage: store.store?.profile_image ? fileUrl(store.store.profile_image) : null,
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
                  profileImage: store.store?.profile_image ? fileUrl(store.store.profile_image) : null,
                },
              },
            });
          },
        }
      );
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // mutations
  const updateItem = useUpdateCartItem({
    onError: (err) => Alert.alert("Error", err?.message || "Failed to update quantity."),
  });
  const deleteItemMut = useDeleteCartItem({
    onError: (err) => Alert.alert("Error", err?.message || "Failed to remove item."),
  });

  // hydrate UI from API
  useEffect(() => {
  const storesObj = data?.data?.stores || {};
  console.log("Cart API Data:", data?.data);
  console.log("Stores Object:", storesObj);

  // tiny helper to coerce possible string/number/null → number
  const toNum = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const normalized = Object.entries(storesObj).map(([storeId, block]) => {
    const itemsInBlock = Array.isArray(block?.items) ? block.items : [];
    const firstItem = itemsInBlock[0];
    const storeInfo = firstItem?.store;

    console.log("Processing store:", storeId, "with items:", itemsInBlock);

    // map items and keep delivery + totals intact
    const items = itemsInBlock.map((it) => {
      const imageUrl = it?.product?.images?.[0]?.path
        ? fileUrl(it.product.images[0].path)
        : null;

      // prefer discount_price for unit, fall back to unit_price
      const unit = toNum(it?.discount_price ?? it?.unit_price);
      const qty = toNum(it?.qty);
      const lineTotal = toNum(it?.line_total, unit * qty); // safety fallback
      const deliveryFee = toNum(it?.delivery_fee);         // 👈 from API

      const finalPrice = unit; // your previous "price" field was per-unit

      console.log("Item mapping:", {
        id: it?.id,
        name: it?.name,
        unit_price: it?.unit_price,
        discount_price: it?.discount_price,
        final_price: finalPrice,
        qty,
        line_total: lineTotal,
        delivery_fee: deliveryFee,
        image_url: imageUrl,
      });

      return {
        id: String(it?.id), // cart item id
        title: `${it?.name ?? ""}${it?.color ? ` - ${it.color}` : ""}${
          it?.size ? ` (${it.size})` : ""
        }`,
        price: finalPrice,      // per-unit price you were using
        qty,
        image: imageUrl,
        product: it?.product,   // keep product info for navigation

        // 🔹 add these so UI can show shipping per item or totals later
        lineTotal,              // numeric line total (after discounts)
        deliveryFee,            // numeric shipping for this item
        delivery_fee: deliveryFee, // Also include as delivery_fee for compatibility
        totalWithShipping: lineTotal + deliveryFee, // convenience
      };
    });

    // compute per-store shipping & totals from the mapped items
    const storeShippingTotal = items.reduce((sum, it) => sum + toNum(it.deliveryFee), 0);
    const storeItemsSubtotal = items.reduce((sum, it) => sum + toNum(it.lineTotal), 0);
    const storeGrand = storeItemsSubtotal + storeShippingTotal;

    return {
      id: String(storeId),
      name: storeInfo?.store_name || `Store ${storeId}`,
      selected: true,
      store: storeInfo, // Keep store info for chat
      items,

      // 🔹 new calculated helpers (read-only; won’t break old usage)
      shipping_fee: storeShippingTotal,              // total shipping for this store
      items_subtotal: storeItemsSubtotal,            // mirrors API if you want to trust FE calc
      subtotal_with_shipping: storeGrand,            // convenience for UI
    };
  });

  setStores(normalized);
}, [data]);


  // qty -> POST /buyer/cart/items/:id { qty }
  const updateQty = (sid, iid, delta) => {
    const store = stores.find((s) => s.id === sid);
    const item = store?.items.find((i) => i.id === iid);
    if (!item) return;
    const nextQty = Math.max(1, item.qty + delta);
    updateItem.mutate(
      { itemId: iid, qty: nextQty },
      {
        onSuccess: () => {
          // response already logged by the hook
          refetch();
        },
      }
    );
  };

  // delete -> DELETE /buyer/cart/items/:id
  const deleteItem = (sid, iid) => {
    deleteItemMut.mutate(iid, {
      onSuccess: () => {
        // response already logged by the hook
        refetch();
      },
    });
  };

  const perStore = useMemo(() => {
    const map = {};
    for (const s of stores) {
      const count = s.items.reduce((a, b) => a + b.qty, 0);
      const total = s.items.reduce((a, b) => a + b.price * b.qty, 0);
      map[s.id] = { count, total };
    }
    return map;
  }, [stores]);

  const totals = useMemo(() => {
    let items = 0;
    let sum = 0;
    for (const s of stores) {
      if (!s.selected) continue;
      items += perStore[s.id]?.count || 0;
      sum += perStore[s.id]?.total || 0;
    }
    return { items, sum };
  }, [stores, perStore]);

  const canCheckout = agree && totals.items > 0;
const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();   // ⬅️ refetch data from API
    } finally {
      setRefreshing(false);
    }
  };
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={COLOR.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg, alignItems: "center", justifyContent: "center" }}>
        <ThemedText>Failed to load cart.</ThemedText>
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
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Cart
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={   // ⬅️ added
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOR.primary} />
        }
      >
        {stores.map((store) => (
          <View key={store.id} style={styles.storeSection}>
            {/* OUTSIDE checkbox + column */}
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <TouchableOpacity
                onPress={() =>
                  setStores((p) =>
                    p.map((s) => (s.id === store.id ? { ...s, selected: !s.selected } : s))
                  )
                }
                style={[
                  styles.outCheck,
                  store.selected && { backgroundColor: COLOR.primary, borderColor: COLOR.primary },
                ]}
              >
                {store.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                {/* red header */}
                <View style={styles.storeHeader}>
                  <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                  <TouchableOpacity 
                    style={styles.chatBtn}
                    onPress={() => handleStartChat(store)}
                    disabled={creatingChat}
                  >
                    {creatingChat ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ThemedText style={styles.chatBtnTxt}>Start Chat</ThemedText>
                    )}
                  </TouchableOpacity>
                </View>

                {/* white card over header */}
                <View style={styles.itemsCard}>
                  {store.items.map((it, idx) => (
                    <TouchableOpacity
                      key={it.id}
                      style={[styles.itemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: COLOR.line }]}
                      onPress={() => {
                        if (it.product) {
                          navigation.navigate("CategoryNavigator", {
                            screen: "ProductDetails",
                            params: { 
                              productId: it.product.id,
                              product: it.product
                            }
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      {/* Use API image or fallback */}
                      <Image 
                        source={it.image ? { uri: it.image } : PRODUCT_IMG} 
                        style={styles.itemImg}
                        onError={(error) => {
                          console.log("Image load error for item:", it.title, "Image URL:", it.image, "Error:", error.nativeEvent.error);
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully for item:", it.title, "Image URL:", it.image);
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.itemTitle} numberOfLines={2}>
                          {it.title}
                        </ThemedText>
                        <ThemedText style={styles.price}>{currency(it.price)}</ThemedText>

                        <View style={styles.qtyRow}>
                          <QtyBtn onPress={(e) => {
                            e.stopPropagation();
                            updateQty(store.id, it.id, -1);
                          }} icon="remove" />
                          <ThemedText style={styles.qtyVal}>
                            {updateItem.isPending ? "…" : it.qty}
                          </ThemedText>
                          <QtyBtn onPress={(e) => {
                            e.stopPropagation();
                            updateQty(store.id, it.id, +1);
                          }} icon="add" />

                          <View style={{ flex: 1 }} />
                          <TouchableOpacity 
                            style={styles.iconChip}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                              if (it.product) {
                                navigation.navigate("CategoryNavigator", {
                                  screen: "ProductDetails",
                                  params: { 
                                    productId: it.product.id,
                                    product: it.product
                                  }
                                });
                              }
                            }}
                          >
                            <Ionicons name="create-outline" size={18} color={COLOR.text} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconChip}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                              deleteItem(store.id, it.id);
                            }}
                          >
                            {deleteItemMut.isPending ? (
                              <ActivityIndicator size="small" color={COLOR.primary} />
                            ) : (
                              <Ionicons name="trash-outline" size={18} color={COLOR.primary} />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* two rows (same design as mock) */}
                  <View
                    style={[
                      styles.totalLikeRow,
                      {
                        borderTopRightRadius: 15,
                        borderTopLeftRadius: 15,
                        borderBottomRightRadius: 5,
                        borderBottomLeftRadius: 5,
                      },
                    ]}
                  >
                    <ThemedText style={{ color: COLOR.text }}>No it items</ThemedText>
                    <ThemedText style={{ color: COLOR.text, fontWeight: "700" }}>
                      {perStore[store.id]?.count || 0}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.totalLikeRow,
                      {
                        marginBottom: 10,
                        marginTop: 5,
                        borderTopRightRadius: 5,
                        borderTopLeftRadius: 5,
                        borderBottomRightRadius: 15,
                        borderBottomLeftRadius: 15,
                      },
                    ]}
                  >
                    <ThemedText style={{ color: COLOR.text, fontWeight: "600" }}>Total</ThemedText>
                    <ThemedText style={{ color: COLOR.primary, fontWeight: "800" }}>
                      {currency(perStore[store.id]?.total || 0)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* page totals styled like the card rows */}
        <View style={{ gap: 10, marginTop: 6 }}>
          <View style={styles.totalLikeRow}>
            <ThemedText style={{ color: COLOR.text }}>Total Items</ThemedText>
            <ThemedText style={{ color: COLOR.text, fontWeight: "700" }}>
              {totals.items}
            </ThemedText>
          </View>
          <View style={styles.totalLikeRow}>
            <ThemedText style={{ color: COLOR.text, fontWeight: "600" }}>Total</ThemedText>
            <ThemedText style={{ color: COLOR.primary, fontWeight: "800" }}>
              {currency(totals.sum)}
            </ThemedText>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity style={styles.termsRow} onPress={() => setAgree((v) => !v)}>
          <View
            style={[
              styles.smallCheck,
              agree && { backgroundColor: COLOR.primary, borderColor: COLOR.primary },
            ]}
          >
            {agree && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <ThemedText style={styles.termsTxt}>
            I agree to Colala’s{" "}
            <ThemedText style={styles.link}>terms of use</ThemedText>,{" "}
            <ThemedText style={styles.link}>returns policy</ThemedText> and{" "}
            <ThemedText style={styles.link}>privacy policy</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout bar */}
      <View style={styles.checkoutBar}>
        <TouchableOpacity
          disabled={!canCheckout}
          style={[styles.checkoutBtn, !canCheckout && { opacity: 0.5 }]}
          onPress={() =>
            navigation.navigate("Shipping", {
              stores: stores.filter((s) => s.selected),
            })
          }
        >
          <ThemedText style={styles.checkoutTxt}>Checkout</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- small bits ---------- */
const QtyBtn = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={styles.qtyBtn}>
    <Ionicons name={icon} size={16} color="#fff" />
  </TouchableOpacity>
);

/* -------------------- Styles (unchanged) -------------------- */
function shadow(e = 12) {
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

const styles = StyleSheet.create({
  /* Header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 30,
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
    zIndex: 5,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
  },

  /* Store section */
  storeSection: { marginBottom: 16 },
  outCheck: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
    marginTop: 12,
  },

  storeHeader: {
    backgroundColor: COLOR.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: { color: "#fff", fontWeight: "700", fontSize: 15, flex: 1 },
  chatBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnTxt: { color: COLOR.primary, fontWeight: "600", fontSize: 12 },

  // white card “over” the header
  itemsCard: {
    marginTop: -12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    ...shadow(10),
  },

  itemRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: "center",
  },
  itemImg: { width: 116, height: 88, borderRadius: 12, marginRight: 12 },
  itemTitle: { color: COLOR.text, fontWeight: "600" },
  price: { color: COLOR.primary, fontWeight: "800", marginTop: 6 },

  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: { marginHorizontal: 12, color: COLOR.text, fontWeight: "700" },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  // “No it items” and “Total” rows
  totalLikeRow: {
    backgroundColor: COLOR.chip,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* Terms */
  termsRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 },
  smallCheck: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  termsTxt: { color: COLOR.text, flex: 1 },
  link: { color: COLOR.primary },

  /* Checkout bar */
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: COLOR.bg,
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
  },
  checkoutBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutTxt: { color: "#fff", fontWeight: "700" },
});
