import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, Image, TouchableOpacity,
  Dimensions, SafeAreaView, ScrollView, Modal, FlatList, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // <-- changed here
import ThemedText from '../../components/ThemedText';
import { useRegister } from '../../config/api.config'; // <-- our mutation

const { height } = Dimensions.get('window');

const countries = ['Nigeria', 'Outside Nigeria'];

const popularStates = ['Lagos State', 'Oyo State', 'FCT, Abuja', 'Rivers State'];
const allStates = [
  'Abia State',
  'Adamawa State',
  'Akwa Ibom State',
  'Anambra State',
  'Bauchi State',
  'Bayelsa State',
  'Benue State',
  'Borno State',
  'Cross River State',
  'Delta State',
  'Ebonyi State',
  'Edo State',
  'Ekiti State',
  'Enugu State',
  'Gombe State',
  'Imo State',
  'Jigawa State',
  'Kaduna State',
  'Kano State',
  'Katsina State',
  'Kebbi State',
  'Kogi State',
  'Kwara State',
  'Lagos State',
  'Nasarawa State',
  'Niger State',
  'Ogun State',
  'Ondo State',
  'Osun State',
  'Oyo State',
  'Plateau State',
  'Rivers State',
  'Sokoto State',
  'Taraba State',
  'Yobe State',
  'Zamfara State',
  'FCT, Abuja'
];

const RegisterScreen = () => {
  const navigation = useNavigation();

  // form state
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // country/state pickers
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchText, setStateSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);

  // image
  const [photo, setPhoto] = useState(null); // { uri, mimeType?, fileName? }

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredStates = allStates.filter((s) =>
    s.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  const handleCountrySelect = (c) => { setSelectedCountry(c); setShowModal(false); };
  const handleStateSelect = (s) => { setSelectedState(s); setShowStateModal(false); };

  // Password strength validator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 'none', score: 0, label: '', color: '#ccc' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) {
      return { strength: 'weak', score, label: 'Weak', color: '#F44336' };
    } else if (score <= 4) {
      return { strength: 'medium', score, label: 'Medium', color: '#FF9800' };
    } else {
      return { strength: 'strong', score, label: 'Strong', color: '#4CAF50' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  // pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload a profile picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      setPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || 'profile.jpg',
      });
    }
  };

  // mutation
  const register = useRegister({
    onSuccess: (res) => {
      // Navigate to OTP verification screen with email
      navigation.navigate('VerifyCode', { 
        email: email.trim(),
        flow: 'registration' // Indicate this is registration flow
      });
    },
    onError: (err) => {
      const msg = err?.data?.message
        || (Array.isArray(err?.data?.errors) ? err.data.errors.join('\n') : '')
        || err?.message
        || 'Registration failed.';
      Alert.alert('Error', msg);
    },
  });

  const onSubmit = () => {
    // simple checks
    if (!userName || !fullName || !email || !phone || !selectedState || !selectedCountry || !password) {
      Alert.alert('Missing info', 'Please fill all required fields.');
      return;
    }

    const fd = new FormData();
    fd.append('full_name', fullName.trim());
    fd.append('user_name', userName.trim());
    fd.append('email', email.trim());
    fd.append('password', password);
    fd.append('phone', phone.trim());
    // API expects lowercase strings per your sample; normalize:
    fd.append('state', String(selectedState).toLowerCase());
    fd.append('country', String(selectedCountry).toLowerCase());
    if (refCode) fd.append('referral_code', refCode.trim()); // optional if backend supports it

    if (photo?.uri) {
      fd.append('profile_picture', {
        uri: photo.uri,
        name: photo.fileName || 'profile.jpg',
        type: photo.mimeType || 'image/jpeg',
      });
    }

    register.mutate(fd);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Image source={require('../../assets/mainimage.png')} style={styles.topImage} />
          </View>

          <View style={styles.card}>
          <ThemedText style={styles.title}>Register</ThemedText>
          <ThemedText style={styles.subtitle}>Create a free account today</ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="Username" placeholderTextColor="#999" style={styles.input}
              value={userName} onChangeText={setUserName} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="Full Name" placeholderTextColor="#999" style={styles.input}
              value={fullName} onChangeText={setFullName} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="Email Address" placeholderTextColor="#999" style={styles.input}
              keyboardType="email-address" autoCapitalize="none"
              value={email} onChangeText={setEmail} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="Phone Number" placeholderTextColor="#999" style={styles.input}
              keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>

          {/* Country */}
          <TouchableOpacity style={styles.selectWrapper} onPress={() => setShowModal(true)}>
            <ThemedText style={[styles.selectText, { color: selectedCountry ? '#000' : '#999' }]}>
              {selectedCountry || 'Country'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* State */}
          <TouchableOpacity style={styles.selectWrapper} onPress={() => setShowStateModal(true)}>
            <ThemedText style={[styles.selectText, { color: selectedState ? '#000' : '#999' }]}>
              {selectedState || 'State'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View>
            <View style={[styles.inputWrapper, { position: 'relative' }]}>
              <TextInput 
                placeholder="Password" 
                placeholderTextColor="#999" 
                style={[styles.input, { paddingRight: 45 }]}
                secureTextEntry={!showPassword}
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View 
                    style={[
                      styles.passwordStrengthFill,
                      { 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }
                    ]} 
                  />
                </View>
                <ThemedText style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <TextInput placeholder="Referral Code (Optional)" placeholderTextColor="#999" style={styles.input}
              value={refCode} onChangeText={setRefCode} />
          </View>

          {/* Profile picture picker + preview
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={pickImage} style={[styles.selectWrapper, { flex: 1, height: 50 }]}>
              <ThemedText style={[styles.selectText, { color: photo ? '#000' : '#999' }]}>
                {photo ? (photo.fileName || 'Selected image') : 'Upload profile picture'}
              </ThemedText>
              <Ionicons name="image" size={18} color="#999" />
            </TouchableOpacity>
            {photo?.uri ? (
              <Image source={{ uri: photo.uri }} style={{ width: 44, height: 44, borderRadius: 8, marginLeft: 10 }} />
            ) : null}
          </View> */}

          <TouchableOpacity onPress={onSubmit} style={styles.createAccountButton} disabled={register.isPending}>
            {register.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.createAccountText}>Create Account</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
            <ThemedText style={styles.loginText}>Login</ThemedText>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>
              By proceeding you agree to Colala's{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => setShowTermsModal(true)}>
              <ThemedText style={[styles.linkText, { fontSize: 11 }]}>terms of use</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.footerText}>
              {' '}and{' '}
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.linkText, { fontSize: 11 }]}>privacy policy</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            <View style={styles.modalHeader}>
              <ThemedText font="oleo" style={{ fontSize: 20, fontWeight: '400', marginLeft: 160 }}>Country</ThemedText>
              <TouchableOpacity style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 24 }} onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={16} />
              </TouchableOpacity>
            </View>
            {countries.map((country) => (
              <TouchableOpacity key={country} style={styles.modalItem} onPress={() => handleCountrySelect(country)}>
                <ThemedText>{country}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal visible={showStateModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            <View style={styles.modalHeader}>
              <ThemedText font='oleo' style={{ fontSize: 20, fontWeight: '400', marginLeft: 170, textAlign:'center' }}>State</ThemedText>
              <TouchableOpacity style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 20 }} onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.searchInput} placeholder="Search location"
              value={stateSearchText} onChangeText={setStateSearchText} />
            <ThemedText style={styles.sectionLabel}>Popular</ThemedText>
            {popularStates.map((state) => (
              <TouchableOpacity key={state} style={styles.modalItem} onPress={() => handleStateSelect(state)}>
                <ThemedText>{state}</ThemedText>
              </TouchableOpacity>
            ))}
            <ThemedText style={styles.sectionLabel}>All States</ThemedText>
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleStateSelect(item)}>
                  <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

     <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: 500, padding: 20 }]}>
            <View style={styles.dragIndicator} />

            <View style={styles.modalHeader}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontStyle: 'italic', marginLeft: 140, marginBottom: 10 }}>Terms of use</ThemedText>
              <TouchableOpacity  style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 20, }}  onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>
            <ThemedText style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>Kindly read the Colala Mall Buyer Policy</ThemedText>

            <ScrollView>
              <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, elevation: 3 }}>
                <ThemedText style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 15 }}>COLALA MALL BUYER POLICY</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>
                  Welcome to Colala Mall, an online marketplace that connects buyers directly with verified sellers.
                </ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>
                  By creating an account or making a purchase on Colala Mall, you agree to the following terms:
                </ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>1. Role of Colala Mall</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Colala Mall is only a platform connecting buyers and sellers.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• We do not determine prices, do not handle delivery, and do not store or warehouse any products.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• Prices, product descriptions, and availability are set solely by the sellers.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>2. Buying on Colala Mall</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Before placing an order, buyers are responsible for reviewing all product details, seller ratings, and return policies.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Ensure your delivery address and contact information are correct before checkout.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Payment is made through the Colala Mall system for security.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Any direct communication with the seller regarding product specifications, stock, or delivery should be conducted through approved platform channels.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• Delivery codes are to be release to seller at delivery point</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>3. Payment Protection & Release</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• All payments are held in a secure escrow system until the buyer confirms that the item has been received.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Once you confirm receipt, payment is automatically released to the seller.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• If you do not confirm and release delivery code within 48 hours after the seller marks the order as "Delivered", the system will automatically release the payment to the seller.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>4. Delivery & Confirmation</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Delivery is managed directly by the seller.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• You are required to confirm receipt only when you've received your order.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• If you notice any issue (wrong, missing, or damaged items), you must open a dispute within 48 hours after delivery is marked.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>5. Disputes & Refunds</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Each seller has their own refund and return policy.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• If a dispute is opened, both buyer and seller must provide clear evidence (e.g., pictures, delivery proof).</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• Colala Mall may act as a neutral mediator but is not responsible for the final outcome or refund fulfillment.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>6. Buyer Conduct</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>You agree not to:</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Submit false claims or disputes.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Attempt to make payment or delivery outside the platform.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Harass or abuse sellers or misuse the system.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• Post misleading or fake reviews.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>7. Limitation of Liability</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Colala Mall is not responsible for product quality, late delivery, or misrepresentation by sellers.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• The buyer agrees to make purchases at their own discretion and risk.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>• Colala Mall's role ends once payment is processed and released as per the policy above.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>• Losses resulting from off-platform communication or payments.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>8. Policy Updates</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>This Buyer Policy may be updated from time to time. Continuing to use the app means you agree to the most recent version.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>Buyer Acknowledgment</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>By signing up or continuing to use Colala Mall, I confirm that:</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>✅ I understand Colala Mall is only a connecting platform.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>✅ I understand Colala Mall does not determine prices, handle delivery, or warehouse items.</ThemedText>
                <ThemedText style={{ marginBottom: 8 }}>✅ I agree that funds will be released to sellers automatically after 48 hours if vendor marks delivered and I do not confirm receipt.</ThemedText>
                <ThemedText style={{ marginBottom: 15 }}>✅ I will open disputes, if any, within 48 hours of delivery.</ThemedText>

                <ThemedText style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 8 }}>I have read and agree to the Colala Mall Buyer Policy.</ThemedText>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // (keep your existing styles)
  container: { flex: 1, backgroundColor: '#B91919' },
  imageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B91919',marginLeft: -10 },
  topImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  card: { flex: 1, backgroundColor: '#F9F9F9', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, marginTop: -40 },
  title: { fontSize: 24, fontWeight: '600', color: '#E53E3E', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 24 },
  inputWrapper: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, height: 55, borderWidth:0.3, borderColor:"#CDCDCD", marginBottom: 16, justifyContent: 'center' },
  input: { fontSize: 16, color: '#000', flex: 1 },
  eyeIcon: { position: 'absolute', right: 16, top: '50%', marginTop: -10, zIndex: 1 },
  passwordStrengthContainer: { marginTop: -10, marginBottom: 16 },
  passwordStrengthBar: { 
    height: 4, 
    backgroundColor: '#EDEDED', 
    borderRadius: 2, 
    overflow: 'hidden',
    marginBottom: 6
  },
  passwordStrengthFill: { 
    height: '100%', 
    borderRadius: 2,
    transition: 'width 0.3s ease'
  },
  passwordStrengthText: { 
    fontSize: 12, 
    fontWeight: '500',
    marginLeft: 2
  },
  selectWrapper: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, height: 55, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 16, color: '#999' },
  createAccountButton: { backgroundColor: '#E53E3E', paddingVertical: 20, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 18 },
  createAccountText: { color: '#fff', fontSize: 14, fontWeight: '400' },
  loginButton: { backgroundColor: '#EBEBEB', paddingVertical: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  loginText: { color: '#666', fontSize: 14 },
  footerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: -1 },
  footerText: { fontSize: 11, color: '#999', textAlign: 'center' },
  linkText: { color: '#E53E3E', fontSize: 11 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#F9F9F9', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: height * 0.9 },
  dragIndicator: { width: 110, height: 8, backgroundColor: '#ccc', borderRadius: 5, alignSelf: 'center', marginBottom: 10, marginTop: -10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchInput: { backgroundColor: '#EDEDED', borderRadius: 15, padding: 12, marginTop: 16, fontSize: 16 },
  sectionLabel: { marginTop: 20, marginBottom: 10, fontSize: 14, fontWeight: '500' },
  modalItem: { backgroundColor: '#EDEDED', padding: 15, borderRadius: 10, marginBottom: 3 },
});

export default RegisterScreen;
