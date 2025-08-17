// screens/EditProfileScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/* ------------ THEME ------------ */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#ECEDEF",
  text: "#101318",
  sub: "#6C727A",
};

export default function EditProfileScreen() {
  const navigation = useNavigation();

  /* ---------- tabs ---------- */
  const [tab, setTab] = useState("profile"); // 'profile' | 'addresses'

  /* ---------- profile form ---------- */
  const [first, setFirst] = useState("Maleekfrenzy");
  const [last, setLast] = useState("Qamardeen Abdulmalik");
  const [email, setEmail] = useState("abcdef@gmail.com");
  const [phone, setPhone] = useState("07012345678");

  /* ---------- reset password flow ---------- */
  const [step, setStep] = useState(0); // 0=closed, 1=email, 2=code, 3=new pass
  const openReset = () => setStep(1);
  const closeReset = () => setStep(0);

  const [secs, setSecs] = useState(59);
  useEffect(() => {
    if (step !== 2) return;
    setSecs(59);
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  /* ---------- addresses data ---------- */
  const [addresses, setAddresses] = useState([
    {
      id: "a1",
      label: "Address 1",
      isDefault: true,
      phone: "070312345678",
      state: "Lagos",
      lga: "Ikeja",
      full: "No 2, acbsssddf street, Ikeja",
    },
    {
      id: "a2",
      label: "Address 2",
      isDefault: false,
      phone: "070312345678",
      state: "Lagos",
      lga: "Ikeja",
      full: "No 2, acbsssddf street, Ikeja",
    },
  ]);

  /* ---------- add/edit modal ---------- */
  const [addrModal, setAddrModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fPhone, setFPhone] = useState("");
  const [fState, setFState] = useState("");
  const [fLga, setFLga] = useState("");
  const [fFull, setFFull] = useState("");

  const openAdd = () => {
    setEditId(null);
    setFPhone("");
    setFState("");
    setFLga("");
    setFFull("");
    setAddrModal(true);
  };

  const openEdit = (a) => {
    setEditId(a.id);
    setFPhone(a.phone);
    setFState(a.state);
    setFLga(a.lga);
    setFFull(a.full);
    setAddrModal(true);
  };

  const saveAddress = () => {
    if (editId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editId ? { ...a, phone: fPhone, state: fState, lga: fLga, full: fFull } : a
        )
      );
    } else {
      const idx = addresses.length + 1;
      setAddresses((prev) => [
        ...prev,
        {
          id: `a${idx}`,
          label: `Address ${idx}`,
          isDefault: false,
          phone: fPhone.trim() || "—",
          state: fState.trim() || "—",
          lga: fLga.trim() || "—",
          full: fFull.trim() || "—",
        },
      ]);
    }
    setAddrModal(false);
  };

  const removeAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const makeDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
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
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} pointerEvents="none">
            Edit Profile
          </Text>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("profile")}
          style={[styles.tab, tab === "profile" ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={[styles.tabTxt, tab === "profile" ? styles.tabTxtActive : styles.tabTxtIn]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("addresses")}
          style={[styles.tab, tab === "addresses" ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={[styles.tabTxt, tab === "addresses" ? styles.tabTxtActive : styles.tabTxtIn]}>
            Saved Addresses
          </Text>
        </TouchableOpacity>
      </View>

      {/* -------- Profile tab -------- */}
      {tab === "profile" ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons name="camera-outline" size={28} color={COLOR.sub} />
            </View>
          </View>

          {/* Inputs */}
          <Input placeholder="First name" value={first} onChangeText={setFirst} />
          <Input placeholder="Last name" value={last} onChangeText={setLast} />
          <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {/* Reset password row */}
          <TouchableOpacity style={styles.rowBtn} onPress={openReset} activeOpacity={0.8}>
            <Text style={styles.rowLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLOR.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveTxt}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* -------- Saved Addresses tab -------- */
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
          >
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                a={a}
                onEdit={() => openEdit(a)}
                onDelete={() => removeAddress(a.id)}
                onMakeDefault={() => makeDefault(a.id)}
              />
            ))}
          </ScrollView>

          {/* Add New fixed button */}
          <View style={styles.addBar}>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Text style={styles.addBtnTxt}>Add New</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ====== RESET PASSWORD (3-step sheet) ====== */}
      <Modal visible={step > 0} transparent animationType="slide" onRequestClose={closeReset}>
        <KeyboardAvoidingView
          style={styles.sheetOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeReset} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Reset Password</Text>
              <TouchableOpacity onPress={closeReset} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {step === 1 && (
              <>
                <Text style={styles.sheetHint}>Reset you password via your registered email</Text>
                <View style={styles.inputIconWrap}>
                  <Ionicons name="mail-outline" size={18} color={COLOR.sub} style={{ marginRight: 8 }} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={COLOR.sub}
                    keyboardType="email-address"
                    style={styles.inputIcon}
                  />
                </View>
                <TouchableOpacity style={styles.proceedBtn} onPress={() => setStep(2)}>
                  <Text style={styles.proceedTxt}>Proceed</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.sheetHint}>Enter the code we sent to your email.</Text>
                <View style={styles.codeRow}>
                  <TextInput
                    placeholder="Enter Code"
                    placeholderTextColor={COLOR.sub}
                    style={[styles.inputIcon, { flex: 1 }]}
                  />
                  <TouchableOpacity style={styles.pasteBtn}>
                    <Text style={{ color: COLOR.primary, fontWeight: "600" }}>Paste</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: COLOR.text, marginTop: 8 }}>
                  You can resend code in{" "}
                  <Text style={{ color: COLOR.primary, fontWeight: "700" }}>
                    {`00:${String(secs).padStart(2, "0")}`}
                  </Text>
                </Text>
                <TouchableOpacity style={[styles.proceedBtn, { marginTop: 16 }]} onPress={() => setStep(3)}>
                  <Text style={styles.proceedTxt}>Proceed</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && <NewPassword onDone={closeReset} />}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ====== ADD / EDIT ADDRESS (full-screen modal) ====== */}
      <Modal visible={addrModal} animationType="slide" onRequestClose={() => setAddrModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Modal header */}
          <View style={styles.fullHeader}>
            <TouchableOpacity
              onPress={() => setAddrModal(false)}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLOR.text} />
            </TouchableOpacity>
            <Text style={styles.fullTitle} pointerEvents="none">
              {editId ? "Edit Address" : "Add Address"}
            </Text>
            <View style={{ width: 40, height: 40 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ padding: 16, backgroundColor: COLOR.bg, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <RowInput
                placeholder="Phone Number"
                value={fPhone}
                onChangeText={setFPhone}
                keyboardType="phone-pad"
              />
              <RowPicker label={fState || "State"} onPress={() => {}} />
              <RowPicker label={fLga || "Local Government"} onPress={() => {}} />

              <TextInput
                placeholder="Full Address"
                placeholderTextColor={COLOR.sub}
                value={fFull}
                onChangeText={setFFull}
                multiline
                style={styles.textArea}
              />
            </ScrollView>

            <View style={{ padding: 16, backgroundColor: COLOR.bg }}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
                <Text style={styles.saveTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Small reusable components ---------- */
const Input = (props) => (
  <TextInput {...props} placeholderTextColor={COLOR.sub} style={styles.input} />
);

function NewPassword({ onDone }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [s1, setS1] = useState(true);
  const [s2, setS2] = useState(true);

  return (
    <>
      <View style={styles.secRow}>
        <Ionicons name="lock-closed-outline" size={18} color={COLOR.sub} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Enter new password"
          placeholderTextColor={COLOR.sub}
          secureTextEntry={s1}
          value={p1}
          onChangeText={setP1}
          style={[styles.inputIcon, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setS1((v) => !v)}>
          <Ionicons name={s1 ? "eye-outline" : "eye"} size={18} color={COLOR.sub} />
        </TouchableOpacity>
      </View>

      <View style={styles.secRow}>
        <Ionicons name="lock-closed-outline" size={18} color={COLOR.sub} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Re-Enter new password"
          placeholderTextColor={COLOR.sub}
          secureTextEntry={s2}
          value={p2}
          onChangeText={setP2}
          style={[styles.inputIcon, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setS2((v) => !v)}>
          <Ionicons name={s2 ? "eye-outline" : "eye"} size={18} color={COLOR.sub} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.proceedBtn} onPress={onDone}>
        <Text style={styles.proceedTxt}>Proceed</Text>
      </TouchableOpacity>
    </>
  );
}

function AddressCard({ a, onEdit, onDelete, onMakeDefault }) {
  return (
    <View style={styles.addrCard}>
      {/* Top row */}
      <View style={styles.addrTop}>
        <View style={styles.addrTitleWrap}>
          <Text style={styles.addrTitle}>{a.label}</Text>
          {a.isDefault ? (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>Default Address</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={onMakeDefault} style={[styles.badge, { backgroundColor: "#FFF3F3", borderColor: "#FFD0D0" }]}>
              <Text style={[styles.badgeTxt, { color: COLOR.primary }]}>Make Default</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onEdit} style={styles.editChip} activeOpacity={0.85}>
            <Text style={styles.editChipTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
            <Text style={styles.deleteTxt}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields */}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.fieldLbl}>Phone number</Text>
        <Text style={styles.fieldVal}>{a.phone}</Text>

        <View style={{ flexDirection: "row", marginTop: 14 }}>
          <View style={{ flex: 1, paddingRight: 18 }}>
            <Text style={styles.fieldLbl}>State</Text>
            <Text style={styles.fieldVal}>{a.state}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLbl}>Local Government</Text>
            <Text style={styles.fieldVal}>{a.lga}</Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={styles.fieldLbl}>Full Address</Text>
          <Text style={styles.fieldVal}>{a.full}</Text>
        </View>
      </View>
    </View>
  );
}

const RowInput = (props) => (
  <View style={styles.rowInput}>
    <TextInput {...props} placeholderTextColor={COLOR.sub} style={{ flex: 1, color: COLOR.text }} />
  </View>
);

const RowPicker = ({ label, onPress }) => (
  <TouchableOpacity style={styles.rowInput} onPress={onPress} activeOpacity={0.8}>
    <Text style={{ color: label === "State" || label === "Local Government" ? COLOR.sub : COLOR.text }}>
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={18} color={COLOR.text} />
  </TouchableOpacity>
);

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  /* header */
  header: {
    backgroundColor: "#fff",
    paddingTop: 35,
    paddingBottom: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
    marginBottom: 20,
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

  /* tabs */
  tabs: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  tab: { flex: 1, height: 44, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: { backgroundColor: COLOR.surface, borderWidth: 1, borderColor: COLOR.line },
  tabTxt: { fontSize: 12, fontWeight: "600" },
  tabTxtActive: { color: "#fff" },
  tabTxtIn: { color: COLOR.text },

  /* avatar */
  avatarWrap: { alignItems: "center", marginTop: 8, marginBottom: 14 },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 56,
    backgroundColor: "#F1F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  /* inputs */
  input: {
    height: 60,
    borderRadius: 15,
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    color: COLOR.text,
    marginBottom: 8,
  },

  rowBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 6,
  },
  rowLabel: { color: COLOR.text },

  saveBtn: {
    height: 56,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom:25
  },
  saveTxt: { color: "#fff", fontWeight: "400" },

  /* addresses card (new design) */
  addrCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E9ECF1",
    padding: 18,
    marginBottom: 14,
  },
  addrTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addrTitleWrap: { flexDirection: "row", alignItems: "center" },
  addrTitle: { color: COLOR.text, fontWeight: "700", fontSize: 20 },

  badge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#FFE3E3",
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  badgeTxt: { fontSize: 12, color: COLOR.primary, fontWeight: "600" },

  editChip: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
  },
  editChipTxt: { color: "#fff", fontWeight: "700" },
  deleteTxt: { color: COLOR.primary, fontWeight: "600" },

  fieldLbl: { color: COLOR.sub, fontSize: 13, marginBottom: 6 },
  fieldVal: { color: COLOR.text, fontSize: 16, lineHeight: 22 },

  addBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: COLOR.bg,
  },
  addBtn: {
    height: 56,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnTxt: { color: "#fff", fontWeight: "400" },

  /* sheet (reset password) */
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    alignSelf: "center",
    width: 84,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D8DCE2",
    marginBottom: 6,
  },
  sheetHeader: { alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: COLOR.text },
  closeBtn: { position: "absolute", right: 0, top: 8, padding: 3, borderWidth: 1.5, borderRadius: 20 },

  sheetHint: { color: COLOR.text, marginTop: 6, marginBottom: 10 },
  inputIconWrap: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: COLOR.surface,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  inputIcon: { color: COLOR.text, height: "100%", flex: 1 },
  proceedBtn: {
    height: 54,
    borderRadius: 15,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  proceedTxt: { color: "#fff", fontWeight: "400" },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    padding: 4,
    borderRadius: 12,
    height: 58,
    marginTop: 6,
  },
  pasteBtn: {
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E53E3E",
    backgroundColor: "#fff",
  },
  secRow: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.line,
    backgroundColor: COLOR.surface,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },

  /* Full-screen add/edit header */
  fullHeader: {
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
  fullTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.text,
    fontSize: 18,
    fontWeight: "400",
  },

  /* Add/edit rows */
  rowInput: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 140,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLOR.line,
    paddingHorizontal: 12,
    paddingTop: 12,
    color: COLOR.text,
  },
});
