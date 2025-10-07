import ThemedText from './ThemedText';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCameraSearch } from '../config/api.config';

const HomeHeader = ({ user: propUser = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
  const navigation = useNavigation();

  const [user, setUser] = useState({
    name: propUser.name,
    location: propUser.location,
    avatar: null,
  });

  const [cartQuantity, setCartQuantity] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const HOST = 'https://colala.hmstech.xyz';
  const toAbs = (u) => (u?.startsWith('http') ? u : `${HOST}/storage/${u || ''}`);

  // Camera search functionality
  const { mutate: cameraSearch, isPending: isCameraSearching } = useCameraSearch();

  // Load stored user
  const loadUser = async () => {
    try {
      const raw = await AsyncStorage.getItem('auth_user');
      if (!raw) return;

      const u = JSON.parse(raw);
      const name =
        u?.full_name?.trim() ||
        u?.user_name?.trim() ||
        (u?.email ? u.email.split('@')[0] : 'User');

      const locParts = [u?.state, u?.country].filter(Boolean);
      const location = locParts.length ? locParts.join(', ') : propUser.location;

      const avatar =
        u?.profile_picture ? { uri: toAbs(u.profile_picture) } : null;

      setUser({ name, location, avatar });
    } catch (e) {
      console.log("⚠️ Failed to load user:", e);
    }
  };

  // Fetch cart quantity from API
  const fetchCartQuantity = async () => {
    try {
      // Adjust key if you store token differently
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log("⚠️ No token found in AsyncStorage");
        return;
      }

      const response = await fetch(
        'https://colala.hmstech.xyz/api/buyer/cart-quantity',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      const json = await response.json();
      console.log("✅ Cart quantity response:", json);

      if (json?.status === 'success') {
        setCartQuantity(parseInt(json.data?.quantity || 0));
      }
    } catch (err) {
      console.log("❌ Error fetching cart quantity:", err.message);
    }
  };

  // Camera search functionality
  const handleCameraSearch = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to search with images.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setIsSearching(true);

        // Perform camera search
        cameraSearch(
          { image: imageUri, type: 'product' },
          {
            onSuccess: (data) => {
              console.log("✅ Camera search successful:", data);
              setIsSearching(false);
              
              // Navigate to camera search results screen
              navigation.navigate('CameraSearchScreen', {
                searchResults: data.search_results,
                extractedText: data.extracted_text,
                searchQuery: data.search_query,
              });
            },
            onError: (error) => {
              console.log("❌ Camera search error:", error);
              setIsSearching(false);
              Alert.alert(
                'Search Failed',
                'Could not analyze the image. Please try again.'
              );
            },
          }
        );
      }
    } catch (error) {
      console.log("❌ Camera error:", error);
      setIsSearching(false);
      Alert.alert(
        'Error',
        'Failed to open camera. Please try again.'
      );
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // 🔥 Single focus effect
  useFocusEffect(
    useCallback(() => {
      loadUser();

      console.log("Screen focused, setting 3s timer to fetch cart...");
      const timer = setTimeout(() => {
        fetchCartQuantity();
      }, 2000);

      return () => clearTimeout(timer);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Profile and Location */}
        <View style={styles.userSection}>
          <Image
            source={
              user.avatar ? user.avatar : require('../assets/Avatar 1.png')
            }
            style={styles.profileImage}
          />
          <View>
            <ThemedText style={styles.greeting}>Hi, {user.name}</ThemedText>
            <View style={styles.locationRow}>
              <ThemedText style={styles.location}>{user.location}</ThemedText>
              <Ionicons name="caret-down" size={14} color="white" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.iconRow}>
          {/* Cart Icon */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ServiceNavigator', { screen: 'Cart' })
            }
            style={[styles.iconButton, styles.iconPill]}
            accessibilityRole="button"
            accessibilityLabel="Open cart"
          >
            <View style={styles.cartIconContainer}>
              <Image
                source={require('../assets/cart-icon.png')}
                style={styles.iconImg}
              />
              {cartQuantity > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartQuantity > 99 ? "99+" : cartQuantity}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Notifications Icon */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ServiceNavigator', { screen: 'Notifications' })
            }
            style={[styles.iconButton, styles.iconPill]}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Image
              source={require('../assets/bell-icon.png')}
              style={styles.iconImg}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AuthNavigator', { screen: 'Search' })}
        style={styles.searchContainer}
      >
        <TextInput
          placeholder="Search any product, shop or category"
          placeholderTextColor="#888"
          style={styles.searchInput}
          editable={false}
          showSoftInputOnFocus={false}
          pointerEvents="none"
        />
        <TouchableOpacity onPress={handleCameraSearch} disabled={isCameraSearching || isSearching}>
          {isCameraSearching || isSearching ? (
            <ActivityIndicator size="small" color="#888" />
          ) : (
            <Image source={require('../assets/camera-icon.png')} style={styles.iconImg} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 60, height: 60, borderRadius: 21, marginRight: 10 },
  greeting: { color: 'white', fontSize: 14, fontWeight: '500', marginBottom: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { color: 'white', fontSize: 10, fontWeight: '500' },

  iconRow: { flexDirection: 'row' },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: '#fff', padding: 6, borderRadius: 25 },

  iconImg: { width: 22, height: 22, resizeMode: 'contain' },

  cartIconContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  searchContainer: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    height: 57,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
});
