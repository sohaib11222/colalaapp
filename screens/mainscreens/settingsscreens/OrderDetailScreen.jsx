// screens/orders/SingleOrderDetailsScreen.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";

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
const currency = (n) => `₦${Number(n).toLocaleString()}`;
const productImg = require("../../../assets/Frame 314.png");

/* ---------- LOCAL DATA SOURCE ----------
   We give each store a status:
   0 = Order placed | 1 = Out for delivery | 2 = Delivered | 3 = Completed
------------------------------------------------ */
const ORDERS_DETAIL = [
  {
    id: "Ord-1wcjcnefmvk",
    stores: [
      {
        id: "sasha",
        name: "Sasha Stores",
        status: 1, // Out for delivery
        items: [
          { id: "i1", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
          { id: "i2", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
        ],
      },
      {
        id: "vee",
        name: "Vee Stores",
        status: 2, // Delivered
        items: [
          { id: "i3", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
          { id: "i4", title: "Iphone 16 pro max - Black", price: 2_500_000, qty: 1 },
        ],
      },
    ],
  },
];

/* ---------- helpers ---------- */
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

const InfoRow = ({ left, right, strongRight, topBorder }) => (
  <View
    style={[
      styles.infoRow,
      topBorder && { borderTopWidth: 1, borderTopColor: COLOR.line, marginTop: 8, paddingTop: 8 },
    ]}
  >
    <ThemedText style={{ color: COLOR.text }}>{left}</ThemedText>
    <ThemedText style={[{ color: COLOR.text }, strongRight && { color: COLOR.primary, fontWeight: "800" }]}>
      {right}
    </ThemedText>
  </View>
);

/* ---------- Track Order full-screen modal ---------- */
function TrackOrderModal({ visible, onClose, storeName = "Sasha Store", status = 0 }) {
  // status: 0 = Order placed, 1 = Out for delivery, 2 = Delivered (cap at 2)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const code = "1415";

  const Step = ({ index, title, showWarning, showActions }) => {
    const filled = index <= status;
    return (
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        {/* timeline column */}
        <View style={{ width: 46, alignItems: "center" }}>
          <View
            style={[
              styles.dot,
              filled
                ? { backgroundColor: COLOR.primary, borderColor: COLOR.primary }
                : { backgroundColor: "#fff", borderColor: COLOR.primary },
            ]}
          >
            <ThemedText style={{ color: filled ? "#fff" : COLOR.primary, fontWeight: "700" }}>
              {index + 1}
            </ThemedText>
          </View>
          {index < 2 && <View style={[styles.vLine, { backgroundColor: COLOR.primary }]} />}
        </View>

        {/* card */}
        <View style={styles.stepCard}>
          <View style={{ flexDirection: "row" }}>
            <Image source={productImg} style={styles.stepImg} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <ThemedText style={styles.stepTitle}>{title}</ThemedText>
              <ThemedText style={styles.stepSub}>Iphone 16 pro max + iphone i6 pro max…</ThemedText>
              <ThemedText style={styles.stepPrice}>{currency(2_500_000)}</ThemedText>
              <ThemedText style={styles.stepTime}>5th Aug 2025 - 07:22 AM</ThemedText>
            </View>
          </View>

          {showWarning && (
            <View style={styles.warnRow}>
              <Ionicons name="warning-outline" size={18} color={COLOR.primary} />
              <ThemedText style={{ color: COLOR.primary, marginLeft: 8 }}>
                Do not provide your code until you have received the product
              </ThemedText>
            </View>
          )}

          {showActions && (
            <>
              <TouchableOpacity style={styles.revealBtn} onPress={() => setConfirmOpen(true)}>
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Reveal Code</ThemedText>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
                  <ThemedText style={{ color: COLOR.text }}>Return</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
                  <ThemedText style={{ color: COLOR.text }}>Dispute</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
        {/* header */}
        <View style={styles.header}>
          <View className="row" style={styles.headerRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} pointerEvents="none">
              {`Order Tracker - ${storeName}`}
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        {/* top buttons */}
        <View style={{ paddingHorizontal: 16, flexDirection: "row", gap: 12, marginTop: 10 }}>
          <TouchableOpacity
            style={[
              styles.pillBtn,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line },
            ]}
          >
            <ThemedText style={{ color: COLOR.text }}>Full Details</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillBtn, { backgroundColor: COLOR.primary }]}>
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Open Chat</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          <Step index={0} title="Order Placed" />
          <Step index={1} title="Out for Delivery" />
          {status >= 2 && <Step index={2} title="Delivered" showWarning showActions />}
        </ScrollView>

        {/* Confirm reveal modal */}
        <Modal
          visible={confirmOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmOpen(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={styles.alertCard}>
              <Ionicons
                name="warning-outline"
                size={46}
                color={COLOR.primary}
                style={{ alignSelf: "center", marginBottom: 8 }}
              />
              <ThemedText style={{ color: COLOR.text, textAlign: "center", marginBottom: 18 }}>
                Do you confirm that your product has been delivered
              </ThemedText>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => setConfirmOpen(false)}
                >
                  <ThemedText style={{ color: COLOR.text }}>Go Back</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.solidBtn, { flex: 1 }]}
                  onPress={() => {
                    setConfirmOpen(false);
                    setCodeOpen(true);
                  }}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Reveal Code</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Code modal */}
        <Modal
          visible={codeOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCodeOpen(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={styles.alertCard}>
              <ThemedText style={{ color: COLOR.sub, textAlign: "center" }}>
                Dear customer your code is
              </ThemedText>
              <ThemedText
                style={{
                  color: COLOR.text,
                  fontSize: 48,
                  fontWeight: "800",
                  textAlign: "center",
                  marginVertical: 10,
                }}
              >
                {code}
              </ThemedText>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.ghostBtn, { flex: 1 }]}
                  onPress={() => setCodeOpen(false)}
                >
                  <ThemedText style={{ color: COLOR.text }}>Go Back</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.solidBtn, { flex: 1 }]}
                  onPress={async () => {
                    await Clipboard.setStringAsync(code);
                    setCodeOpen(false);
                  }}
                >
                  <ThemedText style={{ color: "#fff", fontWeight: "600" }}>Copy Code</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

/* ---------- Store block on the Single Order page ---------- */
function StoreBlock({ store, orderId, onTrack, showSingleItem = false }) {
  const [expanded, setExpanded] = useState(false);

  const items = showSingleItem ? store.items.slice(0, 1) : store.items;

  const itemsCount = items.reduce((a, b) => a + b.qty, 0);
  const itemsCost = items.reduce((a, b) => a + b.price * b.qty, 0);
  const coupon = 5_000;
  const points = 10_000;
  const fee = 10_000;
  const totalPay = itemsCost - coupon - points + fee;

  return (
    <View style={styles.section}>
      {/* Red header */}
      <View style={styles.storeHeader}>
        <ThemedText style={styles.storeName}>{store.name}</ThemedText>

        <TouchableOpacity style={styles.chatBtn} activeOpacity={0.9}>
          <ThemedText style={styles.chatBtnTxt}>Start Chat</ThemedText>
        </TouchableOpacity>

        {/* round icons */}
        <TouchableOpacity style={styles.roundIcon} activeOpacity={0.8}>
          <Ionicons name="chevron-down" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIcon} activeOpacity={0.8}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* White card over header */}
      <View style={styles.itemsCard}>
        {items.map((it, idx) => (
          <View
            key={it.id}
            style={[styles.itemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: COLOR.line }]}
          >
            <Image source={productImg} style={styles.itemImg} />
            <View style={{ flex: 1, paddingRight: 8 }}>
              <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {it.title}
              </ThemedText>
              <ThemedText style={styles.price}>{currency(it.price)}</ThemedText>
              <ThemedText style={styles.qtyTxt}>{`Qty : ${it.qty}`}</ThemedText>
            </View>

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => onTrack(store.name, Math.min(store.status ?? 0, 2))}
            >
              <ThemedText style={styles.trackTxt}>Track Order</ThemedText>
            </TouchableOpacity>
          </View>
        ))}

        {/* Open Chat row ALWAYS shown above Expand */}
        <TouchableOpacity activeOpacity={0.85} style={styles.openChatRow}>
          <ThemedText style={{ color: COLOR.text, opacity: 0.9 }}>Open Chat</ThemedText>
        </TouchableOpacity>

        {/* Expanded details */}
        {expanded && (
          <>
            <ThemedText style={styles.sectionTitle}>Delivery Address</ThemedText>
            <View style={styles.addressCard}>
              <View style={styles.addrRow}>
                <ThemedText style={styles.addrLabel}>Name</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>Adewale Faizah</ThemedText>
                  <Ionicons name="copy-outline" size={14} color={COLOR.sub} />
                </View>
              </View>
              <View style={[styles.addrRow, { marginTop: 8 }]}>
                <ThemedText style={styles.addrLabel}>Phone number</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>0703123456789</ThemedText>
                  <Ionicons name="copy-outline" size={14} color={COLOR.sub} />
                </View>
              </View>
              <View style={[styles.addrRow, { marginTop: 8, alignItems: "flex-start" }]}>
                <ThemedText style={styles.addrLabel}>Address</ThemedText>
                <View style={styles.addrRight}>
                  <ThemedText style={styles.addrValue}>No 7 , abcd street , ikeja , Lagos</ThemedText>
                  <Ionicons name="location-outline" size={14} color={COLOR.sub} />
                </View>
              </View>
            </View>

            <View style={styles.summaryWrap}>
              <InfoRow left="Ord id" right={orderId || "—"} />
              <InfoRow left="No it items" right={String(itemsCount)} topBorder />
              <InfoRow left="Items Cost" right={currency(itemsCost)} topBorder />
              <InfoRow left="Coupon Discount" right={`-${currency(coupon)}`} topBorder />
              <InfoRow left="Points Discount" right={`-${currency(points)}`} topBorder />
              <InfoRow left="Delivery fee" right={currency(fee)} topBorder />
              <InfoRow left="Total to pay" right={currency(totalPay)} strongRight topBorder />
            </View>
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setExpanded((v) => !v)}
          style={styles.expandBtn}
        >
          <ThemedText style={{ color: "#E53E3E" }}>{expanded ? "Collapse" : "Expand"}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Screen ---------- */
export default function SingleOrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const selectedId = route.params?.orderId;
  const order = useMemo(() => {
    if (!selectedId) return ORDERS_DETAIL[0];
    return ORDERS_DETAIL.find((o) => o.id === selectedId) ?? ORDERS_DETAIL[0];
  }, [selectedId]);

  // Top status tabs (labels exactly like your mock)
  const STATUS = ["Order placed", "Out for delivery", "Delivered", "Completed"];
  const [statusIdx, setStatusIdx] = useState(0);

  // Track modal
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackStoreName, setTrackStoreName] = useState("");
  const [trackStatus, setTrackStatus] = useState(0);

  // Which stores to show for selected tab
  const visibleStores = useMemo(() => {
    // Show ALL stores for "Order placed" (0) and "Completed" (3)
    if (statusIdx === 0 || statusIdx === 3) return order.stores;
    // Otherwise filter by the selected status
    return order.stores.filter((s) => (s.status ?? 0) === statusIdx);
  }, [order, statusIdx]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Order Details
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {STATUS.map((label, i) => {
          const active = i === statusIdx;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}
              onPress={() => setStatusIdx(i)}
              activeOpacity={0.9}
            >
              <ThemedText style={[styles.tabTxt, active ? { color: "#fff" } : { color: COLOR.text }]}>
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {visibleStores.map((s) => (
          <StoreBlock
            key={s.id}
            store={s}
            orderId={order.id}
            showSingleItem={statusIdx === 2} // delivered view shows a single item like your mock
            onTrack={(storeName, stat) => {
              setTrackStoreName(storeName);
              setTrackStatus(stat);
              setTrackOpen(true);
            }}
          />
        ))}
      </ScrollView>

      {/* Track Order modal */}
      <TrackOrderModal
        visible={trackOpen}
        onClose={() => setTrackOpen(false)}
        storeName={trackStoreName}
        status={Math.min(trackStatus, 2)}
      />
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  /* header */
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    zIndex:5
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

  /* tabs */
  tabsWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: "row",
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: "#ECEFF3", borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontSize: 11, fontWeight: "400" },

  /* store section */
  section: { marginBottom: 16 },

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
    paddingHorizontal: 12,
    height: 27,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  chatBtnTxt: { color: COLOR.primary, fontWeight: "600", fontSize: 12 },
  roundIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E53E3E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    borderWidth: 1.3,
    borderColor: "#fff",
  },

  // white card over header
  itemsCard: {
    marginTop: -4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    overflow: "hidden",
    ...shadow(10),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemImg: { width: 120, height: 90, borderRadius: 10, marginRight: 12 },
  itemTitle: { color: COLOR.text, fontWeight: "600" },
  price: { color: COLOR.primary, fontWeight: "800", marginTop: 6 },
  qtyTxt: { marginTop: 6, color: COLOR.sub },

  trackBtn: {
    backgroundColor: COLOR.primary,
    borderRadius: 15,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  trackTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },

  openChatRow: {
    height: 50,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    backgroundColor: COLOR.chip,
    marginTop: 10,
    marginBottom: 8,
  },

  sectionTitle: {
    color: COLOR.sub,
    marginTop: 6,
    marginLeft: 12,
    marginBottom: 6,
  },
  addressCard: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
  },
  addrRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addrLabel: { color: COLOR.sub, fontSize: 12 },
  addrRight: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "70%" },
  addrValue: { color: COLOR.text, flexShrink: 1 },

  summaryWrap: {
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  infoRow: {
    height: 44,
    borderRadius: 10,
    backgroundColor: COLOR.chip,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  expandBtn: {
    height: 35,
    // margin: 12,
    marginHorizontal:10,
    marginBottom: 12,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: "#E53E3E",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Track modal styles */
  pillBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  vLine: { width: 2, flex: 1, marginTop: 4 },
  stepCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    ...shadow(6),
  },
  stepImg: { width: 110, height: 82, borderRadius: 10 },
  stepTitle: { color: COLOR.primary, fontWeight: "800", fontSize: 18, marginBottom: 2 },
  stepSub: { color: COLOR.text, opacity: 0.85 },
  stepPrice: { color: COLOR.primary, fontWeight: "800", marginTop: 6 },
  stepTime: { color: COLOR.sub, alignSelf: "flex-end", marginTop: 4, fontSize: 11 },

  warnRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#FFEDEE",
    borderWidth: 1,
    borderColor: "#FFD2D5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  revealBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  ghostBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  solidBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  centerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  alertCard: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    ...shadow(12),
  },
});
