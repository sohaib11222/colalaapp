// // components/HomeHeader.tsx
// import ThemedText from './ThemedText';
// import React from 'react';
// import {

//   View,
//   Text,
//   TextInput,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';

// const HomeHeader = ({ user = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
//   const navigation = useNavigation();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Profile and Location */}
//         <View style={styles.userSection}>
//           <Image
//             source={require('../assets/Avatar 1.png')} // Replace with your image
//             style={styles.profileImage}
//           />
//           <View>
//             <ThemedText style={styles.greeting}>Hi, {user.name}</ThemedText>
//             <View style={styles.locationRow}>
//               <ThemedText style={styles.location}>{user.location}</ThemedText>
//               <Ionicons name="caret-down" size={14} color="white" style={{ marginLeft: 4 }} />
//             </View>
//           </View>
//         </View>

//         {/* Icons */}
//         <View style={styles.iconRow}>
//           <TouchableOpacity onPress={()=>navigation.navigate('ServiceNavigator', {
//             screen: 'Cart',
//           })} style={[styles.iconButton, {backgroundColor:"#fff", padding:6, borderRadius:25}]}>
//             <Ionicons name="cart-outline" size={22} color="#E53E3E" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={()=>navigation.navigate('ServiceNavigator', {
//             screen: 'Notifications',
//           })} style={[styles.iconButton, {backgroundColor:"#fff", padding:6, borderRadius:25}]}>
//             <Ionicons name="notifications-outline" size={22} color="#E53E3E" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <TextInput
//           placeholder="Search any product, shop or category"
//           placeholderTextColor="#888"
//           style={styles.searchInput}
//         />
//         <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeHeader;

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: '#E53E3E', // Bright red background
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: 24,
//   },
//   container: {
//     flexDirection: 'row',
//     paddingHorizontal:10,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   userSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 21,
//     marginRight: 10,
//   },
//   greeting: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom:5
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',

//   },
//   location: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight:500
//   },
//   iconRow: {
//     flexDirection: 'row',
//   },
//   iconButton: {
//     marginLeft: 9,
//   },
//   searchContainer: {
//     marginTop: 15,
//     backgroundColor: 'white',
//     borderRadius: 12,

//     paddingHorizontal: 14,
//     marginHorizontal:6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 57,

//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//   },
//   cameraIcon: {
//     marginLeft: 8,
//   },
// });
// components/HomeHeader.tsx (JSX)
// import ThemedText from './ThemedText';
// import React from 'react';
// import {
//   View,
//   TextInput,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';

// const HomeHeader = ({ user = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
//   const navigation = useNavigation();

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         {/* Profile and Location */}
//         <View style={styles.userSection}>
//           <Image
//             source={require('../assets/Avatar 1.png')}
//             style={styles.profileImage}
//           />
//           <View>
//             <ThemedText style={styles.greeting}>Hi, {user.name}</ThemedText>
//             <View style={styles.locationRow}>
//               <ThemedText style={styles.location}>{user.location}</ThemedText>
//               <Ionicons name="caret-down" size={14} color="white" style={{ marginLeft: 4 }} />
//             </View>
//           </View>
//         </View>

//         {/* Icons (now images) */}
//         <View style={styles.iconRow}>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate('ServiceNavigator', { screen: 'Cart' })
//             }
//             style={[styles.iconButton, styles.iconPill]}
//             accessibilityRole="button"
//             accessibilityLabel="Open cart"
//           >
//             <Image
//               source={require('../assets/cart-icon.png')}
//               style={styles.iconImg}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate('ServiceNavigator', { screen: 'Notifications' })
//             }
//             style={[styles.iconButton, styles.iconPill]}
//             accessibilityRole="button"
//             accessibilityLabel="Open notifications"
//           >
//             <Image
//               source={require('../assets/bell-icon.png')}
//               style={styles.iconImg}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <TextInput
//           placeholder="Search any product, shop or category"
//           placeholderTextColor="#888"
//           style={styles.searchInput}
//         />
//         <Image
//           source={require('../assets/camera-icon.png')}
//           style={styles.iconImg}
//         />      </View>
//     </SafeAreaView>
//   );
// };

// export default HomeHeader;

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: '#E53E3E',
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: 24,
//   },
//   container: {
//     flexDirection: 'row',
//     paddingHorizontal: 10,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   userSection: { flexDirection: 'row', alignItems: 'center' },
//   profileImage: { width: 60, height: 60, borderRadius: 21, marginRight: 10 },
//   greeting: { color: 'white', fontSize: 14, fontWeight: '500', marginBottom: 5 },
//   locationRow: { flexDirection: 'row', alignItems: 'center' },
//   location: { color: 'white', fontSize: 10, fontWeight: 500 },

//   iconRow: { flexDirection: 'row' },
//   iconButton: { marginLeft: 9 },
//   iconPill: { backgroundColor: '#fff', padding: 6, borderRadius: 25 },

//   // If your PNGs are already colored, remove tintColor.
//   iconImg: { width: 22, height: 22, resizeMode: 'contain' },

//   searchContainer: {
//     marginTop: 15,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     marginHorizontal: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 57,
//   },
//   searchInput: { flex: 1, fontSize: 14, color: '#333' },
//   cameraIcon: { marginLeft: 8 },
// });


import ThemedText from './ThemedText';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// keep same prop for backward-compat, but we'll override with stored user when found
const HomeHeader = ({ user: propUser = { name: 'Maleek', location: 'Lagos, Nigeria' } }) => {
  const navigation = useNavigation();

  const [user, setUser] = useState({
    name: propUser.name,
    location: propUser.location,
    avatar: null,
  });

  const HOST = 'https://colala.hmstech.xyz';
  const toAbs = (u) => (u?.startsWith('http') ? u : `${HOST}/storage/${u || ''}`);

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
        u?.profile_picture
          ? { uri: toAbs(u.profile_picture) }
          : null;

      setUser({ name, location, avatar });
    } catch (e) {
      // fail silently; keep defaults
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // reload when screen regains focus (e.g., after login)
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
              user.avatar
                ? user.avatar
                : require('../assets/Avatar 1.png')
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

        {/* Icons (now images) */}
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ServiceNavigator', { screen: 'Cart' })
            }
            style={[styles.iconButton, styles.iconPill]}
            accessibilityRole="button"
            accessibilityLabel="Open cart"
          >
            <Image
              source={require('../assets/cart-icon.png')}
              style={styles.iconImg}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AuthNavigator', { screen: 'Search' })
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
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search any product, shop or category"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
        <Image
          source={require('../assets/camera-icon.png')}
          style={styles.iconImg}
        />
      </View>
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
  location: { color: 'white', fontSize: 10, fontWeight: 500 },

  iconRow: { flexDirection: 'row' },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: '#fff', padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: 'contain' },

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
  cameraIcon: { marginLeft: 8 },
});
