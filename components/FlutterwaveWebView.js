// components/FlutterwaveWebView.js
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL, http } from '../config/api.config';

const FlutterwaveWebView = ({ route, navigation }) => {
    const { amount, order_id } = route.params;

    const handleWebViewMessage = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.event === 'success') {
                console.log('✅ Payment Success:', data.data);

                // Extract tx_ref or id from data (depends on how Flutterwave returns it)
                const tx_id = data.data?.id || data.data?.tx_ref || 'unknown';

                try {
                    const responseData = await http.post('/buyer/payment/confirmation', {
                        order_id,
                        tx_id,
                        amount,
                    });

                    console.log('✅ Payment confirmation response:', responseData);
                    Alert.alert('Success', 'Payment confirmed!');
                } catch (error) {
                    console.warn('⚠️ Server responded with error:', error);
                    Alert.alert('Error', error.message || 'Something went wrong.');
                }

                navigation.goBack();

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

    const flutterwaveUrl = `https://hmstech.xyz/flutterwave-payment.html?amount=${amount}&order_id=${order_id}`;

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
