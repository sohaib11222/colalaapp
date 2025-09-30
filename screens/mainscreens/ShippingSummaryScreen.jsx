import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../components/ThemedText";
import { useAddresses, useWalletBalance, useCheckoutPlace } from "../../config/api.config";

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

// Images are NOT in API → keep hardcoded
const IMG = require("../../assets/Frame 314.png");
const currency = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function ShippingSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Expect from Shipping Details: { preview, stores, payMethod }
  const preview = route?.params?.preview || null;
  const storesParam = Array.isArray(route?.params?.stores) ? route.params.stores : [];
  const paymentMethodParam = route?.params?.payMethod || "Shopping Wallet";

  // Fetch balance (for "Bal : ... Points")
  const { data: walletData } = useWalletBalance();
  const pointsBal = Number(walletData?.data?.loyality_points ?? 0);

  // Fetch addresses and pick the one matching preview.address_id
  const { data: addrData } = useAddresses();
  const addresses = Array.isArray(addrData?.data) ? addrData.data : [];
  const selectedAddress =
    addresses.find((a) => String(a.id) === String(preview?.address_id)) || null;

  // Local inputs just to reflect the UI (coupon/points fields only for display)
  const [inputs, setInputs] = useState(() =>
    Object.fromEntries(
      (storesParam || []).map((s) => [
        s.id,
        { coupon: "", points: "" },
      ])
    )
  );
  const setField = (sid, key, val) =>
    setInputs((p) => ({ ...p, [sid]: { ...(p[sid] || {}), [key]: val } }));

  // === Totals: force Delivery fee = ₦10,000 per store (as in Shipping Details) ===
  const perStore = useMemo(() => {
    const map = {};
    for (const s of storesParam) {
      const itemsCount = s.items.reduce((a, b) => a + (b.qty || 0), 0);
      const itemsCost = s.items.reduce((a, b) => a + Number(b.price || 0) * (b.qty || 0), 0);
      const deliveryFee = 10000; // hardcoded
      const totalToPay = itemsCost + deliveryFee;
      map[s.id] = { itemsCount, itemsCost, deliveryFee, totalToPay };
    }
    return map;
  }, [storesParam]);

  const overall = useMemo(() => {
    let totalItems = 0;
    let grandTotal = 0;
    for (const s of storesParam) {
      totalItems += perStore[s.id]?.itemsCount || 0;
      grandTotal += perStore[s.id]?.totalToPay || 0;
    }
    return { totalItems, grandTotal };
  }, [storesParam, perStore]);

  // === Place Order ===
  const placeOrderMut = useCheckoutPlace({
    onSuccess: (res) => {
      // Try to extract an order identifier from your API’s response
      const orderId =
        res?.data?.order_id ??
        res?.data?.id ??
        res?.data?.order?.id ??
        res?.data?.order_no ?? // fallback if your API returns only order_no
        null;

      // If flutterwave → open WebView instead of showing modal
      if (String(preview?.payment_method).toLowerCase() === "flutterwave") {
        if (!orderId) {
          Alert.alert("Order Error", "Order placed, but no order_id returned.");
          return;
        }
        navigation.navigate("FlutterwaveWebView", {
          order_id: String(orderId),
          amount: Number(overall.grandTotal) || 0,
        });
        return;
      }

      // Default (wallet / others) — unchanged
      const orderNo = res?.data?.order_no || "Order Placed";
      Alert.alert("Success", `Order placed successfully.\n${orderNo}`, [
        { text: "OK", onPress: () => navigation.navigate("MainNavigator") },
      ]);
    },
    onError: (err) => {
      Alert.alert("Order Error", err?.message || "Failed to place order.");
    },
  });

  const proceed = () => {
    if (!preview?.address_id || !preview?.payment_method) {
      Alert.alert("Missing info", "Preview not found. Please go back and try again.");
      return;
    }
    if (placeOrderMut.isPending) return;

    placeOrderMut.mutate({
      delivery_address_id: String(preview.address_id),
      payment_method: preview.payment_method, // "flutterwave" | "wallet"
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
            Shipping Summary
          </ThemedText>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 12, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {storesParam.map((store) => (
          <View key={store.id} style={{ marginBottom: 14 }}>
            {/* Red header */}
            <View style={styles.storeHeader}>
              <ThemedText style={styles.storeName}>{store.name || `Store ${store.id}`}</ThemedText>

              <TouchableOpacity style={styles.chatBtn}>
                <ThemedText style={styles.chatBtnTxt}>Start Chat</ThemedText>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 8, marginLeft: 8 }}>
                <CircleIcon name="chevron-down" />
                <CircleIcon name="close" />
              </View>
            </View>

            {/* White summary card (over header) */}
            <View style={styles.summaryCard}>
              {/* Items list (compact) — show SAME products as Shipping Details */}
              {store.items.map((it, idx) => (
                <View
                  key={it.id}
                  style={[
                    styles.compactRow,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: COLOR.line },
                  ]}
                >
                  <Image source={IMG} style={styles.compactImg} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.compactTitle} numberOfLines={2}>
                      {it.title}
                    </ThemedText>
                    <ThemedText style={styles.price}>{currency(it.price)}</ThemedText>
                    <ThemedText style={styles.qtyMini}>Qty : {it.qty}</ThemedText>
                  </View>
                </View>
              ))}

              {/* Coupon input (visual only) */}
              <View style={{ marginTop: 12 }}>
                <ThemedText style={styles.smallLabel}>
                  Do you have a coupon code, input here
                </ThemedText>
                <View style={styles.rowInput}>
                  <TextInput
                    placeholder="Input coupon code"
                    placeholderTextColor={COLOR.sub}
                    value={inputs[store.id]?.coupon}
                    onChangeText={(t) => setField(store.id, "coupon", t)}
                    style={{ flex: 1, color: COLOR.text }}
                  />
                  <TouchableOpacity style={styles.applyBtn}>
                    <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Apply Code</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Points (balance from API; input is visual only) */}
              <View style={{ marginTop: 12 }}>
                <View style={styles.pointsHeader}>
                  <ThemedText style={styles.smallLabel}>Discount Points</ThemedText>
                  <ThemedText style={[styles.smallLabel, { color: COLOR.primary }]}>
                    Bal : {pointsBal} Points
                  </ThemedText>
                </View>
                <View style={styles.rowInput}>
                  <TextInput
                    placeholder="Add points"
                    placeholderTextColor={COLOR.sub}
                    value={inputs[store.id]?.points}
                    onChangeText={(t) => setField(store.id, "points", t)}
                    keyboardType="number-pad"
                    style={{ flex: 1, color: COLOR.text }}
                  />
                </View>
                <View style={styles.noticeBadge}>
                  <ThemedText style={{ color: COLOR.primary, fontSize: 12 }}>
                    Kindly not that 1 point is equivalent to ₦1
                  </ThemedText>
                </View>
              </View>

              {/* Delivery address (from addresses API + preview.address_id) */}
              <View style={{ marginTop: 12 }}>
                <View style={styles.pointsHeader}>
                  <ThemedText style={styles.smallLabel}>Delivery Address</ThemedText>
                  <ThemedText style={[styles.smallLabel, { color: COLOR.primary }]}>
                    Delivery fee/Location
                  </ThemedText>
                </View>

                {/* Selected address card */}
                <View style={[styles.addrCard, { borderColor: COLOR.primary }]}>
                  <View style={styles.radioDot} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <ThemedText style={styles.addrLabel}>Phone number</ThemedText>
                    <ThemedText style={styles.addrValue}>
                      {selectedAddress?.phone || selectedAddress?.phone_number || "—"}
                    </ThemedText>

                    <ThemedText style={[styles.addrLabel, { marginTop: 6 }]}>Address</ThemedText>
                    <ThemedText style={styles.addrValue}>
                      {selectedAddress?.address ||
                        selectedAddress?.line ||
                        selectedAddress?.street ||
                        "—"}
                    </ThemedText>
                  </View>
                </View>

                {/* Unselected demo card (kept to preserve layout) */}
                <View style={styles.addrCard}>
                  <View style={[styles.radioDot, { backgroundColor: "transparent", borderWidth: 1 }]} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <ThemedText style={styles.addrLabel}>Phone number</ThemedText>
                    <ThemedText style={styles.addrValue}>0703123456789</ThemedText>
                    <ThemedText style={[styles.addrLabel, { marginTop: 6 }]}>Address</ThemedText>
                    <ThemedText style={styles.addrValue}>
                      No 7 , abcd street , ikeja , Lagos
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Cost breakdown */}
              <LinedRow left="No it items" right={String(perStore[store.id]?.itemsCount || 0)} boldRight boxed first />
              <LinedRow left="Items Cost" right={currency(perStore[store.id]?.itemsCost || 0)} boxed />
              <LinedRow left="Coupon Discount" right={`-${currency(0).slice(1)}`} boxed />
              <LinedRow left="Points Discount" right={`-${currency(0).slice(1)}`} boxed />
              <LinedRow left="Delivery fee" right={currency(perStore[store.id]?.deliveryFee || 0)} boxed />
              <LinedRow
                left="Total to pay"
                right={currency(perStore[store.id]?.totalToPay || 0)}
                boxed
                last
                strong
                red
              />
            </View>
          </View>
        ))}

        {/* Footer Summary */}
        <FooterRow label="Total Items" value={String(overall.totalItems)} first />
        <FooterRow
          label="Payment method"
          value={
            preview?.payment_method === "wallet"
              ? "Shopping Wallet"
              : preview?.payment_method === "flutterwave"
              ? "Flutterwave"
              : paymentMethodParam
          }
        />
        <FooterRow label="Total" value={currency(overall.grandTotal)} last red strong />

        {/* Proceed (places order) */}
        <TouchableOpacity
          style={[styles.proceedBtn, placeOrderMut.isPending && { opacity: 0.6 }]}
          onPress={proceed}
          disabled={placeOrderMut.isPending}
        >
          {placeOrderMut.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.proceedTxt}>Proceed to payment</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- tiny components ---------- */
const CircleIcon = ({ name }) => (
  <View style={styles.circleIcon}>
    <Ionicons name={name} size={16} color="#fff" />
  </View>
);

const LinedRow = ({ left, right, boxed, first, last, boldRight, strong, red }) => (
  <View
    style={[
      styles.lineRow,
      boxed && styles.boxedRow,
      first && { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
      last && { borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 4 },
    ]}
  >
    <ThemedText style={[styles.lineLeft, strong && { fontWeight: "600" }]}>{left}</ThemedText>
    <ThemedText
      style={[
        styles.lineRight,
        boldRight && { fontWeight: "700" },
        red && { color: COLOR.primary, fontWeight: "800" },
        strong && { fontWeight: "700" },
      ]}
    >
      {right}
    </ThemedText>
  </View>
);

const FooterRow = ({ label, value, first, last, red, strong }) => (
  <View
    style={[
      styles.footerRow,
      first && { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
      last && { borderBottomLeftRadius: 14, borderBottomRightRadius: 14, marginBottom: 8 },
    ]}
  >
    <ThemedText style={{ color: COLOR.text }}>{label}</ThemedText>
    <ThemedText
      style={[
        { color: COLOR.text, fontWeight: "700" },
        red && { color: COLOR.primary, fontWeight: "800" },
        strong && { fontWeight: "800" },
      ]}
    >
      {value}
    </ThemedText>
  </View>
);

/* -------------------- Styles -------------------- */
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

  /* Store header & card */
  storeHeader: {
    backgroundColor: COLOR.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: { color: "#fff", fontWeight: "700", fontSize: 15, flex: 1 },
  chatBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: 27,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnTxt: { color: COLOR.primary, fontWeight: "600", fontSize: 12 },
  circleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E53E3E",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 1.3,
    justifyContent: "center",
  },

  summaryCard: {
    marginTop: -4,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 10,
    ...shadow(8),
  },

  compactRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  compactImg: { width: 96, height: 72, borderRadius: 10, marginRight: 10 },
  compactTitle: { color: COLOR.text, fontWeight: "600" },
  price: { color: COLOR.primary, fontWeight: "800", marginTop: 4 },
  qtyMini: { color: COLOR.primary, marginTop: 4, fontSize: 12, fontWeight: "600" },

  smallLabel: { color: COLOR.sub, marginBottom: 6 },
  rowInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  applyBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noticeBadge: {
    marginTop: 6,
    backgroundColor: "#FFE3E3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "stretch",
  },

  addrCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 8,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: COLOR.primary,
    marginTop: 4,
  },
  addrLabel: { color: COLOR.sub, fontSize: 12 },
  addrValue: { color: COLOR.text, marginTop: 2 },

  // boxed line rows
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  boxedRow: {
    backgroundColor: COLOR.chip,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginTop: 10,
  },
  lineLeft: { color: COLOR.text },
  lineRight: { color: COLOR.text },

  // footer summary rows
  footerRow: {
    backgroundColor: COLOR.chip,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 14,
    height: 54,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  proceedBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  proceedTxt: { color: "#fff", fontWeight: "700" },
});
