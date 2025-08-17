// components/HomeHeader.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const HomeHeader = ({ user = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Profile and Location */}
        <View style={styles.userSection}>
          <Image
            source={require('../assets/Avatar 1.png')} // Replace with your image
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.greeting}>Hi, {user.name}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.location}>{user.location}</Text>
              <Ionicons name="caret-down" size={14} color="white" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={[styles.iconButton, {backgroundColor:"#fff", padding:6, borderRadius:25}]}>
            <Ionicons name="cart-outline" size={22} color="#E53E3E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('ServiceNavigator', {
            screen: 'Notifications',
          })} style={[styles.iconButton, {backgroundColor:"#fff", padding:6, borderRadius:25}]}>
            <Ionicons name="notifications-outline" size={22} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search any product, shop or category"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
        <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
      </View>
    </SafeAreaView>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#E53E3E', // Bright red background
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal:10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 21,
    marginRight: 10,
  },
  greeting: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom:5
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  
  },
  location: {
    color: 'white',
    fontSize: 10,
    fontWeight:500
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 9,
  },
  searchContainer: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 12,

    paddingHorizontal: 14,
    marginHorizontal:6,
    flexDirection: 'row',
    alignItems: 'center',
    height: 57,
    
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  cameraIcon: {
    marginLeft: 8,
  },
});
