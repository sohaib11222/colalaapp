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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCameraSearch, useCartQuantity } from '../config/api.config';
import { performLogout } from '../utils/navigationUtils';
import GuestService from '../utils/guestService';
import LoginPromptModal from './LoginPromptModal';

const HomeHeader = ({ user: propUser = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
  const navigation = useNavigation();

  const [user, setUser] = useState({
    name: propUser.name,
    location: propUser.location,
    avatar: null,
  });
  const [isGuest, setIsGuest] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const HOST = 'https://colala.hmstech.xyz';
  const toAbs = (u) => (u?.startsWith('http') ? u : `${HOST}/storage/${u || ''}`);

  // Camera search functionality
  const { mutate: cameraSearch, isPending: isCameraSearching } = useCameraSearch();
  
  // Use shared cart quantity hook (only for authenticated users)
  const { data: cartQuantity = 0, isLoading: isCartLoading } = useCartQuantity();
  
  // Handle guest actions
  const handleGuestAction = (action) => {
    console.log("HomeHeader - handleGuestAction called, isGuest:", isGuest);
    if (isGuest) {
      console.log("HomeHeader - Showing login modal for guest");
      // Force modal to show by setting to false first, then true
      setShowLoginModal(false);
      setTimeout(() => setShowLoginModal(true), 10);
    } else {
      console.log("HomeHeader - User is authenticated, proceeding with action");
      action();
    }
  };

  // Load stored user
  const loadUser = async () => {
    try {
      // Check if user is guest
      const guestStatus = await GuestService.isGuest();
      console.log("HomeHeader - Guest status:", guestStatus);
      setIsGuest(guestStatus);
      
      if (guestStatus) {
        // User is guest
        setUser({ 
          name: 'Guest', 
          location: 'Browse as guest', 
          avatar: null 
        });
        // Don't automatically show login prompt - let user explore first
        return;
      }
      
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


  // Show image picker modal
  const handleCameraSearch = () => {
    setShowImagePickerModal(true);
  };

  // Handle camera image capture
  const handleCameraCapture = async () => {
    try {
      setShowImagePickerModal(false);
      
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
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
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

  // Handle gallery image selection
  const handleGallerySelection = async () => {
    try {
      setShowImagePickerModal(false);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library permission to select images.'
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("❌ Gallery error:", error);
      setIsSearching(false);
      Alert.alert(
        'Error',
        'Failed to open gallery. Please try again.'
      );
    }
  };

  // Process selected image
  const processImage = async (imageUri) => {
    setIsSearching(true);

    // Perform camera search
    cameraSearch(
      { image: imageUri, type: 'product' },
      {
        onSuccess: (data) => {
          console.log("✅ Image search successful: in home ", data);
          setIsSearching(false);
          
          // Navigate to camera search results screen
          navigation.navigate('CameraSearchScreen', {
            searchResults: data.search_results,
            extractedText: data.extracted_text,
            searchQuery: data.search_query,
          });
        },
        onError: (error) => {
          console.log("❌ Image search error:", error);
          setIsSearching(false);
          
          // Check if it's a token expiration error
          if (error?.isTokenExpired) {
            // Token expiration is already handled by the API interceptor
            return;
          }
          
          Alert.alert(
            'Search Failed',
            'Could not analyze the image. Please try again.'
          );
        },
      }
    );
  };

  useEffect(() => {
    loadUser();
  }, []);

  // 🔥 Single focus effect
  useFocusEffect(
    useCallback(() => {
      loadUser();
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
              {isGuest && (
                <TouchableOpacity
                  onPress={() => {
                    // Reset navigation stack to go to login screen
                    navigation.reset({
                      index: 0,
                      routes: [
                        { 
                          name: 'AuthNavigator',
                          state: {
                            routes: [{ name: 'Login' }],
                            index: 0
                          }
                        }
                      ],
                    });
                  }}
                  style={styles.loginButton}
                >
                  <ThemedText style={styles.loginButtonText}>Login</ThemedText>
                </TouchableOpacity>
              )}
              {!isGuest && (
                <Ionicons name="caret-down" size={14} color="white" style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.iconRow}>
          {/* Cart Icon */}
          <TouchableOpacity
            onPress={() => handleGuestAction(() =>
              navigation.navigate('ServiceNavigator', { screen: 'Cart' })
            )}
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
            onPress={() => handleGuestAction(() =>
              navigation.navigate('ServiceNavigator', { screen: 'Notifications' })
            )}
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

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleCameraCapture}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={32} color="#E53E3E" />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleGallerySelection}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={32} color="#E53E3E" />
                </View>
                <Text style={styles.optionText}>Choose from Gallery</Text>
                
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          // Stay on current screen when cancel is clicked (already on home)
        }}
        onLogin={() => {
          setShowLoginModal(false);
          // Reset navigation stack to go to login screen
          navigation.reset({
            index: 0,
            routes: [
              { 
                name: 'AuthNavigator',
                state: {
                  routes: [{ name: 'Login' }],
                  index: 0
                }
              }
            ],
          });
        }}
        title="Login Required"
        message="Please login to access your cart, notifications, and other features."
      />
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
  
  // Guest login button
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },

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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 40,
    maxWidth: 400,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalOptions: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
