// // VerifyCodeScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import ThemedText from '../../components/ThemedText'; // 👈 import ThemedText

// const VerifyCodeScreen = () => {
//   const navigation = useNavigation();
//   const [code, setCode] = useState('');
//   const [timer, setTimer] = useState(59);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleProceed = () => {
//     navigation.navigate('NewPass')
//   };

//   const handlePaste = () => {
//     // You can implement Clipboard.getStringAsync() if using Expo
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Image source={require('../../assets/forgotmain.png')} style={styles.backgroundImage} />

//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="chevron-back" size={26} color="#fff" fontWeight="400" />
//       </TouchableOpacity>

//       <View style={styles.card}>
//         <ThemedText style={styles.title}>Reset Password</ThemedText>
//         <ThemedText style={styles.subtitle}>Reset you password via your registered email</ThemedText>

//         <View style={styles.inputWrapper}>
//           <TextInput
//             style={styles.inputCode}
//             placeholder="Enter Code"
//             placeholderTextColor="#999"
//             value={code}
//             onChangeText={setCode}
//           />
//           <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
//             <ThemedText style={styles.pasteText}>Paste</ThemedText>
//           </TouchableOpacity>
//         </View>

//         <ThemedText style={styles.timerText}>
//           You can resend code in{" "}
//           <ThemedText style={styles.timerCountdown}>
//             00:{timer < 10 ? `0${timer}` : timer}
//           </ThemedText>
//         </ThemedText>

//         <TouchableOpacity style={styles.button} onPress={handleProceed}>
//           <ThemedText style={styles.buttonText}>Proceed</ThemedText>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default VerifyCodeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#B91919',
//   },
//   backgroundImage: {
//     position: 'absolute',
//     width: 410,
//     height: '70%',
//   },
//   backButton: {
//     marginTop: 55,
//     marginLeft: 30,
//     zIndex: 2,
//     backgroundColor: '#ff4444',
//     width: 30,
//     paddingVertical: 1,
//     alignContent: 'center',
//     borderRadius: 60,
//   },
//   card: {
//     marginTop: '130%',
//     backgroundColor: '#F9F9F9',
//     padding: 20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     elevation: 10,
//     paddingTop: 20,
//     height: 300,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#E53E3E',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#00000080',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 15,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     height: 57,
//     elevation: 1,
//   },
//   inputCode: {
//     flex: 1,
//     fontSize: 16,
//     color: '#000',
//   },
//   pasteButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#fff',
//     borderColor:"#E53E3E",
//     borderWidth:0.7,
//     borderRadius: 10,
//   },
//   pasteText: {
//     color: '#E53E3E',
//     fontWeight: '400',
//     fontSize:10
//   },
//   timerText: {
//     marginTop: 10,
//     color: '#00000090',
//     fontSize: 13,
//   },
//   timerCountdown: {
//     color: '#E53E3E',
//   },
//   button: {
//     backgroundColor: '#E53E3E',
//     borderRadius: 15,
//     marginTop: 20,
//     paddingVertical: 18,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });
// screens/Auth/VerifyCodeScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import * as Clipboard from 'expo-clipboard';
// import ThemedText from '../../components/ThemedText';
// import { useVerifyOtp } from '../../config/api.config';

// const VerifyCodeScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const emailFromParam = route.params?.email || ''; // passed from ForgotPasswordScreen

//   const [code, setCode] = useState('');
//   const [timer, setTimer] = useState(59);

//   const { mutateAsync, isPending } = useVerifyOtp();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleProceed = async () => {
//     if (!code.trim()) {
//       Alert.alert('Required', 'Please enter the verification code.');
//       return;
//     }
//     try {
//       // most backends expect both email + code
//       const res = await mutateAsync({ email: emailFromParam, otp: code });
//       // You can inspect res?.message if you want
//       navigation.navigate('NewPass', { email: emailFromParam, code });
//     } catch (err) {
//       Alert.alert('Error', err?.message || 'Invalid code. Please try again.');
//     }
//   };

//   const handlePaste = async () => {
//     try {
//       const clip = await Clipboard.getStringAsync();
//       if (clip) setCode(clip.trim());
//     } catch {
//       // ignore
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Lifts on keyboard open; returns when closed */}
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <Image source={require('../../assets/forgotmain.png')} style={styles.backgroundImage} />

//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.card}>
//           <ThemedText style={styles.title}>Reset Password</ThemedText>
//           <ThemedText style={styles.subtitle}>
//             Reset you password via your registered email
//           </ThemedText>

//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.inputCode}
//               placeholder="Enter Code"
//               placeholderTextColor="#999"
//               value={code}
//               onChangeText={setCode}
//               keyboardType="number-pad"
//               returnKeyType="done"
//               onSubmitEditing={handleProceed}
//             />
//             <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
//               <ThemedText style={styles.pasteText}>Paste</ThemedText>
//             </TouchableOpacity>
//           </View>

//           <ThemedText style={styles.timerText}>
//             You can resend code in{' '}
//             <ThemedText style={styles.timerCountdown}>
//               00:{timer < 10 ? `0${timer}` : timer}
//             </ThemedText>
//           </ThemedText>

//           <TouchableOpacity
//             style={[styles.button, isPending && { opacity: 0.7 }]}
//             onPress={handleProceed}
//             disabled={isPending}
//           >
//             {isPending ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <ThemedText style={styles.buttonText}>Proceed</ThemedText>
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default VerifyCodeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#B91919',
//   },
//   backgroundImage: {
//     position: 'absolute',
//     width: 410,
//     height: '70%',
//   },
//   backButton: {
//     marginTop: 55,
//     marginLeft: 30,
//     zIndex: 2,
//     backgroundColor: '#ff4444',
//     width: 30,
//     paddingVertical: 1,
//     alignContent: 'center',
//     borderRadius: 60,
//   },
//   card: {
//     marginTop: '130%',
//     backgroundColor: '#F9F9F9',
//     padding: 20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     elevation: 10,
//     paddingTop: 20,
//     height: 300,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#E53E3E',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#00000080',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 15,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     height: 57,
//     elevation: 1,
//   },
//   inputCode: {
//     flex: 1,
//     fontSize: 16,
//     color: '#000',
//   },
//   pasteButton: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#fff',
//     borderColor: '#E53E3E',
//     borderWidth: 0.7,
//     borderRadius: 10,
//   },
//   pasteText: {
//     color: '#E53E3E',
//     fontWeight: '400',
//     fontSize: 10,
//   },
//   timerText: {
//     marginTop: 10,
//     color: '#00000090',
//     fontSize: 13,
//   },
//   timerCountdown: {
//     color: '#E53E3E',
//   },
//   button: {
//     backgroundColor: '#E53E3E',
//     borderRadius: 15,
//     marginTop: 20,
//     paddingVertical: 18,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


// screens/Auth/VerifyCodeScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import ThemedText from '../../components/ThemedText';
import { useVerifyOtp, useForgotPassword } from '../../config/api.config';

const VerifyCodeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const emailFromParam = route.params?.email || '';
  const flow = route.params?.flow || 'forgot_password'; // 'registration' or 'forgot_password'

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);
  const [initialSendDone, setInitialSendDone] = useState(false);

  const { mutateAsync: verifyAsync, isPending: verifying } = useVerifyOtp();
  const { mutateAsync: resendAsync, isPending: resending } = useForgotPassword();
  
  const isRegistrationFlow = flow === 'registration';

  // Avoid double auto-send
  const autoSentRef = useRef(false);

  // Auto-send code once on mount (only for forgot password flow)
  // For registration, OTP is already sent during registration
  useEffect(() => {
    if (isRegistrationFlow) {
      // For registration, OTP is sent during registration, so we just start the timer
      setInitialSendDone(true);
      setTimer(59);
      return;
    }
    
    const doAutoSend = async () => {
      if (autoSentRef.current || !emailFromParam) return;
      autoSentRef.current = true;
      try {
        await resendAsync({ email: emailFromParam });
        setInitialSendDone(true);
        setTimer(59); // start countdown AFTER a successful send
      } catch (err) {
        setInitialSendDone(false);
        Alert.alert('Error', err?.message || 'Unable to send code. You can try Resend.');
      }
    };
    doAutoSend();
  }, [emailFromParam, resendAsync, isRegistrationFlow]);

  // countdown (only tick while > 0)
  useEffect(() => {
    if (!initialSendDone) return; // don’t tick until we’ve sent at least once
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [timer, initialSendDone]);

  const restartTimer = useCallback(() => setTimer(59), []);

  const handleProceed = async () => {
    if (!code.trim()) {
      Alert.alert('Required', 'Please enter the verification code.');
      return;
    }
    try {
      await verifyAsync({ email: emailFromParam, otp: code });
      
      if (isRegistrationFlow) {
        // For registration, navigate to Login after successful verification
        Alert.alert('Success', 'Email verified successfully. You can now login.');
        navigation.navigate('Login');
      } else {
        // For forgot password, navigate to NewPass screen
        navigation.navigate('NewPass', { email: emailFromParam, code });
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Invalid code. Please try again.');
    }
  };

  const handlePaste = async () => {
    try {
      const clip = await Clipboard.getStringAsync();
      if (clip) setCode(clip.trim());
    } catch {}
  };

  const handleResend = async () => {
    if (!emailFromParam) {
      Alert.alert('Missing email', 'Please go back and enter your email again.');
      return;
    }
    try {
      if (isRegistrationFlow) {
        // For registration, we might need a resend registration OTP endpoint
        // For now, use the same forgot password endpoint as it might work
        await resendAsync({ email: emailFromParam });
      } else {
        await resendAsync({ email: emailFromParam });
      }
      Alert.alert('Code sent', 'A new verification code has been sent to your email.');
      setInitialSendDone(true);
      restartTimer();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Unable to resend code. Please try again.');
    }
  };

  const canResend = timer === 0 && !resending;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Image source={require('../../assets/forgotmain.png')} style={styles.backgroundImage} />

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          <ThemedText style={styles.title}>
            {isRegistrationFlow ? 'Verify Email' : 'Reset Password'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isRegistrationFlow 
              ? 'Please enter the verification code sent to your email'
              : 'Reset you password via your registered email'}
          </ThemedText>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputCode}
              placeholder="Enter Code"
              placeholderTextColor="#999"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleProceed}
            />
            <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
              <ThemedText style={styles.pasteText}>Paste</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.timerText}>
            You can resend code in{' '}
            <ThemedText style={styles.timerCountdown}>
              00:{timer < 10 ? `0${timer}` : timer}
            </ThemedText>
          </ThemedText>

          {/* Resend row (enabled only when timer hits 0) */}
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend}
              style={[styles.resendBtn, !canResend && styles.resendBtnDisabled]}
            >
              {resending ? (
                <ActivityIndicator color="#E53E3E" />
              ) : (
                <ThemedText
                  style={[
                    styles.resendText,
                    !canResend && { color: '#aaa', textDecorationLine: 'none' },
                  ]}
                >
                  Resend Code
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, verifying && { opacity: 0.7 }]}
            onPress={handleProceed}
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Proceed</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyCodeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B91919' },
  backgroundImage: { position: 'absolute', width: 410, height: '70%' },
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
    marginTop: '120%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    paddingTop: 20,
    height: 350,

  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8, color: '#E53E3E', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#00000080', textAlign: 'center', marginBottom: 20 },
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
  inputCode: { flex: 1, fontSize: 16, color: '#000' },
  pasteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderColor: '#E53E3E',
    borderWidth: 0.7,
    borderRadius: 10,
  },
  pasteText: { color: '#E53E3E', fontWeight: '400', fontSize: 10 },
  timerText: { marginTop: 10, color: '#00000090', fontSize: 13 },
  timerCountdown: { color: '#E53E3E' },
  resendBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 2 },
  resendBtnDisabled: { opacity: 1 },
  resendText: { color: '#E53E3E', fontSize: 13, textDecorationLine: 'underline' },
  button: { backgroundColor: '#E53E3E', borderRadius: 15, marginTop: 20, paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
