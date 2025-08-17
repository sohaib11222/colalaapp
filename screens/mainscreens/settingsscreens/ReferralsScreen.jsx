// screens/ReferralsScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";

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

export default function ReferralsScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState("wallet"); // 'wallet' | 'faqs' | 'search'
  const [code] = useState("QERDEQWE");
  const [copied, setCopied] = useState(false);

  // Transfer modal
  const [transferVisible, setTransferVisible] = useState(false);
  const [amount, setAmount] = useState("");

  // Withdraw full-screen modal
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wAccNumber, setWAccNumber] = useState("");
  const [wBankName, setWBankName] = useState("");
  const [wAccName, setWAccName] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

  // Commission filter sheet
  const [commissionVisible, setCommissionVisible] = useState(false);
  const [commissionSel, setCommissionSel] = useState("all");

  const copy = async (val = code) => {
    try {
      await Clipboard.setStringAsync(val);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const steps = [
    "Invite a friend with your referral code for them to get a one time referral bonus",
    "Referral completes an order.",
    "Get commissions on their orders",
  ];

  /* ----- FAQs data ----- */
  const FAQS = [
    { id: "q1", q: "Question 1", a: "You can earn on colala easily by referring your friends, you get a referral bonus once they make a purchase." },
    { id: "q2", q: "Question 2", a: "Bonuses are credited once your referral completes an eligible order." },
    { id: "q3", q: "Question 3", a: "You can withdraw to any supported bank account when your balance meets the minimum threshold." },
    { id: "q4", q: "How to earn on Colala ?", a: "You can earn on colala easily by referring your friends, you get a referral bonus once they make a purchase" },
  ];
  const [openFaqId, setOpenFaqId] = useState("q4");

  /* ----- Search data ----- */
  const PRODUCTS = [
    {
      id: "1",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/1",
    },
    {
      id: "2",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/2",
    },
    {
      id: "3",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/3",
    },
    {
      id: "4",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/4",
    },
    {
      id: "5",
      title: "Dell Inspiron Laptop",
      price: "₦2,000,000",
      commission: "5%",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      storeName: "Sasha Stores",
      storeAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
      link: "https://example.com/product/5",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate("Home");
            }}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} pointerEvents="none">Referrals</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {[
          { key: "wallet", label: "Wallet" },
          { key: "faqs", label: "FAQs" },
          { key: "search", label: "Search" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tabBtn, active ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={[styles.tabTxt, active ? styles.tabTxtActive : styles.tabTxtInactive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===== Wallet tab ===== */}
      {tab === "wallet" && (
        <FlatList
          data={[{ id: "content" }]}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={() => (
            <>
              {/* Gradient Wallet Card */}
              <LinearGradient
                colors={["#E90F0F", "#BD0F7B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <Text style={styles.gcLabel}>Referral Earnings</Text>
                <Text style={styles.gcAmount}>N35,000</Text>

                <View style={styles.gcBtnRow}>
                  <View>
                    <Text style={styles.gcSmall}>No of referrals</Text>
                    <Text style={styles.gcCount}>20</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginLeft: "auto" }}>
                    <TouchableOpacity
                      style={[styles.gcBtn, styles.gcBtnLight]}
                      onPress={() => setWithdrawVisible(true)}
                    >
                      <Text style={[styles.gcBtnText, styles.gcBtnTextDark]}>Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.gcBtn, styles.gcBtnLight]}
                      onPress={() => setTransferVisible(true)}
                    >
                      <Text style={[styles.gcBtnText, styles.gcBtnTextDark]}>Transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>

              {/* Referral Code box */}
              <View style={styles.codeWrap}>
                <Text style={styles.codeLabel}>Referral Code</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeText}>{code}</Text>
                  <TouchableOpacity onPress={() => copy(code)} style={styles.copyBtn}>
                    <Ionicons name="copy-outline" size={18} color={COLOR.text} />
                  </TouchableOpacity>
                </View>
                {copied ? <Text style={styles.copiedTxt}>Copied!</Text> : null}
              </View>

              {/* How it works */}
              <Text style={styles.sectionTitle}>Refer and Earn on Colala</Text>
              <Text style={styles.sectionBody}>
                Refer your friends and unlock exclusive rewards. The more friends you bring in, the
                more you earn.
              </Text>

              {/* Timeline steps with continuous vertical line */}
              <View style={styles.timelineWrap}>
                <View style={styles.timelineMasterLine} />
                {steps.map((t, i) => (
                  <StepRow key={i} index={i + 1} text={t} />
                ))}
              </View>
            </>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ===== FAQs tab ===== */}
      {tab === "faqs" && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Video banner with play icon */}
          <View style={styles.videoCard}>
            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1400&auto=format&fit=crop",
              }}
              style={styles.videoImage}
            />
            <View style={styles.playOverlay}>
              <Ionicons name="play" size={26} color="#fff" />
            </View>
          </View>

          <Text style={styles.faqsTitle}>Referral FAQs</Text>

          {/* Accordion list */}
          {FAQS.map((item) => {
            const open = openFaqId === item.id;
            return (
              <View key={item.id} style={[styles.faqItem, open && styles.faqItemOpen]}>
                <TouchableOpacity
                  onPress={() => setOpenFaqId(open ? "" : item.id)}
                  style={styles.faqHeader}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQ}>{item.q}</Text>
                  <Ionicons name={open ? "remove" : "add"} size={20} color={COLOR.text} />
                </TouchableOpacity>

                {open && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqA}>{item.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ===== Search tab ===== */}
      {tab === "search" && (
        <FlatList
          data={PRODUCTS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            <>
              {/* Search input with icon on the right */}
              <View style={styles.searchBar}>
                <TextInput
                  placeholder="Search Product"
                  placeholderTextColor={COLOR.sub}
                  style={{ flex: 1, color: COLOR.text }}
                />
                <TouchableOpacity style={styles.searchIconBtn}>
                  <Ionicons name="camera-outline" size={18} color={COLOR.text} />
                </TouchableOpacity>
              </View>

              {/* Filters row */}
              <View style={styles.filtersRow}>
                <FilterPill label="Category" onPress={() => {}} />
                <FilterPill label="Commission" onPress={() => setCommissionVisible(true)} />
                <FilterPill label="Price" onPress={() => {}} />
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.thumbWrap}>
                <Image source={{ uri: item.image }} style={styles.productImg} />
                <View style={styles.storeRow}>
                  <Image source={{ uri: item.storeAvatar }} style={styles.storeAvatar} />
                  <Text style={styles.storeName}>{item.storeName}</Text>
                </View>
              </View>

              <View style={styles.productMain}>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productCommission}>Commission : {item.commission}</Text>

              </View>

              <TouchableOpacity style={styles.copyBtnBig} onPress={() => copy(item.link)}>
                <Text style={styles.copyBtnBigTxt}>Copy link</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ===== Transfer Modal (bottom sheet) ===== */}
      <Modal
        visible={transferVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransferVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTransferVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Transfer</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setTransferVisible(false)}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount to transfer"
              placeholderTextColor={COLOR.sub}
              keyboardType="numeric"
              style={styles.amountInput}
            />

            <TouchableOpacity style={styles.proceedBtn} onPress={() => setTransferVisible(false)}>
              <Text style={styles.proceedTxt}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Commission Filter (bottom sheet) ===== */}
      <Modal
        visible={commissionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommissionVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setCommissionVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { fontStyle: "italic" }]}>Commission</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setCommissionVisible(false)}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {[
              { key: "all", label: "All" },
              { key: "5-10", label: "5 - 10 %" },
              { key: "10-20", label: "10 - 20 %" },
              { key: "20+", label: "Above 20 %" },
            ].map((opt) => {
              const selected = commissionSel === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.radioRow}
                  onPress={() => setCommissionSel(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                  <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.proceedBtn, { marginTop: 16 }]}
              onPress={() => setCommissionVisible(false)}
            >
              <Text style={styles.proceedTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== Withdraw Modal (full screen) ===== */}
      <Modal visible={withdrawVisible} animationType="slide" onRequestClose={() => setWithdrawVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Withdraw header */}
          <View style={styles.withdrawHeader}>
            <TouchableOpacity
              onPress={() => setWithdrawVisible(false)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <Text style={styles.withdrawTitle} pointerEvents="none">Withdraw</Text>
            <View style={{ width: 40, height: 40 }} />
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={{ padding: 16, backgroundColor: "#F7F8FC", flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Input placeholder="Amount to withdraw" value={wAmount} onChangeText={setWAmount} keyboardType="numeric" />
            <Input placeholder="Account Number" value={wAccNumber} onChangeText={setWAccNumber} keyboardType="number-pad" />
            <Input placeholder="Bank Name" value={wBankName} onChangeText={setWBankName} />
            <Input placeholder="Account Name" value={wAccName} onChangeText={setWAccName} />

            {/* Save details checkbox */}
            <TouchableOpacity onPress={() => setSaveDetails((p) => !p)} style={styles.saveRow} activeOpacity={0.8}>
              <View style={[styles.checkbox, saveDetails && styles.checkboxChecked]}>
                {saveDetails ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <Text style={{ color: COLOR.text }}>Save account details</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setWithdrawVisible(false)}>
              <Text style={styles.withdrawBtnTxt}>Process Withdrawal</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */
const StepRow = ({ index, text }) => {
  return (
    <View style={styles.stepRow}>
      <View style={styles.timelineCol}>
        <View style={styles.stepCircle}>
          <Text style={styles.stepIndex}>{index}</Text>
        </View>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
};

const Input = (props) => <TextInput {...props} placeholderTextColor={COLOR.sub} style={styles.input} />;

const FilterPill = ({ label, onPress }) => (
  <TouchableOpacity style={styles.filterPill} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.filterPillTxt}>{label}</Text>
    <Ionicons name="chevron-down" size={14} color={COLOR.text} />
  </TouchableOpacity>
);

/* ---------- Styles ---------- */
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
    zIndex: 0,
  },

  /* Tabs */
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    gap: 10,
  },
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

  /* Gradient card */
  gradientCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    ...shadow(6),
  },
  gcLabel: { color: "#fff", opacity: 0.9, fontSize: 12, marginTop: 10, marginBottom: 14 },
  gcAmount: { color: "#fff", fontSize: 39, fontWeight: "700", marginTop: 4 },
  gcSmall: { color: "#fff", opacity: 0.9, fontSize: 12, marginBottom: 8 },
  gcCount: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },
  gcBtnRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  gcBtn: {
    minWidth: 100,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop:20
  },
  gcBtnLight: { backgroundColor: "#fff" },
  gcBtnText: { fontWeight: "400", fontSize: 12 },
  gcBtnTextDark: { color: "#000" },

  /* Code box */
  codeWrap: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeLabel: { color: COLOR.sub, fontSize: 12, marginBottom: 6 },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  codeText: { color: COLOR.text, fontWeight: "700", fontSize: 16, letterSpacing: 1 },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },
  copiedTxt: { marginTop: 6, color: COLOR.primary, fontWeight: "600", fontSize: 12 },

  /* Section */
  sectionTitle: { marginTop: 18, color: COLOR.primary, fontWeight: "700" },
  sectionBody: { marginTop: 8, color: COLOR.text },

  /* Timeline (continuous line) */
  timelineWrap: { marginTop: 13, position: "relative" },
  timelineMasterLine: {
    position: "absolute",
    left: 17,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: "#E2E3E7",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 25 },
  timelineCol: { width: 36, alignItems: "center", position: "relative" },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndex: { color: COLOR.primary, fontWeight: "800" },
  stepText: { flex: 1, color: COLOR.text, lineHeight: 20 },

  /* FAQs */
  videoCard: {
    height: 210,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: "#eee",
  },
  videoImage: { width: "100%", height: "100%" },
  playOverlay: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    top: "50%",
    marginLeft: -26,
    marginTop: -26,
  },
  faqsTitle: { marginTop: 14, marginBottom: 8, fontSize: 14, color: "#000" },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    marginBottom: 10,
    overflow: "hidden",
  },
  faqItemOpen: { backgroundColor: "#fff" },
  faqHeader: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQ: { color: COLOR.text, fontSize: 14 },
  faqBody: { paddingHorizontal: 14, paddingBottom: 12 },
  faqA: { color: COLOR.sub },

  /* Search tab UI */
  searchBar: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  filtersRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  filterPill: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  filterPillTxt: { color: COLOR.text, fontSize: 12 },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 20,
    paddingRight: 12,
    overflow: "hidden",
  },
  thumbWrap: {
    // paddingLeft: 12,
    // paddingVertical: 10,
    paddingRight: 8,
  },
  productImg: { width: 106, height: 84, borderRadius: 12 },
  productMain: { flex: 1, paddingVertical: 10 },
  productTitle: { color: COLOR.text, fontWeight: "500" },
  productPrice: { color: COLOR.primary, fontWeight: "700", marginTop: 4 },
  productCommission: { color: COLOR.sub, marginTop: 18, fontSize: 12 },
  storeRow: { flexDirection: "row", alignItems: "center", marginTop: 3, marginLeft:10, marginBottom:4,
   },
  storeAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
  storeName: { color: COLOR.sub, fontSize: 12 },

  copyBtnBig: {
    backgroundColor: COLOR.primary,
    borderRadius: 7,
    paddingHorizontal: 14,
    height: 34,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop:50
  },
  copyBtnBigTxt: { color: "#fff", fontSize: 11 },

  /* Placeholder tabs */
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  placeholderTxt: { color: COLOR.sub },

  /* ===== Bottom sheets / modals ===== */
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
  closeBtn: {
    borderColor: "#000",
    borderWidth: 1.2,
    borderRadius: 20,
    padding: 2,
    alignItems: "center",
  },
  amountInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: COLOR.text,
    marginTop: 8,
  },
  proceedBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  proceedTxt: { color: "#fff", fontWeight: "700" },

  /* ===== Withdraw full screen ===== */
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
    marginTop: "auto",
  },
  withdrawBtnTxt: { color: "#fff", fontWeight: "400" },

  /* Radio rows (commission) */
  radioRow: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  radioLabel: { color: COLOR.text },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLOR.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: COLOR.primary },
  radioInner: { width: 10, height: 10, borderRadius: 6, backgroundColor: COLOR.primary },
});
