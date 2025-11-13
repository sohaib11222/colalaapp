// components/FlutterwaveWebView.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, http } from '../config/api.config';

const FlutterwaveWebView = ({ route, navigation }) => {
    const { amount, order_id, isTopUp = false } = route.params;
    const [userEmail, setUserEmail] = useState(null);
    const [flutterwaveUrl, setFlutterwaveUrl] = useState(null);

    // Get user email from AsyncStorage
    useEffect(() => {
        const getUserEmail = async () => {
            try {
                const userData = await AsyncStorage.getItem('auth_user');
                if (userData) {
                    const user = JSON.parse(userData);
                    const email = user?.email;
                    setUserEmail(email);
                    
                    // Build URL with email if available
                    const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';
                    const url = `https://hmstech.xyz/flutterwave-payment.html?amount=${amount}&order_id=${order_id}${emailParam}`;
                    setFlutterwaveUrl(url);
                } else {
                    // No user data, build URL without email
                    const url = `https://hmstech.xyz/flutterwave-payment.html?amount=${amount}&order_id=${order_id}`;
                    setFlutterwaveUrl(url);
                }
            } catch (error) {
                console.log('Error getting user email:', error);
                // Build URL without email on error
                const url = `https://hmstech.xyz/flutterwave-payment.html?amount=${amount}&order_id=${order_id}`;
                setFlutterwaveUrl(url);
            }
        };

        getUserEmail();
    }, [amount, order_id]);

    const handleWebViewMessage = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('🔍 WebView message:', data);
            if (data.event === 'success') {
                console.log('✅ Payment Success:', data.data);

                // Extract tx_ref or id from data (depends on how Flutterwave returns it)
                const tx_id = data.data?.id || data.data?.tx_ref || 'unknown';

                try {
                    let responseData;
                    if (isTopUp) {
                        // For top-up, use the wallet/top-up endpoint with fixed amount of 1000
                        responseData = await http.post('/wallet/top-up', {
                            amount: 1000,
                        });
                        console.log('✅ Top-up confirmation response:', responseData);
                        Alert.alert('Success', 'Wallet topped up successfully!');
                    } else {
                        // For regular payment
                        responseData = await http.post('/buyer/payment/confirmation', {
                            order_id,
                            tx_id,
                            amount,
                        });
                        console.log('✅ Payment confirmation response:', responseData);
                        Alert.alert('Payment Successful', 'Your order has been placed and payment completed successfully!', [
                            { 
                                text: "View Orders", 
                                onPress: () => navigation.navigate('MainNavigator', { screen: 'Orders' })
                            },
                            { 
                                text: "Continue Shopping", 
                                onPress: () => navigation.navigate('MainNavigator', { screen: 'Home' })
                            },
                        ]);
                    }
                } catch (error) {
                    console.warn('⚠️ Server responded with error:', error);
                    Alert.alert('Error', error.message || 'Something went wrong.');
                    navigation.goBack();
                }

            } else if (data.event === 'failed') {
                Alert.alert('Payment Failed');
                navigation.goBack();
            } else if (data.event === 'closed') {
                navigation.goBack();
            }

        } catch (err) {
            console.error('❌ Error handling WebView message:', err);
            Alert.alert('Error', 'An unexpected error occurred.');
            navigation.goBack();
        }
    };

    // Don't render WebView until URL is ready
    if (!flutterwaveUrl) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#992C55" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: flutterwaveUrl }}
                onMessage={handleWebViewMessage}
                startInLoadingState
                renderLoading={() => <ActivityIndicator size="large" color="#992C55" />}
            />
        </View>
    );
};

export default FlutterwaveWebView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
    },
});
