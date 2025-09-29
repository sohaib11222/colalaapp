import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // <-- changed
import ThemedText from '../../components/ThemedText';
import { useLogin, setAuthToken } from '../../config/api.config'; // <-- our hook & token helper
import AsyncStorage from "@react-native-async-storage/async-storage";


const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);

  // controlled inputs
  const [email, setEmail] = useState('hmstech11@gmail.com');
  const [password, setPassword] = useState('newpassword123');

  // mutation
  const login = useLogin({
    onSuccess: async (res) => {
      // API shape you shared:
      // { status: "success", data: { user: {...}, token: "..." }, message: "user login successfully" }
      const token = res?.data?.token;
      const user  = res?.data?.user;
      if (token) await setAuthToken(token);
      // optionally persist user:
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      navigation.replace('MainNavigator');
    },
    onError: (err) => {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Unable to log in, please check your credentials.';
      Alert.alert('Login failed', msg);
    },
  });

  const onSubmit = () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    login.mutate({ email: email.trim(), password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Image Banner */}
          <Image source={require('../../assets/mainimage.png')} style={styles.topImage} />

          {/* White Card Container */}
          <View style={styles.card}>
            <ThemedText style={styles.title}>Login</ThemedText>
            <ThemedText style={styles.subtitle}>Login to your account</ThemedText>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Image
                source={require('../../assets/sms.png')}
                style={styles.iconImg}
                accessibilityLabel="Email icon"
              />
              <TextInput
                placeholder="Enter email address"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Image
                source={require('../../assets/lock.png')}
                style={styles.iconImg}
                accessibilityLabel="Password icon"
              />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#999"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible((v) => !v)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                style={styles.iconButton}
              >
                <Image
                  source={require('../../assets/eye.png')}
                  style={styles.iconImg}
                  accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={onSubmit}
              style={styles.loginButton}
              activeOpacity={0.9}
              disabled={login.isPending}
            >
              {login.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.loginText}>Login</ThemedText>
              )}
            </TouchableOpacity>

            {/* Create Account */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.createAccountButton}
              activeOpacity={0.9}
            >
              <ThemedText style={styles.createAccountText}>Create Account</ThemedText>
            </TouchableOpacity>

            {/* Links */}
            <View style={styles.rowLinks}>
              <TouchableOpacity>
                <ThemedText style={styles.linkText}>Continue as guest</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')}>
                <ThemedText style={styles.linkText}>Forgot Password ?</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Gradient Bottom Box */}
            <LinearGradient
              colors={['#F90909', '#920C5F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomGradient}
            >
              <ThemedText style={styles.sellerText}>
                Do you want to sell on Colala Mall as a store
              </ThemedText>
              <View style={styles.storeButtons}>
                <TouchableOpacity style={{ marginLeft: -100 }}>
                  <Image source={require('../../assets/image 58.png')} style={styles.storeImage} />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginRight: 10 }}>
                  <Image source={require('../../assets/image 57.png')} style={styles.storeImage} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D5232C' },
  topImage: { width: '100%', height: 400, resizeMode: 'cover' },

  card: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: -40,
  },

  title: { fontSize: 24, fontWeight: '600', color: '#D5232C', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 24 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 57,
    marginBottom: 14,
    elevation: 1,
  },
  input: { flex: 1, fontSize: 16, color: '#000' },

  iconImg: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  iconButton: { paddingLeft: 6, paddingVertical: 6 },

  loginButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  loginText: { color: '#fff', fontSize: 14, fontWeight: '400' },

  createAccountButton: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  createAccountText: { color: '#000', fontSize: 14 },

  rowLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  linkText: { color: '#D5232C', fontSize: 14 },

  bottomGradient: { borderRadius: 16, padding: 16, paddingLeft: 30, alignItems: 'center' },
  sellerText: { color: '#fff', fontSize: 11, marginLeft: -50, marginBottom: 15, textAlign: 'center' },
  storeButtons: { flexDirection: 'row', justifyContent: 'flex-start' },
  storeImage: { width: 100, height: 30, borderRadius: 15, resizeMode: 'contain' },
});

export default LoginScreen;
