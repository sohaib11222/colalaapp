import React, { useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ThemedText from "../../../components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEditProfile } from "../../../config/api.config";
import { useResetPassword } from "../../../config/api.config";
import { useForgotPassword } from "../../../config/api.config";
import { useVerifyOtp } from "../../../config/api.config";

// ---- hooks from api.config.js
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../../../config/api.config";

/* ------------ THEME ------------ */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  line: "#ECEDEF",
  text: "#101318",
  sub: "#6C727A",
};

const { height } = Dimensions.get("window");

/** Demo lists (same tone as your Register screen) */
const popularStates = [
  "Lagos State",
  "Oyo State",
  "FCT, Abuja",
  "Rivers State",
];
const allStates = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Ebonyi State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
  "Gombe State",
  "Imo State",
  "Jigawa State",
  "Kaduna State",
  "Kano State",
  "Katsina State",
  "Kebbi State",
  "Kogi State",
  "Kwara State",
  "Lagos State",
  "Nasarawa State",
  "Niger State",
  "Ogun State",
  "Ondo State",
  "Osun State",
  "Oyo State",
  "Plateau State",
  "Rivers State",
  "Sokoto State",
  "Taraba State",
  "Yobe State",
  "Zamfara State",
  "FCT, Abuja",
];

const lgaByState = {
  "Lagos State": [
    "Ikeja",
    "Alimosho",
    "Eti-Osa",
    "Surulere",
    "Kosofe",
    "Agege",
  ],
  "Oyo State": ["Ibadan North", "Ibadan South-West", "Ogbomosho", "Oyo"],
  "FCT, Abuja": ["Gwagwalada", "Kuje", "Abaji", "Bwari", "Kwali", "AMAC"],
  "Rivers State": ["Port Harcourt", "Obio-Akpor", "Eleme", "Oyigbo"],
};

export default function EditProfileScreen() {
  const navigation = useNavigation();

  /* ---------- tabs ---------- */
  const [tab, setTab] = useState("addresses"); // default to addresses per your task

  /* ---------- profile form (load from AsyncStorage) ---------- */
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  /* ---------- reset password flow (kept) ---------- */
  const [step, setStep] = useState(0); // 0=closed, 1=email, 2=code, 3=new pass
  const openReset = () => setStep(1);
  const closeReset = () => setStep(0);
  const [secs, setSecs] = useState(59);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password reset mutations
  const forgotPassword = useForgotPassword({
    onSuccess: (res) => {
      console.log("ForgotPassword success:", res);
      Alert.alert("Success", "Reset code sent to your email!");
      setStep(2);
    },
    onError: (err) => {
      console.log("ForgotPassword error:", err);
      const errorMessage =
        err?.message ||
        err?.data?.message ||
        "Failed to send reset code. Please try again.";
      Alert.alert("Error", errorMessage);
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: (res) => {
      console.log("VerifyOtp success:", res);
      Alert.alert("Success", "Code verified successfully!");
      setStep(3);
    },
    onError: (err) => {
      console.log("VerifyOtp error:", err);
      const errorMessage =
        err?.message ||
        err?.data?.message ||
        "Invalid verification code. Please try again.";
      Alert.alert("Error", errorMessage);
    },
  });

  const resetPassword = useResetPassword({
    onSuccess: (res) => {
      console.log("ResetPassword success:", res);
      Alert.alert("Success", "Password updated successfully!");
      closeReset();
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      console.log("ResetPassword error:", err);
      const errorMessage =
        err?.message ||
        err?.data?.message ||
        "Failed to update password. Please try again.";
      Alert.alert("Error", errorMessage);
    },
  });

  // Password reset handlers
  const handleForgotPassword = () => {
    console.log("Handling forgot password for email:", resetEmail);
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    console.log("Calling forgotPassword.mutate...");
    forgotPassword.mutate({ email: resetEmail });
  };

  const handleVerifyOtp = () => {
    console.log(
      "Handling verify OTP for email:",
      resetEmail,
      "code:",
      resetCode
    );
    if (!resetCode) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }
    console.log("Calling verifyOtp.mutate...");
    verifyOtp.mutate({ email: resetEmail, code: resetCode });
  };

  const handleResetPassword = () => {
    console.log(
      "Handling reset password for email:",
      resetEmail,
      "code:",
      resetCode
    );
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    console.log("Calling resetPassword.mutate...");
    resetPassword.mutate({
      email: resetEmail,
      code: resetCode,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
  };
  useEffect(() => {
    if (step !== 2) return;
    setSecs(59);
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        setFirst(user.full_name || "");
        setLast(""); // API doesn't provide separate last name
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setUserName(user.user_name || "");
        if (user.profile_picture) {
          setProfilePicture({
            uri: `https://colala.hmstech.xyz/storage/${user.profile_picture}`,
          });
        }
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Edit profile mutation
  const editProfile = useEditProfile({
    onSuccess: async (res) => {
      Alert.alert("Success", "Profile updated successfully!");
      console.log("Profile updated successfully!", res);
      // Update AsyncStorage with new user data
      if (res?.data) {
        await AsyncStorage.setItem("auth_user", JSON.stringify(res.data));
        loadUserData(); // Reload data
      }
    },
    onError: (err) => {
      console.log("Edit profile error:", err);
      const errorMessage =
        err?.message ||
        err?.data?.message ||
        "Failed to update profile. Please try again.";
      Alert.alert("Error", errorMessage);
    },
  });

  // Image picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setProfilePicture({ uri: asset.uri });
        setProfilePictureFile({
          uri: asset.uri,
          type: "image/jpeg",
          name: "profile_picture.jpg",
        });
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Save profile function
  const saveProfile = () => {
    console.log("Saving profile...");
    if (!first || !email || !phone) {
      Alert.alert("Missing info", "Please fill in all required fields.");
      return;
    }

    console.log("Profile data:", { first, email, phone, userName });

    const formData = new FormData();
    formData.append("full_name", first);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("user_name", userName);

    if (profilePictureFile) {
      formData.append("profile_picture", profilePictureFile);
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    console.log("Calling editProfile.mutate...");
    editProfile.mutate(formData);
  };

  /* ---------- server addresses ---------- */
  const addressesQuery = useAddresses();
  const addAddress = useAddAddress({
    onSuccess: () => {
      setAddrModal(false);
      // fields already cleared; list is refetched via invalidate in hook
    },
    onError: (err) => {
      Alert.alert("Add Address Failed", err?.message || "Please try again.");
    },
  });
  const updateAddress = useUpdateAddress({
    onSuccess: () => {
      setAddrModal(false);
    },
    onError: (err) => {
      Alert.alert("Update Failed", err?.message || "Please try again.");
    },
  });
  const deleteAddress = useDeleteAddress({
    onError: (err) => {
      Alert.alert("Delete Failed", err?.message || "Please try again.");
    },
  });

  // Map API data -> card shape you already render
  const addresses = useMemo(() => {
    const list = addressesQuery?.data?.data || [];
    return list.map((a) => ({
      id: a.id,
      label: a.label || `Address ${a.id}`,
      isDefault: !!a.is_default,
      phone: a.phone || "—",
      state: a.state || "—",
      lga: a.city || "—", // API 'city' shown as LGA on card
      full: [a.line1, a.line2].filter(Boolean).join(", "),
      _raw: a,
    }));
  }, [addressesQuery?.data]);

  /* ---------- add/edit modal ---------- */
  const [addrModal, setAddrModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fPhone, setFPhone] = useState("");
  const [fState, setFState] = useState("");
  const [fLga, setFLga] = useState("");
  const [fFull, setFFull] = useState("");

  // State modal
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchText, setStateSearchText] = useState("");
  const filteredStates = allStates.filter((s) =>
    s.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  // LGA modal (depends on selected state)
  const [showLgaModal, setShowLgaModal] = useState(false);
  const [lgaSearchText, setLgaSearchText] = useState("");
  const lgasForState = useMemo(() => {
    const list = lgaByState[fState] || [
      "Central",
      "North",
      "South",
      "East",
      "West",
    ];
    return list.filter((l) =>
      l.toLowerCase().includes(lgaSearchText.toLowerCase())
    );
  }, [fState, lgaSearchText]);

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
    setFPhone(a.phone || "");
    setFState(a.state || "");
    setFLga(a.lga || "");
    setFFull(a.full || "");
    setAddrModal(true);
  };

  // H A R D C O D E D extras (because backend requires but UI doesn't collect):
  // - label, country, zipcode, line2, is_default, etc.
  const buildPayload = () => ({
    label: "Home",
    phone: (fPhone || "").trim(),
    line1: (fFull || "").trim(),
    line2: "",
    city: (fLga || "").trim(),
    state: (fState || "").trim(),
    country: "Nigeria",
    zipcode: "000000",
    is_default: false,
  });

  const saveAddress = () => {
    if (!fPhone || !fState || !fLga || !fFull) {
      Alert.alert(
        "Missing info",
        "Please fill Phone, State, Local Government and Full Address."
      );
      return;
    }

    const payload = buildPayload();

    if (editId) {
      updateAddress.mutate({ id: editId, ...payload });
    } else {
      addAddress.mutate(payload);
    }
  };

  const removeAddress = (id) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAddress.mutate(id),
        },
      ]
    );
  };

  const makeDefault = (id) => {
    // backend default toggle: set only is_default=true for selected id
    updateAddress.mutate({ id, is_default: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate("Home")
            }
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color={COLOR.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} pointerEvents="none">
            Edit Profile
          </ThemedText>

          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("profile")}
          style={[
            styles.tab,
            tab === "profile" ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <ThemedText
            style={[
              styles.tabTxt,
              tab === "profile" ? styles.tabTxtActive : styles.tabTxtIn,
            ]}
          >
            Edit Profile
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("addresses")}
          style={[
            styles.tab,
            tab === "addresses" ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <ThemedText
            style={[
              styles.tabTxt,
              tab === "addresses" ? styles.tabTxtActive : styles.tabTxtIn,
            ]}
          >
            Saved Addresses
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* -------- Profile tab (unchanged) -------- */}
      {tab === "profile" ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
            <View style={styles.avatarCircle}>
              {profilePicture ? (
                <Image source={profilePicture} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera-outline" size={28} color={COLOR.sub} />
              )}
            </View>
          </TouchableOpacity>

          {/* Inputs */}
          <Input
            placeholder="Full name"
            value={first}
            onChangeText={setFirst}
          />
          <Input
            placeholder="Username"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
          <Input
            placeholder="Email"
            value={email}
            editable={false}
            style={[styles.input, styles.disabledInput]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            placeholder="Phone"
            value={phone}
            editable={false}
            style={[styles.input, styles.disabledInput]}
            keyboardType="phone-pad"
          />

          {/* Reset password row */}
          <TouchableOpacity
            style={styles.rowBtn}
            onPress={openReset}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.rowLabel}>Change Password</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={COLOR.text} />
          </TouchableOpacity>

          {/* Save button */}
          <View style={{ marginTop: 100 }}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                editProfile.isPending && styles.saveBtnDisabled,
              ]}
              onPress={saveProfile}
              disabled={editProfile.isPending}
            >
              <ThemedText style={styles.saveBtnText}>
                {editProfile.isPending ? "Saving..." : "Save Profile"}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} />
        </View>
      ) : (
        /* -------- Saved Addresses tab -------- */
        <>
          {addressesQuery.isLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator color={COLOR.primary} />
            </View>
          ) : addressesQuery.isError ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText>Failed to load addresses.</ThemedText>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 110,
              }}
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
              {addresses.length === 0 ? (
                <ThemedText style={{ color: COLOR.sub, marginTop: 10 }}>
                  No saved addresses yet.
                </ThemedText>
              ) : null}
            </ScrollView>
          )}

          {/* Add New fixed button */}
          <View style={styles.addBar}>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <ThemedText style={styles.addBtnTxt}>
                {addAddress.isPending || updateAddress.isPending
                  ? "Saving..."
                  : "Add New"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ====== RESET PASSWORD (3-step sheet) ====== */}
      <Modal
        visible={step > 0}
        transparent
        animationType="slide"
        onRequestClose={closeReset}
      >
        <KeyboardAvoidingView
          style={styles.sheetOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeReset}
          />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <ThemedText font="oleo" style={styles.sheetTitle}>
                Reset Password
              </ThemedText>
              <TouchableOpacity onPress={closeReset} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            {step === 1 && (
              <>
                <ThemedText style={styles.sheetHint}>
                  Reset your password via your registered email
                </ThemedText>
                <View style={styles.inputIconWrap}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={COLOR.sub}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={COLOR.sub}
                    keyboardType="email-address"
                    style={styles.inputIcon}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.proceedBtn,
                    forgotPassword.isPending && styles.proceedBtnDisabled,
                  ]}
                  onPress={handleForgotPassword}
                  disabled={forgotPassword.isPending}
                >
                  <ThemedText style={styles.proceedTxt}>
                    {forgotPassword.isPending ? "Sending..." : "Send Code"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <ThemedText style={styles.sheetHint}>
                  Enter the code we sent to your email.
                </ThemedText>
                <View style={styles.codeRow}>
                  <TextInput
                    value={resetCode}
                    onChangeText={setResetCode}
                    placeholder="Enter Code"
                    placeholderTextColor={COLOR.sub}
                    style={[styles.inputIcon, { flex: 1 }]}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity style={styles.pasteBtn}>
                    <ThemedText
                      style={{ color: COLOR.primary, fontWeight: "600" }}
                    >
                      Paste
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.proceedBtn,
                    verifyOtp.isPending && styles.proceedBtnDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={verifyOtp.isPending}
                >
                  <ThemedText style={styles.proceedTxt}>
                    {verifyOtp.isPending ? "Verifying..." : "Verify"}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={{ color: COLOR.text, marginTop: 8 }}>
                  You can resend code in{" "}
                  <ThemedText
                    style={{ color: COLOR.primary, fontWeight: "700" }}
                  >
                    {`00:${String(secs).padStart(2, "0")}`}
                  </ThemedText>
                </ThemedText>
              </>
            )}

            {step === 3 && (
              <>
                <ThemedText style={styles.sheetHint}>
                  Enter your new password
                </ThemedText>
                <View style={styles.secRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={COLOR.sub}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Enter new password"
                    placeholderTextColor={COLOR.sub}
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={[styles.inputIcon, { flex: 1 }]}
                  />
                </View>

                <View style={styles.secRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={COLOR.sub}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Confirm new password"
                    placeholderTextColor={COLOR.sub}
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={[styles.inputIcon, { flex: 1 }]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.proceedBtn,
                    resetPassword.isPending && styles.proceedBtnDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={resetPassword.isPending}
                >
                  <ThemedText style={styles.proceedTxt}>
                    {resetPassword.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ====== ADD / EDIT ADDRESS (full-screen modal) ====== */}
      <Modal
        visible={addrModal}
        animationType="slide"
        onRequestClose={() => setAddrModal(false)}
      >
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
            <ThemedText style={styles.fullTitle} pointerEvents="none">
              {editId ? "Edit Address" : "Add Address"}
            </ThemedText>
            <View style={{ width: 40, height: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                backgroundColor: COLOR.bg,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <RowInput
                placeholder="Phone Number"
                value={fPhone}
                onChangeText={setFPhone}
                keyboardType="phone-pad"
              />

              {/* State picker opens modal */}
              <RowPicker
                label={fState || "State"}
                onPress={() => setShowStateModal(true)}
              />

              {/* LGA picker opens modal (requires state) */}
              <RowPicker
                label={fLga || "Local Government"}
                onPress={() => {
                  if (!fState) {
                    Alert.alert("Select State", "Please select a state first.");
                    return;
                  }
                  setShowLgaModal(true);
                }}
              />

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
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveAddress}
                disabled={addAddress.isPending || updateAddress.isPending}
              >
                <ThemedText style={styles.saveTxt}>
                  {addAddress.isPending || updateAddress.isPending
                    ? "Saving..."
                    : "Save"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ====== STATE MODAL ====== */}
      <Modal visible={showStateModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            <View style={styles.modalHeader}>
              <ThemedText
                font="oleo"
                style={{ fontSize: 20, fontWeight: "400", marginLeft: 170 }}
              >
                State
              </ThemedText>
              <TouchableOpacity
                style={{
                  borderColor: "#000",
                  borderWidth: 1.5,
                  borderRadius: 20,
                }}
                onPress={() => setShowStateModal(false)}
              >
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              placeholderTextColor="#999"
              value={stateSearchText}
              onChangeText={setStateSearchText}
            />

            <ThemedText style={styles.sectionLabel}>Popular</ThemedText>
            {popularStates.map((state) => (
              <TouchableOpacity
                key={state}
                style={styles.modalItem}
                onPress={() => {
                  setFState(state);
                  setShowStateModal(false);
                  // reset LGA when state changes
                  setFLga("");
                }}
              >
                <ThemedText>{state}</ThemedText>
              </TouchableOpacity>
            ))}

            <ThemedText style={styles.sectionLabel}>All States</ThemedText>
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFState(item);
                    setShowStateModal(false);
                    setFLga("");
                  }}
                >
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              )}
              style={{ marginBottom: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* ====== LGA MODAL ====== */}
      <Modal visible={showLgaModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            <View style={styles.modalHeader}>
              <ThemedText
                font="oleo"
                style={{
                  fontSize: 20,
                  fontWeight: "400",
                  marginLeft: 120,
                  textAlign: "center",
                }}
              >
                Local Government
              </ThemedText>
              <TouchableOpacity
                style={{
                  borderColor: "#000",
                  borderWidth: 1.5,
                  borderRadius: 20,
                }}
                onPress={() => setShowLgaModal(false)}
              >
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search LGA"
              placeholderTextColor="#999"
              value={lgaSearchText}
              onChangeText={setLgaSearchText}
            />

            <FlatList
              data={lgasForState}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFLga(item);
                    setShowLgaModal(false);
                  }}
                >
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              )}
              style={{ marginBottom: 8 }}
            />
          </View>
        </View>
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
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={COLOR.sub}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Enter new password"
          placeholderTextColor={COLOR.sub}
          secureTextEntry={s1}
          value={p1}
          onChangeText={setP1}
          style={[styles.inputIcon, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setS1((v) => !v)}>
          <Ionicons
            name={s1 ? "eye-outline" : "eye"}
            size={18}
            color={COLOR.sub}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.secRow}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={COLOR.sub}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Re-Enter new password"
          placeholderTextColor={COLOR.sub}
          secureTextEntry={s2}
          value={p2}
          onChangeText={setP2}
          style={[styles.inputIcon, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setS2((v) => !v)}>
          <Ionicons
            name={s2 ? "eye-outline" : "eye"}
            size={18}
            color={COLOR.sub}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.proceedBtn} onPress={onDone}>
        <ThemedText style={styles.proceedTxt}>Proceed</ThemedText>
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
          <ThemedText style={styles.addrTitle}>{a.label}</ThemedText>
          {a.isDefault ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeTxt}>Default Address</ThemedText>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onMakeDefault}
              style={[
                styles.badge,
                { backgroundColor: "#FFF3F3", borderColor: "#FFD0D0" },
              ]}
            >
              <ThemedText style={[styles.badgeTxt, { color: COLOR.primary }]}>
                Make Default
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.editChip}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.editChipTxt}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ marginLeft: 16 }}>
            <ThemedText style={styles.deleteTxt}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fields */}
      <View style={{ marginTop: 16 }}>
        <ThemedText style={styles.fieldLbl}>Phone number</ThemedText>
        <ThemedText style={styles.fieldVal}>{a.phone}</ThemedText>

        <View style={{ flexDirection: "row", marginTop: 14 }}>
          <View style={{ flex: 1, paddingRight: 18 }}>
            <ThemedText style={styles.fieldLbl}>State</ThemedText>
            <ThemedText style={styles.fieldVal}>{a.state}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.fieldLbl}>Local Government</ThemedText>
            <ThemedText style={styles.fieldVal}>{a.lga}</ThemedText>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <ThemedText style={styles.fieldLbl}>Full Address</ThemedText>
          <ThemedText style={styles.fieldVal}>{a.full}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const RowInput = (props) => (
  <View style={styles.rowInput}>
    <TextInput
      {...props}
      placeholderTextColor={COLOR.sub}
      style={{ flex: 1, color: COLOR.text }}
    />
  </View>
);

const RowPicker = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.rowInput}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <ThemedText
      style={{
        color:
          label === "State" || label === "Local Government"
            ? COLOR.sub
            : COLOR.text,
      }}
    >
      {label}
    </ThemedText>
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
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: COLOR.primary },
  tabInactive: {
    backgroundColor: COLOR.surface,
    borderWidth: 1,
    borderColor: COLOR.line,
  },
  tabTxt: { fontSize: 10, fontWeight: "600" },
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
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 56,
  },
  saveBtn: {
    backgroundColor: COLOR.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  saveBtnDisabled: {
    backgroundColor: "#ccc",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  proceedBtnDisabled: {
    backgroundColor: "#ccc",
  },
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
  disabledInput: {
    backgroundColor: "#b4bfb7",
    color: "#999999",
    borderColor: "#e0e0e0",
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
    marginBottom: 25,
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
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
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
  sheetHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: COLOR.text },
  closeBtn: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 3,
    borderWidth: 1.5,
    borderRadius: 20,
  },

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

  // Modals (state/LGA)
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.9,
  },
  dragIndicator: {
    width: 110,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: -10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchInput: {
    backgroundColor: "#EDEDED",
    borderRadius: 15,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: "#000",
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  modalItem: {
    backgroundColor: "#EDEDED",
    padding: 15,
    borderRadius: 10,
    marginBottom: 6,
  },
});
