import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ThemedText from '../../../components/ThemedText'; // 👈 import ThemedText

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

const services = [
    {
        id: '1', title: 'House Keeping', listings: 20, image: require('../../../assets/Rectangle 32 (1).png')
    },
    {
        id: '2', title: 'Gardening', listings: 20, image: require('../../../assets/Rectangle 32 (2).png')
    },
    {
        id: '3', title: 'Fashion Designing', listings: 20, image: require('../../../assets/Rectangle 32 (3).png')
    },
    {
        id: '4', title: 'Electronics Repair', listings: 20, image: require('../../../assets/Rectangle 32 (4).png')
    },
    {
        id: '5', title: 'Errand Running', listings: 20, image: require('../../../assets/Rectangle 32 (5).png')
    },
    {
        id: '6', title: 'Janitorial Services', listings: 20, image: require('../../../assets/Rectangle 32 (6).png')
    },
    {
        id: '7', title: 'Car Washing', listings: 20, image: require('../../../assets/Rectangle 32 (7).png')
    },
    {
        id: '8', title: 'Design Services', listings: 20, image: require('../../../assets/Rectangle 32 (8).png')
    },
    {
        id: '9', title: 'Hair Stylist', listings: 20, image: require('../../../assets/Rectangle 32 (9).png')
    },
];

const ServicesScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* 🔴 Header with Search */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={{ backgroundColor: "#fff", padding: 6, borderRadius: 30, marginLeft: 10, zIndex:5 }} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#E53E3E" />
                    </TouchableOpacity>
                    <ThemedText font='oleo' style={styles.headerTitle}>Services</ThemedText>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#fff", padding: 6, borderRadius: 25 }]}>
                            <Ionicons name="cart-outline" size={22} color="#E53E3E" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: "#fff", padding: 6, borderRadius: 25 }]}>
                            <Ionicons name="notifications-outline" size={22} color="#E53E3E" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🔍 Search Inside Header */}
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search any product, shop or category"
                        placeholderTextColor="#888"
                        style={styles.searchInput}
                    />
                    <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
                </View>
            </View>

            {/* ⚪️ Card Body Overlapping Header */}
            <View style={styles.bodyCard}>
                <TouchableOpacity style={styles.viewAllButton}>
                    <ThemedText style={styles.viewAllText}>View All Services</ThemedText>
                </TouchableOpacity>

                <FlatList
                    key={'three-columns'}
                    numColumns={3}
                    data={services}
                    keyExtractor={(item) => item.id}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 14 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('ServiceStore', { serviceTitle: item.title })}
                        >
                            <Image source={item.image} style={styles.cardImage} />
                            <View style={styles.cardInfo}>
                                <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                                <ThemedText style={styles.cardListings}>{item.listings} Listings</ThemedText>
                            </View>
                        </TouchableOpacity>

                    )}
                />
            </View>
        </View>

    );
};

export default ServicesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#E53E3E',
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        zIndex: 1,
        borderBottomRightRadius: 24,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#fff',
        fontSize: 24,
        marginLeft: -180,
        fontWeight: '400',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    searchContainer: {
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        height: 57,

    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    cameraIcon: {
        marginLeft: 8,
    },
    viewAllButton: {
        backgroundColor: '#E53E3E',
        marginHorizontal: 16,
        borderRadius: 15,
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 45,
        marginBottom: 20
    },
    viewAllText: {
        color: '#fff',
        fontWeight: '400',
        fontSize: 14,
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 5,
        backgroundColor: '#fff',
        elevation: 2,
        overflow: 'hidden',
        height: 130
    },
    cardImage: {
        width: '100%',
        height: 70,
    },
    cardInfo: {
        padding: 6,
    },
    bodyCard: {
        backgroundColor: '#F9F9F9',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -40,
        paddingHorizontal: 16,
        paddingTop: 20,
        flex: 1,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: '500',
        color: '#222',
    },
    cardListings: {
        fontSize: 9,
        color: '#888',
        marginTop: 2,
    },
    iconButton: {
        marginLeft: 9,
    },
});
