import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ThemedText from '../../components/ThemedText';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const features = [
  {
    id: 1,
    image: require('../../assets/Rectangle 157.png'), // replace with your actual image
    text: 'Shop from variety of unique stores nationwide across several categories',
  },
  {
    id: 2,
      image: require('../../assets/Rectangle 157 (1).png'),// replace with your actual image
    text: 'Chat and communicate easily with stores via the in-app chat',
  },
    {
    id: 3,
      image: require('../../assets/Rectangle 157 (2).png'),// replace with your actual image
    text: 'Personalized social media feeds to see latest posts from stores across colala',
  },
  // Add more features as needed
];

const OnboardingScreen = () => {

    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar style='light'/>
      {/* Main background image */}
      <Image
        source={require('../../assets/image 54.png')} // replace with your image
        style={styles.mainImage}
        resizeMode="cover"
      />

      {/* Bottom card overlay */}
      <View style={styles.overlayCard}>
        <ThemedText font='oleo' style={styles.welcomeText}>Welcome to</ThemedText>
        <ThemedText font='oleo'  style={styles.brandName}>COLALA</ThemedText>
        <ThemedText style={styles.subText}>Why Choose Colala ?</ThemedText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {features.map((item) => (
            <View key={item.id} style={styles.featureCard}>
              <Image source={item.image} style={styles.featureImage} />
              <ThemedText style={styles.featureText}>{item.text}</ThemedText>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={()=>navigation.navigate('Login')}  style={styles.proceedBtn}>
          <ThemedText style={styles.proceedText}>Proceed</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    // zIndex: -1,
  },
  overlayCard: {
    flex: 1,
    marginTop: '90%',
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#E53E3E',
    fontWeight: 'bold',
    marginBottom: -5,
  },
  brandName: {
    fontSize: 90,
    color: '#E53E3E',
    fontWeight: 'bold',
    // fontFamily: 'serif',
    marginBottom: -1,
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
  featureCard: {
    width: width * 0.54,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    paddingTop:0,
    marginRight: 15,
    alignItems: 'center',
    elevation:2,
    marginBottom:3,
  },
  featureImage: {
    width: 222,
    height: 137,
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  featureText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  proceedBtn: {
    backgroundColor: '#d63031',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
  },
  proceedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
  },
});
