import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';

const { width } = Dimensions.get('window');

const topStores = [
    {
        id: '1',
        name: 'Sasha Stores',
        rating: 4.5,
        tags: ['Electronics', 'Phones'],
        backgroundImage: require('../assets/Rectangle 30.png'),
        profileImage: require('../assets/Ellipse 18.png'),
        qtySold: 100,
        followers: 5,
        products: 100,
    },
    {
        id: '2',
        name: 'Sasha Stores',
        rating: 4.5,
        tags: ['Fashion', 'Trousers'],
        backgroundImage: require('../assets/Rectangle 30 (2).png'),
        profileImage: require('../assets/Ellipse 61.png'),
        qtySold: 100,
        followers: 5,
        products: 100,
    },
    // Add more stores as needed...
];

const TopStoresSection = () => {

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <ThemedText style={styles.title}>Top Stores</ThemedText>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Cards */}
            <FlatList
                data={topStores}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Background Image */}
                        <Image source={item.backgroundImage} style={styles.bgImage} />

                        {/* Profile Image */}
                        <Image source={item.profileImage} style={styles.profileImage} />
                        <Text style={styles.storeName}>{item.name}</Text>

                        {/* Store Info */}
                        <View style={styles.content}>

                            {/* Rating + Tags */}
                            <View style={[styles.ratingTagRow, { marginLeft: 65 }]}>
                                <View style={styles.tagsRow}>
                                    {item.tags.map((tag, i) => (
                                        <Text
                                            key={i}
                                            style={[
                                                styles.tag,
                                                {
                                                    backgroundColor: i % 2 === 0 ? '#0000FF33' : '#FF000033',
                                                    color: i % 2 === 0 ? '#0000FF' : '#FF0000',
                                                    borderColor: i % 2 === 0 ? '#0000FF' : '#FF0000',
                                                    borderWidth: 0.5
                                                },
                                            ]}
                                        >
                                            {tag}
                                        </Text>
                                    ))}
                                </View>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" color="red" size={16} />
                                    <Text style={styles.rating}>{item.rating}</Text>
                                </View>
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Footer: Qty, Followers, Go to Shop */}
                            <View style={styles.footerRow}>
                                <Image source={require('../assets/shop.png')} style={styles.statIcon} />
                                <View style={styles.statBlock}>
                                    <Text style={styles.statLabel}>Qty Sold</Text>
                                    <Text style={styles.statValue}>{item.qtySold}</Text>
                                </View>

                                <View style={styles.verticalDivider} />

                                <Image source={require('../assets/profile-2user.png')} style={styles.statIcon} />
                                <View style={styles.statBlock}>
                                    <Text style={styles.statLabel}>Followers</Text>
                                    <Text style={styles.statValue}>{item.followers}</Text>
                                </View>

                                <View style={styles.verticalDivider} />

                                <TouchableOpacity style={styles.shopBtn}>
                                    <Text style={styles.shopBtnText}>Go to Shop</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}
            />
        </View>
    );
};

export default TopStoresSection;

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
        marginBottom: 150
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
        width: width * 0.75,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
        elevation: 1
    },
    bgImage: {
        width: '100%',
        height: 100,
    },
    profileImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        top: 75,
        left: 16,
    },
    content: {
        paddingTop: 6,
        padding: 12,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 80,
    },
    ratingTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 40

    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        // marginRight: 12,
    },
    rating: {
        fontSize: 14,
        fontWeight: 400

    },
    tagsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    tag: {
        fontSize: 11,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        // backgroundColor: '#eee',
        marginVertical: 8,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stat: {
        alignItems: 'center',
        marginLeft: -20
    },
    statIcon: {
        width: 23,
        height: 23,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 9,
        color: '#888',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 2,
    },
    shopBtn: {
        backgroundColor: '#E53E3E',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
    },
    shopBtnText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '400',
    },
    statBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#ccc',
        marginHorizontal: 10,
    },

});
