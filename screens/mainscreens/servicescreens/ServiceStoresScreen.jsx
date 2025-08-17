import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ServiceStoresScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { serviceTitle } = route.params;

    const filters = ['Location', 'Store', 'Services', 'Price', 'Ratings', 'Sort by'];

    const stores = [
        {
            id: '1',
            name: 'Sasha Stores',
            price: '₦5,000 - ₦100,000',
            image: require('../../../assets/Rectangle 32.png'),
            rating: 4.5,
            profileImage: require('../../../assets/Ellipse 18.png'),
            service: 'Fashion designing Service',
        },
        {
            id: '2',
            name: 'Sasha Stores',
            price: '₦5,000 - ₦100,000',
            image: require('../../../assets/Frame 264 (4).png'),
            rating: 4.5,
            profileImage: require('../../../assets/Ellipse 18.png'),
            service: 'Fashion designing Service',
        },
        {
            id: '3',
            name: 'Sasha Stores',
            price: '₦5,000 - ₦100,000',
            image: require('../../../assets/Frame 264 (5).png'),
            rating: 4.5,
            profileImage: require('../../../assets/Ellipse 18.png'),
            service: 'Fashion designing Service',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color="#E53E3E" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{serviceTitle}</Text>
                    <View style={styles.headerIcons}>
                        <Ionicons name="cart-outline" size={22} color="#E53E3E" style={styles.icon} />
                        <Ionicons name="notifications-outline" size={22} color="#E53E3E" style={styles.icon} />
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search any product, shop or category"
                        placeholderTextColor="#888"
                        style={styles.searchInput}
                    />
                    <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {filters.map((label) => (
                    <TouchableOpacity key={label} style={styles.filterButton}>
                        <Text style={styles.filterText}>{label}</Text>
                        <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
                    </TouchableOpacity>
                ))}
            </View>


            {/* Store Cards */}
            <FlatList
                data={stores}
                numColumns={2}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={item.image} style={styles.cardImage} />
                        <View style={styles.cardHeader}>
                            <Image source={item.profileImage} style={styles.profileImage} />
                            <Text style={styles.storeName}>{item.name}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#E53E3E" />
                                <Text style={styles.rating}>{item.rating}</Text>
                            </View>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.serviceName}>{item.service}</Text>
                            <Text style={styles.price}>{item.price}</Text>
                            <TouchableOpacity
                                style={styles.detailsBtn}
                                onPress={() => navigation.navigate('SeviceDeatils', { store: item })}
                            >
                                <Text style={styles.detailsText}>Details</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )}

            />
        </View>
    );
};

export default ServiceStoresScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#E53E3E',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
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
        fontSize: 20,
        marginLeft: -120,
        fontWeight: '400',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    backBtn: {
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 30,
        zIndex:5
    },
    icon: {
        backgroundColor: '#fff',
        padding: 6,
        borderRadius: 30,
        marginLeft: 8,
    },
    searchContainer: {
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    cameraIcon: {
        marginLeft: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 25,
        paddingHorizontal: -5,
        paddingTop: 20,
        rowGap: -25,
        columnGap: 5
    },
    filterButton: {
        width: '30%',
        backgroundColor: '#EDEDED',
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderRadius: 7,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '400',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 10,
        width: '48.5%',
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 100,
    },
    cardBody: {
        padding: 10,
        paddingTop: 0
    },
    storeName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        fontWeight: 500
    },
    price: {
        fontSize: 13,
        color: '#E53E3E',
        marginBottom: 6,
        fontWeight: 700
    },
    detailsBtn: {
        backgroundColor: '#E53E3E',
        paddingVertical: 10,
        borderRadius: 10,
    },
    detailsText: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 400
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        padding: 6,
        backgroundColor: "#F2F2F2"
    },
    profileImage: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    rating: {
        fontSize: 10,
        marginLeft: 3,
        color: '#1A1A1A',
    },
    serviceName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 4,
    },

});
