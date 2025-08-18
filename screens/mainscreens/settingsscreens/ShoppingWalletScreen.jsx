// screens/ShoppingWalletScreen.jsx
// screens/ShoppingWalletScreen.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import ThemedText from "../../../components/ThemedText";

/* ---------------- THEME ---------------- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  success: "#18A957",
  pending: "#E6A700",
  failed: "#E11D48",
};

/* Replace these with your local images (require('path/to.png')) */
const ICONS = {
  deposits: require("../../../assets/ArrowLineDownLeft.png"),
  withdrawals: require("../../../assets/ArrowLineUpRight.png"),
  payments: require("../../../assets/Money.png"),
};

/* --------- MOCK TX DATA --------- */
const whenText = "07/10/25 - 06:22 AM";

const DEPOSITS = [
  { id: "d1", title: "Funds Deposit", amount: 20000, status: "successful", when: whenText },
  { id: "d2", title: "Funds Deposit", amount: 20000, status: "pending", when: whenText },
  { id: "d3", title: "Funds Deposit", amount: 20000, status: "failed", when: whenText },
  { id: "d4", title: "Funds Deposit", amount: 20000, status: "successful", when: whenText },
  { id: "d5", title: "Funds Deposit", amount: 20000, status: "successful", when: whenText },
  { id: "d6", title: "Funds Deposit", amount: 20000, status: "successful", when: whenText },
];

const WITHDRAWALS = [
  { id: "w1", title: "Funds Withdrawal", amount: 20000, status: "successful", when: whenText },
  { id: "w2", title: "Funds Withdrawal", amount: 20000, status: "successful", when: whenText },
  { id: "w3", title: "Funds Withdrawal", amount: 20000, status: "successful", when: whenText },
  { id: "w4", title: "Funds Withdrawal", amount: 20000, status: "successful", when: whenText },
  { id: "w5", title: "Funds Withdrawal", amount: 20000, status: "successful", when: whenText },
];

const PAYMENTS = [
  { id: "p1", title: "Order Payment - Wallet", amount: 20000, status: "successful", when: whenText },
  { id: "p2", title: "Order Payment - Flutterwave", amount: 20000, status: "successful", when: whenText },
  { id: "p3", title: "Order Payment", amount: 20000, status: "successful", when: whenText },
  { id: "p4", title: "Order Payment", amount: 20000, status: "successful", when: whenText },
  { id: "p5", title: "Order Payment", amount: 20000, status: "successful", when: whenText },
];

/* -------- Small helpers -------- */
const StatusLabel = ({ status }) => {
  const map = {
    successful: { text: "Successful", color: COLOR.success },
    pending: { text: "Pending", color: COLOR.pending },
    failed: { text: "Failed", color: COLOR.failed },
  };
  const it = map[status] || map.successful;
  return <ThemedText style={{ color: it.color, marginTop: 6 }}>{it.text}</ThemedText>;
};

const Amount = ({ value, color = COLOR.success }) => (
  <ThemedText style={{ color, fontWeight: "800" }}>{`₦${value.toLocaleString()}`}</ThemedText>
);

const TxIcon = ({ type }) => (
  <View style={styles.leadingIcon}>
    <Image source={ICONS[type]} style={styles.leadingImg} />
  </View>
);

const RowCard = ({ item, tab }) => {
  const amountColor =
    item.status === "failed" ? COLOR.failed : item.status === "pending" ? COLOR.pending : COLOR.success;

  return (
    <View style={styles.rowCard}>
      <TxIcon type={tab} />

      <View style={{ flex: 1 }}>
        <ThemedText style={{ color: COLOR.text, fontWeight: "700" }}>{item.title}</ThemedText>
        <StatusLabel status={item.status} />
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Amount value={item.amount} color={amountColor} />
        <ThemedText style={styles.when}>{item.when}</ThemedText>
      </View>
    </View>
  );
};

/* ================== Screen ================== */
export default function ShoppingWalletScreen() {
  const navigation = useNavigation();

  const [tab, setTab] = useState("deposits");
  const [filter, setFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Withdraw full-screen modal
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wAccNumber, setWAccNumber] = useState("");
  const [wBankName, setWBankName] = useState("");
  const [wAccName, setWAccName] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

  const data = useMemo(() => {
    const base = tab === "deposits" ? DEPOSITS : tab === "withdrawals" ? WITHDRAWALS : PAYMENTS;
    if (filter === "all") return base;
    return base.filter((r) => r.status === filter);
  }, [tab, filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home"))}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Shopping Wallet
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponentStyle={{ zIndex: 20, elevation: 20 }}  // keep dropdown above rows
        ListHeaderComponent={
          <View style={{ zIndex: 20, elevation: 20 }}>
            {/* Balance Card */}
            <LinearGradient
              colors={["#E90F0F", "#BD0F7B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <ThemedText style={styles.balanceLabel}>Shopping Wallet</ThemedText>
              <ThemedText style={styles.balanceValue}>N35,000</ThemedText>

              <View style={styles.balanceBtnRow}>
                <TouchableOpacity style={[styles.balanceBtn, { marginRight: 16 }]}>
                  <ThemedText style={styles.balanceBtnTxt}>Deposit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.balanceBtn} onPress={() => setWithdrawVisible(true)}>
                  <ThemedText style={styles.balanceBtnTxt}>Withdraw</ThemedText>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Transaction header + filter */}
            <View style={styles.txHeaderRow}>
              <ThemedText style={styles.txHeader}>Transaction History</ThemedText>

              <View style={styles.filterWrap}>
                <TouchableOpacity
                  onPress={() => setFilterOpen((p) => !p)}
                  style={styles.filterBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="filter-outline" size={18} color={COLOR.text} />
                </TouchableOpacity>

                {filterOpen && (
                  <View style={styles.popover}>
                    {[
                      { key: "all", label: "All" },
                      { key: "successful", label: "Successful" },
                      { key: "pending", label: "Pending" },
                      { key: "failed", label: "Failed" },
                    ].map((opt, idx) => (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.popItem, idx === 3 && { borderBottomWidth: 0 }]}
                        onPress={() => {
                          setFilter(opt.key);
                          setFilterOpen(false);
                        }}
                      >
                        <ThemedText style={{ color: COLOR.text }}>{opt.label}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Segmented tabs */}
            <View style={styles.tabsWrap}>
              <TabBtn label="Deposits" active={tab === "deposits"} onPress={() => setTab("deposits")} />
              <TabBtn label="Withdrawals" active={tab === "withdrawals"} onPress={() => setTab("withdrawals")} />
              <TabBtn label="Payments" active={tab === "payments"} onPress={() => setTab("payments")} />
            </View>
          </View>
        }
        renderItem={({ item }) => <RowCard item={item} tab={tab} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* ===== Withdraw Full-Screen Modal ===== */}
      <Modal visible={withdrawVisible} animationType="slide" onRequestClose={() => setWithdrawVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* top bar */}
          <View style={styles.withdrawHeader}>
            <TouchableOpacity
              onPress={() => setWithdrawVisible(false)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <ThemedText style={styles.withdrawTitle} pointerEvents="none">
              Withdraw
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>

          {/* form */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <View style={{ padding: 16, backgroundColor: "#F7F8FC", flex: 1 }}>
              <Input placeholder="Amount to withdraw" keyboardType="numeric" value={wAmount} onChangeText={setWAmount} />
              <Input placeholder="Account Number" keyboardType="number-pad" value={wAccNumber} onChangeText={setWAccNumber} />
              <Input placeholder="Bank Name" value={wBankName} onChangeText={setWBankName} />
              <Input placeholder="Account Name" value={wAccName} onChangeText={setWAccName} />

              <TouchableOpacity style={styles.saveRow} onPress={() => setSaveDetails((p) => !p)}>
                <View style={[styles.checkbox, saveDetails && styles.checkboxChecked]}>
                  {saveDetails ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </View>
                <ThemedText style={{ color: COLOR.text }}>Save account details</ThemedText>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.withdrawBtn} onPress={() => setWithdrawVisible(false)}>
                <ThemedText style={styles.withdrawBtnTxt}>Process Withdrawal</ThemedText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* --------- tiny components --------- */
const TabBtn = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}>
    <ThemedText style={[styles.tabTxt, active ? styles.tabTxtActive : styles.tabTxtInactive]}>{label}</ThemedText>
  </TouchableOpacity>
);


const Input = (props) => <TextInput {...props} placeholderTextColor={COLOR.sub} style={styles.input} />;

/* ---------------- STYLES ---------------- */
function shadow(e = 6) {
  return Platform.select({
    android: { elevation: e },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.06,
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
  },

  /* Gradient balance card */
  gradientCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    ...shadow(6),
  },
  balanceLabel: { color: "#fff", opacity: 0.9, fontSize: 12, marginBottom: 18 },
  balanceValue: { color: "#fff", fontSize: 38, fontWeight: "700", marginBottom: 20 },
  balanceBtnRow: { flexDirection: "row", marginBottom:10 },
  balanceBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceBtnTxt: { color: COLOR.text, fontWeight: "400", fontSize:11 },

  /* Transaction header */
  txHeaderRow: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txHeader: { color: COLOR.text, fontWeight: "400" },

  /* Filter + popover (fixed stacking) */
  filterWrap: { position: "relative", zIndex: 50 }, // own stacking context
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  popover: {
    position: "absolute",
    top: 42,
    right: 0,
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    ...shadow(16),
    zIndex: 100,          // iOS
    elevation: 24,        // Android
    overflow: "hidden",
  },
  popItem: {
    height: 44,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },

  /* Tabs */
  tabsWrap: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 10 },
  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontWeight: "600" },
  tabTxtActive: { color: "#fff" },
  tabTxtInactive: { color: COLOR.text },

  /* Row card */
  rowCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  leadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#EAEAEA",
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  leadingImg: { width: 22, height: 22, resizeMode: "contain" },

  when: { color: COLOR.sub, fontSize: 12, marginTop: 6 },

  /* Withdraw full-screen modal */
  withdrawHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 25,
  },
  withdrawTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
  },
  input: {
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: COLOR.text,
    marginBottom: 12,
  },
  saveRow: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 24, gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: COLOR.primary, borderColor: COLOR.primary },
  withdrawBtn: {
    height: 52,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawBtnTxt: { color: "#fff", fontWeight: "600" },
});
