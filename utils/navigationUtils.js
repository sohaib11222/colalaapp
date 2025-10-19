// Navigation utilities for handling logout and token expiration
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation reference - will be set by the app
let navigationRef = null;

// Set navigation reference
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Centralized logout function
export const performLogout = async (showAlert = true) => {
  try {
    console.log("🔄 Performing logout...");
    
    // Clear all stored authentication data
    await AsyncStorage.multiRemove([
      'auth_token',
      'auth_user',
      'user_data',
      'cart_data',
      'saved_items',
      'followed_stores'
    ]);
    
    console.log("✅ User data cleared successfully");
    
    // Clear React Query cache to prevent stale data
    // Import queryClient dynamically to avoid circular imports
    try {
      const { queryClient } = await import('../config/api.config');
      queryClient.clear();
    } catch (error) {
      console.log("⚠️ Could not clear query cache:", error);
    }
    
    // Reset navigation stack to login screen
    if (navigationRef && navigationRef.current) {
      console.log("🔄 Resetting navigation to Login screen...");
      navigationRef.reset({
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
      console.log("✅ Navigation reset successful - user taken to login screen");
    } else {
      console.log("⚠️ Navigation reference not available");
      // Try to get navigation from React Navigation
      try {
        const { CommonActions } = await import('@react-navigation/native');
        // This is a fallback - might not work in all cases
        console.log("⚠️ Navigation reference not set, logout may not navigate properly");
      } catch (navError) {
        console.log("⚠️ Could not access navigation:", navError);
      }
    }
    
    if (showAlert) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again.',
        [{ text: 'OK' }]
      );
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error during logout:", error);
    
    // Even if there's an error, try to navigate to login
    if (navigationRef && navigationRef.current) {
      try {
        navigationRef.reset({
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
      } catch (navError) {
        console.error("❌ Error resetting navigation:", navError);
      }
    }
    
    return false;
  }
};

// Handle token expiration specifically
export const handleTokenExpiration = async () => {
  return await performLogout(true);
};

// Test function to simulate token expiration (for development/testing)
export const simulateTokenExpiration = async () => {
  console.log("🧪 Simulating token expiration for testing...");
  return await performLogout(true);
};
