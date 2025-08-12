import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const ServiceDetailsScreen = () => {
    const { params } = useRoute();
    const navigation = useNavigation();
    const { store } = params;
    
    const priceBreakdown = [
        'General',
        'Male Wear',
        'Female wear',
        'Kids Wear',
        'Wedding Wears',
        'Tents',
    ];

    return (
        <ScrollView style={styles.container}>
            <StatusBar style='dark' />
            {/* Top Image */}
            <View style={styles.topHeader}>
                <TouchableOpacity style={{ padding: 3, borderColor: "#ccc", borderWidth: 1, borderRadius: 20 }} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.topHeaderTitle}>Service Details</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={{ padding: 5, borderColor: "#ccc", borderWidth: 1, borderRadius: 30 }} >
                        <Ionicons name="ellipsis-vertical" size={22} color="#000" /></TouchableOpacity>
                    <TouchableOpacity style={{ padding: 5, borderColor: "#ccc", borderWidth: 1, borderRadius: 30 }}>
                        <Ionicons name="heart-outline" size={22} color="#000" /></TouchableOpacity>
                </View>
            </View>

            <View style={styles.imageContainer}>
                <Image source={store.image} style={styles.mainImage} />
                <View style={styles.videoIcon}>
                    <Ionicons name="videocam" size={30} color="#fff" />
                </View>

                {/* Store Info Overlay */}
                <View style={styles.storeOverlay}>
                    <Image source={store.profileImage} style={styles.avatar} />
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#E53E3E" />
                        <Text style={[styles.ratingText, {
                            color: "#fff"
                        }]}>4.5</Text>
                    </View>
                </View>
            </View>


            {/* Gallery */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {[store.image, store.image, store.image].map((img, index) => (
                    <Image key={index} source={img} style={styles.thumbnail} />
                ))}
            </ScrollView>

            <View style={styles.details}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{store.service}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#E53E3E" />
                        <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                </View>


                <Text style={styles.price}>{store.price}</Text>
                <View style={styles.divider} />
                {/* Description */}
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>
                    We sew all kinds of dresses, we are your one stop shop for any form of dresses
                </Text>
                <View style={styles.divider} />

                {/* Price Breakdown */}
                <Text style={styles.sectionTitle}>Price Breakdown</Text>
                {priceBreakdown.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === priceBreakdown.length - 1;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.priceRow,
                                isFirst && styles.firstPriceRow,
                                isLast && styles.lastPriceRow,
                            ]}
                        >
                            <Text style={styles.breakdownLabel}>{item}</Text>
                            <Text style={styles.breakdownPrice}>{store.price}</Text>
                        </View>
                    );
                })}

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="logo-whatsapp" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="call-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="chatbox-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.messageBtn}
                        onPress={() => navigation.navigate('ServiceChat', { store })}
                    >
                        <Text style={styles.messageText}>Message Store</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
    );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mainImage: { width: '100%', height: 250 },
    topHeader: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    topHeaderTitle: {
        fontSize: 18,
        fontWeight: '400',
        color: '#000',
        marginLeft: 30
    },

    backBtn: {
        position: 'absolute',
        top: 50,
        left: 16,
        backgroundColor: '#0006',
        padding: 6,
        borderRadius: 20,
    },
    videoIcon: {
        position: 'absolute',
        top: 120,
        left: '48%',
        fontSize: 32,
        color: '#fff',
    },
    imageContainer: {
        position: 'relative',
    },
    videoIcon: {
        position: 'absolute',
        top: '40%',
        left: '45%',
        backgroundColor: '#000000CC',
        padding: 20,
        borderRadius: 40,
    },
    storeOverlay: {
        position: 'absolute',

        bottom: 0,
        width: '100%',
        backgroundColor: '#000000B2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },
    storeName: {
        color: '#fff',
        fontSize: 12,
        marginRight: 'auto',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
    },

    gallery: { flexDirection: 'row', padding: 10 },
    thumbnail: { width: 60, height: 60, borderRadius: 10, marginRight: 8 },
    details: { paddingHorizontal: 16 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { marginLeft: 4, fontSize: 14 },
    price: { color: '#E53E3E', fontSize: 16, fontWeight: 'bold', marginVertical: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
    description: { fontSize: 13, color: '#444' },
    firstPriceRow: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    lastPriceRow: {
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },

    priceRow: {
        backgroundColor: '#EDEDED',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 5,
        marginVertical: 1.5,
    },
    breakdownLabel: { fontSize: 13 },
    breakdownPrice: { fontSize: 13, color: '#E53E3E' },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 40, // adds spacing at the bottom
        gap: 10,
    },

    iconBtn: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 15,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },

    messageBtn: {
        flex: 1,
        backgroundColor: '#E53E3E',
        paddingVertical: 14,
        borderRadius: 15,
    },
    messageText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 12,
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
});
