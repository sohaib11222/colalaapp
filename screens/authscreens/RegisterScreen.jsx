import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const { height } = Dimensions.get('window');

const popularCountries = ['Nigeria', 'Ghana', 'South Africa', 'United Kingdom'];
const allCountries = ['USA', 'Canada', 'Mexico', 'UAE', 'Rwanda', 'Benin Republic', 'Russia', 'Senegal'];

const RegisterScreen = () => {
  const navigation = useNavigation()
  
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowModal(false);
  };

  const filteredCountries = allCountries.filter((country) =>
    country.toLowerCase().includes(searchText.toLowerCase())
  );

  // state logic
  const [showStateModal, setShowStateModal] = useState(false);
  const [selectedState, setSelectedState] = useState('');

  const popularStates = ['Lagos State', 'Oyo State', 'FCT, Abuja', 'Rivers State'];
  const allStates = [
    'Abia State', 'Adamawa State', 'Akwa Ibom State', 'Anambra State', 'Bauchi State',
    'Bayelsa State', 'Benue State', 'Borno State', //... add all states
  ];

  const [stateSearchText, setStateSearchText] = useState('');

  const filteredStates = allStates.filter((state) =>
    state.toLowerCase().includes(stateSearchText.toLowerCase())
  );

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setShowStateModal(false);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          source={require('../../assets/registermain1.png')}
          style={styles.topImage}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create a free account today</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          {/* Country Field */}
          <TouchableOpacity
            style={styles.selectWrapper}
            onPress={() => setShowModal(true)}
          >
            <Text style={[styles.selectText, { color: selectedCountry ? '#000' : '#999' }]}>
              {selectedCountry || 'Country'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* State Field */}
          <TouchableOpacity style={styles.selectWrapper} onPress={() => setShowStateModal(true)}>
            <Text style={[styles.selectText, { color: selectedState ? '#000' : '#999' }]}>
              {selectedState || 'State'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>


          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              style={styles.input}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Referral Code (Optional)"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('Login')} style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By proceeding you agree to Colala’s{' '}
            <TouchableOpacity style={{ marginTop: 7 }} onPress={() => setShowTermsModal(true)}>
              <Text style={[styles.linkText, { fontSize: 11 }]}>terms of use</Text>
            </TouchableOpacity>
            {' '}
            and{' '}
            <TouchableOpacity>
              <Text style={[styles.linkText, { fontSize: 11 }]}>privacy policy</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>

      {/* Country Modal */}
      {/* <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', fontStyle: 'italic' }}>Country</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={{
              backgroundColor: '#F0F0F0',
              borderRadius: 10,
              padding: 12,
              marginTop: 16,
              fontSize: 16
            }}
            placeholder="Search location"
            value={searchText}
            onChangeText={setSearchText}
          />

          <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Popular</Text>
          {popularCountries.map((country, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modalItem}
              onPress={() => handleCountrySelect(country)}
            >
              <Text>{country}</Text>
            </TouchableOpacity>
          ))}

          <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>All Countries</Text>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleCountrySelect(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal> */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />

            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 20, fontWeight: '400', fontStyle: 'italic', marginLeft: 160 }}>Country</Text>
              <TouchableOpacity style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 20 }} onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              value={searchText}
              onChangeText={setSearchText}
            />

            <Text style={styles.sectionLabel}>Popular</Text>
            {popularCountries.map((country, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => handleCountrySelect(country)}
              >
                <Text>{country}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>All Countries</Text>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>


      {/* State Modal */}
      <Modal
        visible={showStateModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />

            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 20, fontWeight: '400', fontStyle: 'italic', marginLeft: 170 }}>State</Text>
              <TouchableOpacity style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 20, }} onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              value={stateSearchText}
              onChangeText={setStateSearchText}
            />

            <Text style={styles.sectionLabel}>Popular</Text>
            {popularStates.map((state, index) => (
              <TouchableOpacity key={index} style={styles.modalItem} onPress={() => handleStateSelect(state)}>
                <Text>{state}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionLabel}>All States</Text>
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleStateSelect(item)}>
                  <Text>{item}</Text>
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
              <Text style={{ fontSize: 18, fontWeight: 'bold', fontStyle: 'italic', marginLeft: 140, marginBottom: 10 }}>Terms of use</Text>
              <TouchableOpacity  style={{ borderColor: "#000", borderWidth: 1.5, borderRadius: 20, }}  onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={18} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, fontWeight: 400, marginBottom: 20 }}>Kindly read the Colala mall terms of use</Text>

            <ScrollView>
              <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 20, elevation: 3 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Terms of Use for Colala Mall</Text>
                <Text style={{ marginBottom: 10 }}>
                  Welcome to colala mall, an eCommerce platform operated by Colala. By downloading, accessing, or using the app...
                </Text>
                <Text style={{ fontWeight: 'bold' }}>1. Acceptance of Terms</Text>
                <Text style={{ marginBottom: 10 }}>
                  By using this app, you confirm that you are at least 18 years old or have legal parental/guardian consent, and that you have the legal capacity to enter into this agreement.
                </Text>
                <Text style={{ fontWeight: 'bold' }}>1. Acceptance of Terms</Text>
                <Text style={{ marginBottom: 10 }}>
                  By using this app, you confirm that you are at least 18 years old or have legal parental/guardian consent, and that you have the legal capacity to enter into this agreement.
                </Text>
              </View>
              {/* Repeat for other sections */}
            </ScrollView>
          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
};

// Add these new styles inside your styles object
const styles = StyleSheet.create({
  // ... (your existing styles)
  container: {
    flex: 1,
    backgroundColor: '#B91919',
  },
  topImage: {
    marginTop: 30,
    width: 410,
    height: 140,
    resizeMode: 'cover',
  },
  card: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    marginTop: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    marginBottom: 24,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 16,
    justifyContent: 'center',
    elevation: 1,
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  selectWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  selectText: {
    fontSize: 16,
    color: '#999',
  },
  createAccountButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
  },
  loginButton: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: -1,
  },
  linkText: {
    color: '#E53E3E',
  },
  // modalItem: {
  //   backgroundColor: '#F3F3F3',
  //   padding: 15,
  //   borderRadius: 10,
  //   marginBottom: 8,
  // },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.9,
  },
  dragIndicator: {
    width: 110,
    height: 8,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: -10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#EDEDED',
    borderRadius: 15,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    elevation: 1
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  modalItem: {
    backgroundColor: '#EDEDED',
    padding: 15,
    borderRadius: 10,
    marginBottom: 3,
    elevation: 1
  },

});

export default RegisterScreen;
