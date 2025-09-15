import React from 'react';
import ThemedText from './ThemedText';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const services = [
    {
        id: '1',
        title: 'Fashion designing Service',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        priceRange: '₦5,000 - ₦100,000',
        rating: 4.5,
        image: require('../assets/Frame 264 (4).png'),
    },
    {
        id: '2',
        title: 'Fashion designing Service',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        priceRange: '₦5,000 - ₦100,000',
        rating: 4.5,
        image: require('../assets/Frame 264 (5).png'),
    },
    {
        id: '3',
        title: 'Fashion designing Service',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        priceRange: '₦5,000 - ₦100,000',

        rating: 4.5,
        image: require('../assets/Rectangle 32.png'),
    },
];

const FeaturedServices = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <ThemedText style={styles.title}>Features Services</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={styles.viewAll}>View All</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Scrollable Cards */}
            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={item.image} style={styles.image} resizeMode="cover" />

                        {/* Store Row */}
                        <View style={styles.rowBetween}>
                            <View style={styles.storeRow}>
                                <Image
                                    source={item.store_image}
                                    style={styles.storeAvatar}
                                />
                                <ThemedText style={styles.storeName}>{item.store}</ThemedText>
                            </View>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={10} color="#FF0000" />
                                <ThemedText style={styles.rating}>{item.rating}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.cardContent}>
                            <ThemedText style={styles.serviceTitle}>{item.title}</ThemedText>
                            <ThemedText style={styles.priceRange}>{item.priceRange}</ThemedText>

                            <TouchableOpacity style={styles.detailsBtn}>
                                <ThemedText style={styles.detailsBtnText}>Details</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export default FeaturedServices;

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    headerRow: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    viewAll: {
        color: 'white',
        fontSize: 13,
        textDecorationLine: 'underline'

    },
    card: {
        width: width * 0.5,
        backgroundColor: '#fff',
        borderRadius: 14,
        marginRight: 16,
        overflow: 'hidden',
        elevation: 1
    },
    image: {
        width: '100%',
        height: 100,
    },
    cardContent: {
        padding: 10,
    },
    rowBetween: {
        flexDirection: 'row',
        backgroundColor: "#F2F2F2",
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeAvatar: {
        width: 16,
        height: 16,
        borderRadius: 9,
        marginRight: 6,
    },
    storeName: {
        fontSize: 9,
        color: '#F44336',
        fontWeight: '400',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 3,
        fontSize: 8,
        color: '#000',
    },
    serviceTitle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
    },
    priceRange: {
        fontSize: 12,
        color: '#F44336',
        marginVertical: 6,
        fontWeight: 'bold',
    },
    detailsBtn: {
        backgroundColor: '#F44336',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    detailsBtnText: {
        color: 'white',
        fontSize: 9,
        fontWeight: '400',
    },
});
