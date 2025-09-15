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
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const topProducts = [
    {
        id: '1',
        title: 'Dell Inspiron Laptop',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        location: 'Lagos, Nigeria',
        rating: 4.5,
        price: '₦2,000,000',
        originalPrice: '₦3,000,000',
        image: require('../assets/Frame 264.png'), // Replace with actual
        tagImages: [
            require('../assets/freedel.png'),
            require('../assets/bulk.png'),
        ],
    },
    {
        id: '2',
        title: 'Dell Inspiron Laptop',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        location: 'Lagos, Nigeria',
        rating: 4.5,
        price: '₦2,000,000',
        originalPrice: '₦3,000,000',
        image: require('../assets/Frame 264 (1).png'),
        tagImages: [
            require('../assets/freedel.png'),
            require('../assets/bulk.png'),
        ],
    },
     {
        id: '3',
        title: 'Dell Inspiron Laptop',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        location: 'Lagos, Nigeria',
        rating: 4.5,
        price: '₦2,000,000',
        originalPrice: '₦3,000,000',
        image: require('../assets/Frame 264 (2).png'),
        tagImages: [
            require('../assets/freedel.png'),
            require('../assets/bulk.png'),
        ],
    },
     {
        id: '4',
        title: 'Dell Inspiron Laptop',
        store: 'Sasha Stores',
        store_image: require('../assets/Ellipse 18.png'),
        location: 'Lagos, Nigeria',
        rating: 4.5,
        price: '₦2,000,000',
        originalPrice: '₦3,000,000',
        image: require('../assets/Frame 264 (3).png'),
        tagImages: [
            require('../assets/freedel.png'),
            require('../assets/bulk.png'),
        ],
    },

    // Add more...
];

const TopSellingSection = () => {
    return (
        <View style={styles.container}>
            <StatusBar style='light' />
            <View style={styles.headerRow}>
                <ThemedText style={styles.title}>Top Selling</ThemedText>
                <TouchableOpacity>
                    <ThemedText style={styles.viewAll}>View All</ThemedText>
                </TouchableOpacity>
            </View>

            <FlatList
                data={topProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-around', gap: 10 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={item.image} style={styles.image} resizeMode="cover" />
                        <View>
                            <View style={[styles.rowBetween, { backgroundColor: "#F2F2F2", width: "100%", padding: 5 }]}>
                                <View style={styles.storeRow}>
                                    <Image
                                        source={item.store_image} // 👈 replace with actual store avatar
                                        style={styles.storeAvatar}
                                    />
                                    <ThemedText style={styles.storeName}>{item.store}</ThemedText>
                                </View>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" color="#FF0000" size={10} />
                                    <ThemedText style={styles.rating}>{item.rating}</ThemedText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.infoContainer}>
                            <ThemedText style={styles.productTitle}>{item.title}</ThemedText>

                            <View style={styles.priceRow}>
                                <ThemedText style={styles.price}>{item.price}</ThemedText>
                                <ThemedText style={styles.originalPrice}>{item.originalPrice}</ThemedText>
                            </View>

                            {/* Tag Images */}
                            <View style={styles.tagsRow}>
                                {item.tagImages.map((tagImg, index) => (
                                    <Image
                                        key={index}
                                        source={tagImg}
                                        style={styles.tagIcon}
                                        resizeMode="contain"
                                    />
                                ))}
                            </View>

                            <View style={styles.rowBetween}>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={12} color="#444" style={{ marginRight: 2 }} />
                                    <ThemedText style={styles.location}>{item.location}</ThemedText>
                                </View>
                                <TouchableOpacity>
                                    <Image source={require('../assets/Frame 265.png')} style={{ width: 30, height: 30, resizeMode: 'contain' }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export default TopSellingSection;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 12,
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
        textDecorationLine:'underline'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginTop: 12,
        width: cardWidth,
        overflow: 'hidden',
        elevation: 1
    },
    image: {
        width: '100%',
        height: 120,
    },
    sponsoredText: {
        color: 'white',
        fontSize: 10,
    },
    infoContainer: {
        padding: 10,
    },
    storeName: {
        fontSize: 9,
        color: '#E53E3E',
        fontWeight: '400',
    },
    productTitle: {
        fontSize: 11,
        fontWeight: '500',
        marginVertical: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        color: '#F44336',
        fontWeight: 'bold',
        fontSize: 13,
        marginRight: 6,
    },
    originalPrice: {
        color: '#999',
        fontSize: 10,
        textDecorationLine: 'line-through',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 2,
        fontSize: 9,
        color: '#000',
    },
    tagsRow: {
        flexDirection: 'row',
        marginTop: 3,
        gap: 3,
    },
    tagIcon: {
        width: 54,
        height: 12,
        borderRadius: 50
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        fontSize: 7,
        color: '#444',
        fontWeight: 500
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 6,
    },
    storeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storeAvatar: {
        width: 16,
        height: 16,
        borderRadius: 12,
        marginRight: 6,
    },
});
