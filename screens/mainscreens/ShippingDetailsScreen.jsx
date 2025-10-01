import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import ThemedText from "../../components/ThemedText";

import {
  BASE_URL,
  http,
  useAddresses,
  useUpdateCartItem,
  useDeleteCartItem,
  fileUrl,
  useStartChat,
} from "../../config/api.config";

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

const PRODUCT_IMG = require("../../assets/Frame 314.png");
const currency = (n) => `₦${Number(n || 0).toLocaleString()}`;

/* ---------- SCREEN ---------- */
export default function ShippingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // incoming stores from Cart: { id, name (hardcoded there), items:[{id, title, price, qty}] }
  const incomingStores = Array.isArray(route?.params?.stores)
    ? route.params.stores
    : [];
    
  console.log("ShippingDetailsScreen - Incoming stores:", incomingStores);
  console.log("ShippingDetailsScreen - Route params:", route?.params);

  // hydrate local state for this screen (adds coupon/points/expanded/addresses/UI-only stuff)
  const [stores, setStores] = useState(
    incomingStores.length
      ? incomingStores.map((s) => ({
          id: String(s.id),
          name: s.name || `Store ${s.id}`, // name not in API -> stays hardcoded
          expanded: false,
          coupon: "",
          points: "",
          selectedAddressId: null, // we’ll set first address below when addresses load
          addresses: [], // injected from GET /buyer/addresses
          items: (s.items || []).map((it) => {
            console.log("ShippingDetailsScreen - Mapping item:", {
              id: it.id,
              title: it.title,
              price: it.price,
              image: it.image,
              product: it.product
            });
            
            return {
              id: String(it.id), // CART ITEM ID (used by CART_ITEM endpoint)
              title: it.title,
              price: Number(it.price || 0),
              qty: Number(it.qty || 1),
              image: it.image || PRODUCT_IMG, // Use API image if available, fallback to default
              product: it.product, // Keep product info for navigation
            };
          }),
        }))
      : // fallback demo (only used if user enters from elsewhere)
        [
          {
            id: "s1",
            name: "Sasha Stores",
            expanded: false,
            coupon: "",
            points: "",
            selectedAddressId: null,
            addresses: [],
            items: [
              { id: "i1", title: "Iphone 16 pro max - Black", price: 2500000, qty: 1, image: PRODUCT_IMG },
              { id: "i2", title: "Iphone 14 pro max - Green", price: 2500000, qty: 1, image: PRODUCT_IMG },
            ],
          },
        ]
  );

  /* ---------- fetch addresses & inject to each store ---------- */
  const { data: addrRes, isLoading: addrLoading, isError: addrError } = useAddresses();
  useEffect(() => {
    const list = Array.isArray(addrRes?.data) ? addrRes.data : [];
    if (!list.length) return;
    setStores((prev) =>
      prev.map((s) => ({
        ...s,
        addresses: list.map((ad) => ({
          id: String(ad.id),
          phone: ad.phone || ad.phone_number || "—", // not guaranteed in payload => fallback
          address:
            ad.full_address ||
            [ad.address_line1, ad.address_line2, ad.city, ad.state].filter(Boolean).join(", ") ||
            "—",
        })),
        selectedAddressId: s.selectedAddressId || String(list[0].id),
      }))
    );
  }, [addrRes]);

  /* ---------- Wallet Balance (GET /buyer/getBalance) ---------- */
  const [wallet, setWallet] = useState({
    shopping_balance: 0,
    loyality_points: 0,
  });
  useEffect(() => {
    let mounted = true;
    http
      .get(`${BASE_URL}/buyer/getBalance`)
      .then((res) => {
        if (!mounted) return;
        const w = res?.data || {};
        setWallet({
          shopping_balance: Number(w.shopping_balance || 0),
          loyality_points: Number(w.loyality_points || 0),
        });
      })
      .catch(() => {
        // keep zeros if it fails
      });
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- Payment modal + chosen method ---------- */
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState(""); // 'flutterwave' | 'wallet'

  // Chat functionality
  const { mutate: startChat, isPending: creatingChat } = useStartChat();

  // Handle start chat
  const handleStartChat = (store) => {
    try {
      const storeId = store.id;
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
                  profileImage: null, // Store profile image not available in this context
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
                  profileImage: null,
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

  /* ---------- Qty & Delete mutations using CART_ITEM(:id) ---------- */
  const updateItem = useUpdateCartItem({
    onError: (err) => Alert.alert("Error", err?.message || "Failed to update quantity."),
  });
  const deleteItemMut = useDeleteCartItem({
    onError: (err) => Alert.alert("Error", err?.message || "Failed to remove item."),
  });

  const updateQty = (sid, iid, delta) => {
    console.log("Update qty etc", { sid, iid, delta });
    setStores((prev) => {
      const next = prev.map((s) => {
        if (s.id !== sid) return s;
        return {
          ...s,
          items: s.items.map((it) =>
            it.id !== iid ? it : { ...it, qty: Math.max(1, (it.qty || 1) + delta) }
          ),
        };
      });
      const store = next.find((s) => s.id === sid);
      const item = store?.items.find((i) => i.id === iid);
      const newQty = item?.qty ?? 1;
      // Optimistic update; call API with CART ITEM id
      updateItem.mutate(
        { itemId: iid, qty: newQty },
        {
          onError: () => {
            // rollback
            setStores(prev);
          },
        }
      );
      return next;
    });
  };

  const deleteItem = (sid, iid) => {
    const snapshot = stores;
    setStores((prev) =>
      prev.map((s) => (s.id !== sid ? s : { ...s, items: s.items.filter((it) => it.id !== iid) }))
    );
    deleteItemMut.mutate(iid, {
      onError: () => setStores(snapshot), // rollback if failed
    });
  };

  /* ---------- Per-store & Overall calcs (hardcoded fees locally) ---------- */
  const perStore = useMemo(() => {
    const map = {};
    for (const s of stores) {
      const itemsCount = s.items.reduce((a, b) => a + (b.qty || 0), 0);
      const itemsCost = s.items.reduce((a, b) => a + Number(b.price || 0) * (b.qty || 0), 0);
      const couponDiscount = s.coupon?.trim() ? 5000 : 0; // NOT in API response now -> hardcoded
      const pointsDiscount = Math.max(0, Math.floor(Number(s.points || 0))) * 1; // 1 point = ₦1 (hardcoded)
      const deliveryFee = 10000; // per-store delivery fee NOT provided here -> hardcoded
      const totalToPay = itemsCost - couponDiscount - pointsDiscount + deliveryFee;
      map[s.id] = { itemsCount, itemsCost, couponDiscount, pointsDiscount, deliveryFee, totalToPay };
    }
    return map;
  }, [stores]);

  const overall = useMemo(() => {
    let totalItems = 0;
    let total = 0;
    for (const s of stores) {
      totalItems += perStore[s.id]?.itemsCount || 0;
      total += perStore[s.id]?.totalToPay || 0;
    }
    return { totalItems, total };
  }, [stores, perStore]);

  /* ---------- Checkout Preview (POST /buyer/checkout/preview) ---------- */
  const previewMut = useMutation({
    mutationFn: (payload) => http.post(`${BASE_URL}/buyer/checkout/preview`, payload),
    onSuccess: (res) => {
      navigation.navigate("ShippingSummary", {
        preview: res?.data, // server totals
        stores,             // UI snapshot (items/coupons/points you had)
        payMethod,          // "wallet" | "flutterwave"
      });
    },
    onError: (err) => {
      Alert.alert("Preview Error", err?.message || "Failed to preview checkout.");
    },
  });

  // fix potential stuck loader on remount
  useEffect(() => {
    if (previewMut.reset) previewMut.reset();
  }, []);

  const proceedDisabled = !payMethod || !stores.length;

  const runPreview = () => {
    if (previewMut.isPending) return; // prevent double tap

    // one address id is required by the API (choose first selected/store or any address)
    const chosenAddressId =
      stores.find((s) => s.selectedAddressId)?.selectedAddressId ||
      stores.find((s) => s.addresses?.length)?.addresses?.[0]?.id;

    if (!chosenAddressId) {
      Alert.alert("Select Address", "Please choose a delivery address.");
      return;
    }

    const method = payMethod === "wallet" ? "wallet" : "flutterwave";
    previewMut.mutate({
      delivery_address_id: String(chosenAddressId),
      payment_method: method,
    });
  };

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
            Shipping Details
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {stores.map((store) => {
          const calc = perStore[store.id];
          const usedAddresses = store.addresses?.length ? store.addresses : [];
          // if addresses still loading, keep cards but without address radios
          return (
            <View key={store.id} style={styles.storeBlock}>
              {/* Header bar */}
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

                {/* Expand toggle */}
                <TouchableOpacity
                  onPress={() =>
                    setStores((p) =>
                      p.map((s) =>
                        s.id === store.id ? { ...s, expanded: !s.expanded } : s
                      )
                    )
                  }
                  style={styles.roundIcon}
                >
                  <Ionicons
                    name={store.expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>

                {/* Close (visual) */}
                <View style={[styles.roundIcon, { marginLeft: 6 }]}>
                  <Ionicons name="close" size={16} color="#fff" />
                </View>
              </View>

              {/* White card overlapping header */}
              <View style={styles.itemsCard}>
                {store.items.map((it, idx) => (
                  <View
                    key={it.id}
                    style={[
                      styles.itemRow,
                      idx > 0 && { borderTopWidth: 1, borderTopColor: COLOR.line },
                    ]}
                  >
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
                        <QtyBtn onPress={() => updateQty(store.id, it.id, -1)} />
                        <ThemedText style={styles.qtyVal}>
                          {updateItem.isPending ? "…" : it.qty}
                        </ThemedText>
                        <QtyBtn onPress={() => updateQty(store.id, it.id, +1)} plus />

                        <View style={{ flex: 1 }} />
                        <TouchableOpacity 
                          style={styles.iconChip}
                          onPress={() => {
                            if (it.product) {
                              navigation.navigate("CategoryNavigator", {
                                screen: "ProductDetails",
                                params: { productId: it.product.id }
                              });
                            }
                          }}
                        >
                          <Ionicons name="create-outline" size={18} color={COLOR.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconChip}
                          onPress={() => deleteItem(store.id, it.id)}
                        >
                          {deleteItemMut.isPending ? (
                            <ActivityIndicator size="small" color={COLOR.primary} />
                          ) : (
                            <Ionicons name="trash-outline" size={18} color={COLOR.primary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Expand row */}
                {!store.expanded && (
                  <TouchableOpacity
                    onPress={() =>
                      setStores((p) =>
                        p.map((s) =>
                          s.id === store.id ? { ...s, expanded: true } : s
                        )
                      )
                    }
                    style={styles.expandRow}
                  >
                    <ThemedText style={{ color: "#E53E3E" }}>Expand</ThemedText>
                  </TouchableOpacity>
                )}

                {/* Expanded details */}
                {store.expanded && (
                  <View style={styles.innerPad}>
                    {/* Coupon */}
                    <ThemedText style={styles.sectionHint}>
                      Do you have a coupon code, input here
                    </ThemedText>
                    <View style={styles.rowField}>
                      <TextInput
                        value={store.coupon}
                        onChangeText={(t) =>
                          setStores((p) =>
                            p.map((s) =>
                              s.id === store.id ? { ...s, coupon: t } : s
                            )
                          )
                        }
                        placeholder="Input coupon code"
                        placeholderTextColor={COLOR.sub}
                        style={styles.rowInput}
                      />
                      <TouchableOpacity style={styles.applyBtn}>
                        <ThemedText style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                          Apply Code
                        </ThemedText>
                      </TouchableOpacity>
                    </View>

                    {/* Points (uses wallet.loyality_points as balance display) */}
                    <View style={{ marginTop: 10 }}>
                      <View style={styles.rowField}>
                        <TextInput
                          value={store.points}
                          onChangeText={(t) =>
                            setStores((p) =>
                              p.map((s) =>
                                s.id === store.id ? { ...s, points: t.replace(/\D/g, "") } : s
                              )
                            )
                          }
                          placeholder="Add points"
                          placeholderTextColor={COLOR.sub}
                          keyboardType="number-pad"
                          style={styles.rowInput}
                        />
                        <ThemedText style={{ color: COLOR.primary, fontWeight: "700", marginLeft: 8 }}>
                          Bal : {Number(wallet.loyality_points || 0).toLocaleString()} Points
                        </ThemedText>
                      </View>
                      <View style={styles.notePill}>
                        <ThemedText style={{ color: COLOR.primary, fontSize: 12 }}>
                          Kindly note that 1 point is equivalent to ₦1
                        </ThemedText>
                      </View>
                    </View>

                    {/* Delivery Address */}
                    <View style={{ marginTop: 8 }}>
                      <View style={styles.addressHead}>
                        <ThemedText style={styles.addrHeader}>Delivery Address</ThemedText>
                        <TouchableOpacity>
                          <ThemedText style={{ color: COLOR.primary, fontWeight: "600" }}>
                            Delivery fee/Location
                          </ThemedText>
                        </TouchableOpacity>
                      </View>

                      {/* Address list comes from GET /buyer/addresses */}
                      {addrLoading && (
                        <View style={[styles.addressCard, { alignItems: "center", justifyContent: "center" }]}>
                          <ActivityIndicator color={COLOR.primary} />
                        </View>
                      )}
                      {addrError && !usedAddresses.length && (
                        <View style={styles.addressCard}>
                          <ThemedText style={{ color: COLOR.sub }}>
                            Couldn’t load addresses. They’ll stay hidden until available.
                          </ThemedText>
                        </View>
                      )}

                      {usedAddresses.map((ad) => {
                        const selected = ad.id === store.selectedAddressId;
                        return (
                          <TouchableOpacity
                            key={ad.id}
                            style={[
                              styles.addressCard,
                              selected && { borderColor: COLOR.primary },
                            ]}
                            onPress={() =>
                              setStores((p) =>
                                p.map((s) =>
                                  s.id === store.id ? { ...s, selectedAddressId: ad.id } : s
                                )
                              )
                            }
                            activeOpacity={0.8}
                          >
                            <View style={styles.radio}>
                              {selected ? <View style={styles.radioDot} /> : null}
                            </View>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={styles.addrLabel}>Phone number</ThemedText>
                              <ThemedText style={styles.addrValue}>{ad.phone}</ThemedText>
                              <ThemedText style={[styles.addrLabel, { marginTop: 6 }]}>
                                Address
                              </ThemedText>
                              <ThemedText style={styles.addrValue}>{ad.address}</ThemedText>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Breakdown (fees/discounts here are UI-calculated & HARD-CODED) */}
                    <BreakdownRow left="No it items" right={`${calc.itemsCount}`} last={false} />
                    <BreakdownRow left="Items Cost" right={currency(calc.itemsCost)} last={false} />
                    <BreakdownRow left="Coupon Discount" right={`-${currency(calc.couponDiscount)}`} last={false} />
                    <BreakdownRow left="Points Discount" right={`-${currency(calc.pointsDiscount)}`} last={false} />
                    <BreakdownRow left="Delivery fee" right={currency(calc.deliveryFee)} last={false} />
                    <BreakdownRow left="Total to pay" right={currency(calc.totalToPay)} strong last />
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Payment picker */}
        <ThemedText style={[styles.sectionHint, { marginTop: 6, marginBottom: 6 }]}>
          Select Payment Method
        </ThemedText>
        <TouchableOpacity style={styles.selectRow} onPress={() => setPayOpen(true)}>
          <ThemedText style={{ color: payMethod ? COLOR.text : COLOR.sub }}>
            {payMethod
              ? payMethod === "wallet"
                ? "Shopping Wallet"
                : "Flutterwave"
              : "Choose Payment Method"}
          </ThemedText>
          <Ionicons name="chevron-down" size={16} color={COLOR.text} />
        </TouchableOpacity>

        {/* Wallet balance inline card (only when wallet chosen) */}
        {payMethod === "wallet" && (
          <LinearGradient
            colors={["#E90F0F", "#BD0F7B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletInline}
          >
            <ThemedText style={styles.walletSmall}>Shopping Wallet Balance</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <ThemedText style={styles.walletAmount}>
                {currency(wallet.shopping_balance)}
              </ThemedText>
              <TouchableOpacity 
                style={styles.topupBtn}
                onPress={() => navigation.navigate('FlutterwaveWebView', { 
                  amount: 1000, 
                  order_id: 'topup_' + Date.now(), 
                  isTopUp: true 
                })}
              >
                <ThemedText style={{ color: COLOR.primary, fontWeight: "700" }}>Top Up</ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Two grey boxes (Total Items / Total) */}
        <View style={styles.overallBox}>
          <ThemedText style={{ color: COLOR.text }}>Total Items</ThemedText>
          <ThemedText style={{ color: COLOR.text, fontWeight: "700" }}>
            {overall.totalItems}
          </ThemedText>
        </View>
        <View style={styles.overallBox}>
          <ThemedText style={{ color: COLOR.text }}>Total</ThemedText>
          <ThemedText style={{ color: COLOR.primary, fontWeight: "800" }}>
            {currency(overall.total)}
          </ThemedText>
        </View>

        {/* Proceed */}
        <TouchableOpacity
          style={[styles.proceedBtn, (proceedDisabled || previewMut.isPending) && { opacity: 0.5 }]}
          disabled={proceedDisabled || previewMut.isPending}
          onPress={runPreview}
        >
          {previewMut.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.proceedTxt}>Proceed to Paymentss</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ===== Payment modal ===== */}
      <Modal visible={payOpen} transparent animationType="slide" onRequestClose={() => setPayOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPayOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTop}>
              <ThemedText style={styles.sheetTitle}>Payment Option</ThemedText>
              <TouchableOpacity onPress={() => setPayOpen(false)} style={styles.sheetClose}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <RadioRow
              label="Flutterwave"
              icon="logo-electron"
              selected={payMethod === "flutterwave"}
              onPress={() => { setPayMethod("flutterwave"); setPayOpen(false); }}
            />

            <RadioRow
              label="Shopping Wallet"
              icon="card-outline"
              selected={payMethod === "wallet"}
              onPress={() => { setPayMethod("wallet"); setPayOpen(false); }}
            />

            {payMethod === "wallet" && (
              <LinearGradient
                colors={["#E90F0F", "#BD0F7B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletSheetCard}
              >
                <ThemedText style={styles.walletSmall}>Shopping Wallet Balance</ThemedText>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <ThemedText style={styles.walletAmount}>{currency(wallet.shopping_balance)}</ThemedText>
                  <TouchableOpacity 
                    style={styles.topupBtn}
                    onPress={() => navigation.navigate('FlutterwaveWebView', { 
                      amount: 1000, 
                      order_id: 'topup_' + Date.now(), 
                      isTopUp: true 
                    })}
                  >
                    <ThemedText style={{ color: COLOR.primary, fontWeight: "700" }}>Top Up</ThemedText>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- tiny components ---------- */
const QtyBtn = ({ onPress, plus = false }) => (
  <TouchableOpacity onPress={onPress} style={styles.qtyBtn}>
    <Ionicons name={plus ? "add" : "remove"} size={16} color="#fff" />
  </TouchableOpacity>
);

const BreakdownRow = ({ left, right, strong = false, last = false }) => (
  <View style={[styles.breakRow, last && { marginBottom: 6 }]}>
    <ThemedText style={[styles.breakLeft, strong && { fontWeight: "700" }]}>{left}</ThemedText>
    <ThemedText style={[styles.breakRight, strong && { color: COLOR.primary, fontWeight: "800" }]}>{right}</ThemedText>
  </View>
);

const RadioRow = ({ label, selected, onPress, icon }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.radioRow}>
    <View style={styles.radioIconWrap}>
      <Ionicons name={icon} size={18} color={COLOR.primary} />
    </View>
    <ThemedText style={{ color: COLOR.text, flex: 1 }}>{label}</ThemedText>
    <View style={[styles.radioOuter, selected && { borderColor: COLOR.primary }]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  </TouchableOpacity>
);

/* ---------- styles ---------- */
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

const styles = StyleSheet.create({
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

  /* Store block */
  storeBlock: { marginBottom: 14 },
  storeHeader: {
    backgroundColor: COLOR.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: { color: "#fff", fontWeight: "700", fontSize: 15, flex: 1 },
  chatBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    height: 27,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnTxt: { color: COLOR.primary, fontWeight: "600", fontSize: 12 },
  roundIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  itemsCard: {
    marginTop: -4,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    overflow: "hidden",
    ...shadow(8),
  },

  itemRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: "center",
  },
  itemImg: { width: 116, height: 88, borderRadius: 12, marginRight: 12, backgroundColor: "#eee" },
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

  expandRow: {
    height: 30,
    borderWidth: 1,
    borderColor: "#CDCDCD",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    marginVertical: 10,
    borderRadius: 15,
    flexDirection: "row",
    gap: 6,
  },

  innerPad: { paddingHorizontal: 12, paddingBottom: 12 },

  sectionHint: { color: COLOR.sub, marginTop: 12, marginBottom: 6 },

  rowField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 52,
    marginTop: 6,
  },
  rowInput: { flex: 1, color: COLOR.text, height: "100%" },
  applyBtn: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  notePill: {
    backgroundColor: "#FFEAEA",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },

  addressHead: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addrHeader: { color: COLOR.text, fontWeight: "600" },
  addressCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  radioDot: { width: 10, height: 10, borderRadius: 6, backgroundColor: COLOR.primary },
  addrLabel: { color: COLOR.sub, fontSize: 12 },
  addrValue: { color: COLOR.text, marginTop: 2 },

  breakRow: {
    height: 48,
    backgroundColor: COLOR.chip,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakLeft: { color: COLOR.text },
  breakRight: { color: COLOR.text },

  /* Payment selector + inline wallet card */
  selectRow: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  walletInline: {
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    ...shadow(10),
  },
  walletSmall: { color: "#fff", opacity: 0.9, marginBottom: 6 },
  walletAmount: { color: "#fff", fontSize: 24, fontWeight: "800" },
  topupBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  /* grey boxes like mock */
  overallBox: {
    backgroundColor: COLOR.chip,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* Proceed CTA */
  proceedBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  proceedTxt: { color: "#fff", fontWeight: "700" },

  /* Payment bottom sheet */
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 100,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D8DCE2",
  },
  sheetTop: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
  sheetClose: { position: "absolute", right: 0, top: 6, padding: 4, borderWidth: 1.4, borderRadius: 20 },

  radioRow: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  radioIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FFF4F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 7, backgroundColor: COLOR.primary },

  walletSheetCard: {
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    ...shadow(10),
  },
});
