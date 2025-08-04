// VerifyCodeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const VerifyCodeScreen = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProceed = () => {
    navigation.navigate('NewPass')
  };

  const handlePaste = () => {
    // You can implement Clipboard.getStringAsync() if using Expo
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../assets/forgotmain.png')} style={styles.backgroundImage} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#fff" fontWeight="400" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Reset you password via your registered email</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputCode}
            placeholder="Enter Code"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.timerText}>You can resend code in <Text style={styles.timerCountdown}>00:{timer < 10 ? `0${timer}` : timer}</Text></Text>

        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VerifyCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B91919',
  },
  backgroundImage: {
    position: 'absolute',
    width: 410,
    height: '70%',
  },
  backButton: {
    marginTop: 55,
    marginLeft: 30,
    zIndex: 2,
    backgroundColor: '#ff4444',
    width: 30,
    paddingVertical: 1,
    alignContent: 'center',
    borderRadius: 60,
  },
  card: {
    marginTop: '130%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    paddingTop: 20,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#E53E3E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#00000080',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 57,
    elevation: 1,
  },
  inputCode: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  pasteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderColor:"#E53E3E",
    borderWidth:0.7,
    borderRadius: 10,
  },
  pasteText: {
    color: '#E53E3E',
    fontWeight: '400',
    fontSize:10
  },
  timerText: {
    marginTop: 10,
    color: '#00000090',
    fontSize: 13,
  },
  timerCountdown: {
    color: '#E53E3E',
  },
  button: {
    backgroundColor: '#E53E3E',
    borderRadius: 15,
    marginTop: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
