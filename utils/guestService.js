import AsyncStorage from '@react-native-async-storage/async-storage';
import { http, setGuestToken } from '../config/api.config';

const GUEST_TOKEN_KEY = 'guest_token';
const GUEST_EXPIRES_KEY = 'guest_expires_at';
const IS_GUEST_KEY = 'is_guest';

export const GuestService = {
  // Generate guest token
  async generateGuestToken() {
    try {
      console.log('🔄 Generating guest token...');
      const response = await http.post('/auth/guest-token');
      
      if (response?.status === 'success' && response?.data?.guest_token) {
        const { guest_token, expires_at } = response.data;
        
        // Store guest token and expiration
        await setGuestToken(guest_token); // This also sets the API header
        await AsyncStorage.setItem(GUEST_EXPIRES_KEY, expires_at);
        await AsyncStorage.setItem(IS_GUEST_KEY, 'true');
        
        console.log('✅ Guest token generated and stored');
        return { guest_token, expires_at };
      }
      
      throw new Error('Failed to generate guest token');
    } catch (error) {
      console.error('❌ Error generating guest token:', error);
      throw error;
    }
  },

  // Get current guest token
  async getGuestToken() {
    try {
      const token = await AsyncStorage.getItem(GUEST_TOKEN_KEY);
      const expiresAt = await AsyncStorage.getItem(GUEST_EXPIRES_KEY);
      
      if (!token || !expiresAt) {
        return null;
      }
      
      // Check if token is expired
      const now = new Date();
      const expires = new Date(expiresAt);
      
      if (now >= expires) {
        console.log('⚠️ Guest token expired, clearing...');
        await this.clearGuestToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error getting guest token:', error);
      return null;
    }
  },

  // Check if user is guest
  async isGuest() {
    try {
      const isGuestFlag = await AsyncStorage.getItem(IS_GUEST_KEY);
      const hasGuestToken = await this.getGuestToken();
      const isGuest = isGuestFlag === 'true' && hasGuestToken;
      console.log('GuestService - isGuest check:', { isGuestFlag, hasGuestToken, isGuest });
      return isGuest;
    } catch (error) {
      console.error('❌ Error checking guest status:', error);
      return false;
    }
  },

  // Clear guest token
  async clearGuestToken() {
    try {
      await AsyncStorage.multiRemove([GUEST_TOKEN_KEY, GUEST_EXPIRES_KEY, IS_GUEST_KEY]);
      console.log('✅ Guest token cleared');
    } catch (error) {
      console.error('❌ Error clearing guest token:', error);
    }
  },

  // Initialize guest mode (call this when app starts without auth)
  async initializeGuestMode() {
    try {
      const existingToken = await this.getGuestToken();
      
      if (existingToken) {
        console.log('✅ Using existing guest token');
        return existingToken;
      }
      
      // Generate new guest token
      const { guest_token } = await this.generateGuestToken();
      return guest_token;
    } catch (error) {
      console.error('❌ Error initializing guest mode:', error);
      return null;
    }
  },

  // Convert guest to authenticated user
  async convertToAuthenticated(authToken, userData) {
    try {
      // Clear guest data
      await this.clearGuestToken();
      
      // Set authenticated user data
      await AsyncStorage.setItem('auth_token', authToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      await AsyncStorage.setItem(IS_GUEST_KEY, 'false');
      
      console.log('✅ Converted guest to authenticated user');
    } catch (error) {
      console.error('❌ Error converting guest to authenticated:', error);
      throw error;
    }
  }
};

export default GuestService;
