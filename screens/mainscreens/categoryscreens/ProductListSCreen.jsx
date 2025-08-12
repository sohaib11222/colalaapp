// ✅ UPDATED: Dynamic Store Structure for All Products
// This version ensures you pass the full `store` object when navigating to ProductDetails.

import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    SafeAreaView,
    ScrollView,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

const ProductsListScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { categoryTitle } = route.params;

    const filters = ['Location', 'Store', 'Brand', 'Price', 'Ratings', 'Sort by'];

    const storeDetails = {
        name: "Sasha Stores",
        logo: require("../../../assets/Ellipse 18.png"),
        background: require("../../../assets/Rectangle 30.png"),
        location: "Lagos, Nigeria",
        rating: 4.5,
        categories: ["Electronics", "Phones"],
        social: {
            whatsapp: require("../../../assets/logos_whatsapp-icon.png"),
            instagram: require("../../../assets/skill-icons_instagram.png"),
            x: require("../../../assets/pajamas_twitter.png"),
            facebook: require("../../../assets/logos_facebook.png"),
        },
        sold: 100,
        followers: 5,
    };

    const trendingProducts = [
        { id: "1", title: "iPhone 16 pro max, black", price: "2,000,000", image: require("../../../assets/phone3.png"), store: storeDetails },
        { id: "2", title: "iPhone 12 pro", price: "2,000,000", image: require("../../../assets/phone4.png"), store: storeDetails },
        { id: "3", title: "iPhone 12 pro", price: "2,000,000", image: require("../../../assets/phone4.png"), store: storeDetails },
    ];

    const newArrivals = [
        { id: "4", title: "Lenovo Smartphone", price: "2,000,000", image: require("../../../assets/phone3.png"), store: storeDetails },
        { id: "5", title: "Samsung S8 plus", price: "2,000,000", image: require("../../../assets/Frame 253.png"), store: storeDetails },
    ];

    const allProducts = [
        {
            id: "6",
            title: "iPhone 12 pro",
            store: storeDetails,
            price: "₦2,000,000",
            originalPrice: "₦3,000,000",
            image: require("../../../assets/phone5.png"),
            tagImages: [require("../../../assets/freedel.png"), require("../../../assets/bulk.png")],
        },
        {
            id: "7",
            title: "Samsung s24 ultra",
            store: storeDetails,
            price: "₦2,000,000",
            originalPrice: "₦3,000,000",
            image: require("../../../assets/phone5.png"),
            tagImages: [require("../../../assets/freedel.png")],
        },
    ];

    const renderHorizontalProduct = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { product: item })}>
            <View style={styles.horizontalCard}>
                <Image source={item.image} style={styles.horizontalImage} />
                <View style={[styles.rowBetween, { backgroundColor: "#F2F2F2", width: "100%", padding: 4 }]}>
                    <View style={styles.storeRow}>
                        <Image source={item.store.logo} style={styles.storeAvatar} />
                        <Text style={styles.storeNameCard}>{item.store.name}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" color="red" size={12} />
                        <Text style={styles.rating}>{item.store.rating}</Text>
                    </View>
                </View>
                <View style={{ padding: 6 }}>
                    <Text numberOfLines={1} style={styles.productTitleCard}>{item.title}</Text>
                    <Text style={styles.price}>₦{item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderAllProductCard = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { product: item })}>
            <View style={styles.card}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
                <View style={[styles.rowBetween, { backgroundColor: "#F2F2F2", width: "100%", padding: 5 }]}>
                    <View style={styles.storeRow}>
                        <Image source={item.store.logo} style={styles.storeAvatar} />
                        <Text style={styles.storeNameCard}>{item.store.name}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" color="red" size={12} />
                        <Text style={styles.rating}>{item.store.rating}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.productTitleCard}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{item.price}</Text>
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                    </View>

                    <View style={styles.tagsRow}>
                        {item.tagImages?.map((tagImg, index) => (
                            <Image key={index} source={tagImg} style={styles.tagIcon} resizeMode="contain" />
                        ))}
                    </View>

                    <View style={styles.rowBetween}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={13} color="#444" style={{ marginRight: 2 }} />
                            <Text style={styles.location}>{item.store.location}</Text>
                        </View>
                        <TouchableOpacity>
                            <Image source={require("../../../assets/Frame 265.png")} style={{ width: 28, height: 28, resizeMode: "contain" }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
            {/* HEADER */}
            {/* ... Keep your header code unchanged ... */}
         <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{categoryTitle}</Text>
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

            {/* FILTER ROW */}
            <View style={styles.filterContainer}>
                {filters.map((label) => (
                    <TouchableOpacity key={label} style={styles.filterButton}>
                        <Text style={styles.filterText}>{label}</Text>
                        <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView>
                {/* TRENDING PRODUCTS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trending Products</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={trendingProducts}
                    renderItem={renderHorizontalProduct}
                    keyExtractor={(item) => "trend-" + item.id}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                />

                {/* NEW ARRIVALS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>New Arrivals</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={newArrivals}
                    renderItem={renderHorizontalProduct}
                    keyExtractor={(item) => "new-" + item.id}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                />

                {/* ALL PRODUCTS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>All Products</Text>
                </View>
                <FlatList
                    data={allProducts}
                    renderItem={renderAllProductCard}
                    keyExtractor={(item) => "all-" + item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: -10, justifyContent: 'space-evenly' }}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductsListScreen;

// Keep your styles object unchanged for now.


const styles = StyleSheet.create({
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
        fontSize: 20,
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
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 10,
        backgroundColor: "#fff",
        justifyContent: "space-between",
    },
    filterButton: {
        backgroundColor: "#F5F5F5",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        flexBasis: "32%",
    },
    filterText: {
        fontSize: 12,
        color: "#333",
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
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E53E3E",
        marginTop: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginHorizontal: 10,
        marginBottom:10

    },
    sectionTitle: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 14,
    },
    viewAll: {
        color: "#fff",
        fontSize: 12,
        textDecorationLine: "underline",
        
    },
    horizontalCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        marginRight: 10,
        width: 160,
        overflow: "hidden",
        elevation:1
    },
    horizontalImage: {
        width: "100%",
        height: 100,
        resizeMode: "cover",
    },
    // All Products card styling
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginTop: 12,
        width: cardWidth,
        overflow: "hidden",
        elevation: 1,
    },
    iconButton: {
        marginLeft: 9,
    },

    image: { width: "100%", height: 120 },
    infoContainer: { padding: 10 },
    storeNameCard: { fontSize: 12, color: "#E53E3E", fontWeight: "400" },
    productTitleCard: { fontSize: 13, fontWeight: "500", marginVertical: 4 },
    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { color: "#F44336", fontWeight: "700", fontSize: 14, marginRight: 6 },
    originalPrice: { color: "#999", fontSize: 10, textDecorationLine: "line-through" },
    ratingRow: { flexDirection: "row", alignItems: "center" },
    rating: { marginLeft: 2, fontSize: 11, color: "#000" },
    tagsRow: { flexDirection: "row", marginTop: 3, gap: 3 },
    tagIcon: { width: 70, height: 20, borderRadius: 50 },
    locationRow: { flexDirection: "row", alignItems: "center" },
    location: { fontSize: 9, color: "#444", fontWeight: "500" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    storeRow: { flexDirection: "row", alignItems: "center", },
    storeAvatar: { width: 20, height: 20, borderRadius: 12, marginRight: 6 },
});
