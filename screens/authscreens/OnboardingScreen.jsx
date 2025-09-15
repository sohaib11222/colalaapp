// import { useNavigation } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import ThemedText from '../../components/ThemedText';
// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   Image,
//   ScrollView,
//   Dimensions,
//   TouchableOpacity,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// const features = [
//   {
//     id: 1,
//     image: require('../../assets/Rectangle 157.png'), // replace with your actual image
//     text: 'Shop from variety of unique stores nationwide across several categories',
//   },
//   {
//     id: 2,
//       image: require('../../assets/Rectangle 157 (1).png'),// replace with your actual image
//     text: 'Chat and communicate easily with stores via the in-app chat',
//   },
//     {
//     id: 3,
//       image: require('../../assets/Rectangle 157 (2).png'),// replace with your actual image
//     text: 'Personalized social media feeds to see latest posts from stores across colala',
//   },
//   // Add more features as needed
// ];

// const OnboardingScreen = () => {

//     const navigation = useNavigation();
//   return (
//     <SafeAreaView style={styles.container}>
//         <StatusBar style='light'/>
//       {/* Main background image */}
//       <Image
//         source={require('../../assets/image 54.png')} // replace with your image
//         style={styles.mainImage}
//         resizeMode="cover"
//       />

//       {/* Bottom card overlay */}
//       <View style={styles.overlayCard}>
//         <ThemedText font='oleo' style={styles.welcomeText}>Welcome to</ThemedText>
//         <ThemedText font='oleo'  style={styles.brandName}>COLALA</ThemedText>
//         <ThemedText style={styles.subText}>Why Choose Colala ?</ThemedText>

//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.scrollView}
//         >
//           {features.map((item) => (
//             <View key={item.id} style={styles.featureCard}>
//               <Image source={item.image} style={styles.featureImage} />
//               <ThemedText style={styles.featureText}>{item.text}</ThemedText>
//             </View>
//           ))}
//         </ScrollView>

//         <TouchableOpacity onPress={()=>navigation.navigate('Login')}  style={styles.proceedBtn}>
//           <ThemedText style={styles.proceedText}>Proceed</ThemedText>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default OnboardingScreen;
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   mainImage: {
//     width: '100%',
//     height: '50%',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     // zIndex: -1,
//   },
//   overlayCard: {
//     flex: 1,
//     marginTop: '90%',
//     backgroundColor: '#F9F9F9',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//   },
//   welcomeText: {
//     fontSize: 20,
//     color: '#E53E3E',
//     fontWeight: 'bold',
//     marginBottom: -5,
//   },
//   brandName: {
//     fontSize: 90,
//     color: '#E53E3E',
//     fontWeight: 'bold',
//     // fontFamily: 'serif',
//     marginBottom: -1,
//   },
//   subText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 20,
//   },
//   scrollView: {
//     marginBottom: 20,
//   },
//   featureCard: {
//     width: width * 0.54,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 10,
//     paddingTop:0,
//     marginRight: 15,
//     alignItems: 'center',
//     elevation:2,
//     marginBottom:3,
//   },
//   featureImage: {
//     width: 222,
//     height: 137,
//     borderTopLeftRadius:20,
//     borderTopRightRadius:20,
//     marginBottom: 10,
//     resizeMode: 'contain',
//   },
//   featureText: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#333',
//   },
//   proceedBtn: {
//     backgroundColor: '#d63031',
//     paddingVertical: 17,
//     borderRadius: 15,
//     alignItems: 'center',
//   },
//   proceedText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '400',
//   },
// });
import React from 'react';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ThemedText from '../../components/ThemedText';
import {
  View,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';

// ---- Responsive helpers (lock to 375x812 design) ----
const BASE_W = 375;
const BASE_H = 812;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const scale = (w, size) => (w / BASE_W) * size;
const vscale = (h, size) => (h / BASE_H) * size;
const mscale = (w, size, f = 0.5) => size + (scale(w, size) - size) * f;

const features = [
  {
    id: 1,
    image: require('../../assets/Rectangle 157.png'),
    text: 'Shop from variety of unique stores nationwide across several categories',
  },
  {
    id: 2,
    image: require('../../assets/Rectangle 157 (1).png'),
    text: 'Chat and communicate easily with stores via the in-app chat',
  },
  {
    id: 3,
    image: require('../../assets/Rectangle 157 (2).png'),
    text: 'Personalized social media feeds to see latest posts from stores across colala',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // Match screenshot proportions
  const HERO_H = clamp(vscale(height, 340), 300, 420);
  const SHEET_OFFSET = clamp(vscale(height, 30), 18, 36);

  // Two cards visible like the mock
  const CARD_W = clamp(scale(width, 168), 150, 210);
  const CARD_GAP = clamp(scale(width, 12), 10, 14);

  const BRAND_FS = clamp(mscale(width, 72, 0.35), 58, 78);
  const WELCOME_FS = clamp(mscale(width, 20, 0.4), 18, 22);
  const SUB_FS = clamp(mscale(width, 14, 0.35), 13, 15);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top hero image */}
      <Image
        source={require('../../assets/image 54.png')}
        style={[styles.mainImage, { height: HERO_H }]}
        resizeMode="cover"
      />

      {/* Bottom rounded sheet */}
      <View style={[styles.overlayCard, { marginTop: HERO_H - SHEET_OFFSET }]}>
        <ThemedText font="oleo" style={[styles.welcomeText, { fontSize: WELCOME_FS }]}>
          Welcome to
        </ThemedText>

        <ThemedText
          font="oleo"
          style={[styles.brandName, { fontSize: BRAND_FS }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          COLALA
        </ThemedText>

        <ThemedText style={[styles.subText, { fontSize: SUB_FS }]}>
          Why Choose Colala ?
        </ThemedText>

        {/* Horizontal features – exactly two visible with spacing */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ marginBottom: 18 }}
          snapToInterval={CARD_W + CARD_GAP}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          {features.map((item) => (
            <View
              key={item.id}
              style={[
                styles.featureCard,
                {
                  width: CARD_W,
                  marginRight: CARD_GAP,
                  borderRadius: clamp(scale(width, 18), 16, 20),
                },
              ]}
            >
              <Image
                source={item.image}
                style={styles.featureImage}
                resizeMode="cover"
              />
              <ThemedText
                style={styles.featureText}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {item.text}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.proceedBtn}
          activeOpacity={0.9}
        >
          <ThemedText style={styles.proceedText}>Proceed</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  mainImage: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  overlayCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  welcomeText: {
    color: '#E53E3E',
    fontWeight: '700',
    marginBottom: 0,
  },

  brandName: {
    color: '#E53E3E',
    fontWeight: '700',
    includeFontPadding: false,
    marginTop: -2,
    marginBottom: 6,
    letterSpacing: 0.5, // matches the mock’s airy headline
  },

  subText: {
    color: '#777',
    marginBottom: 14,
  },

  featureCard: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },

  featureImage: {
    width: '100%',
    aspectRatio: 222 / 137, // preserves the exact artwork ratio
  },

  featureText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  proceedBtn: {
    backgroundColor: '#d94b4b',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  proceedText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
