import React, { useState, useMemo } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ThemedText from "../../components/ThemedText";
import {
    useGetAllProducts,
    useStores,
    useAddToCart,
    BASE_URL,
} from "../../config/api.config";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const COLOR = { primary: "#E53E3E", bg: "#F5F6F8", text: "#101318" };
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("products");
    const [query, setQuery] = useState("");

    /* ========== API Hooks ========== */
    const { data: productData, isLoading: productsLoading } = useGetAllProducts();
    const { data: storeData, isLoading: storesLoading } = useStores();
    const addToCart = useAddToCart({
        onSuccess: () => Alert.alert("Success", "Item added to cart."),
        onError: () => Alert.alert("Error", "Could not add to cart."),
    });

    /* ========== Filtering ========== */
    const filteredProducts = useMemo(() => {
        if (!query.trim()) return productData?.data || [];
        const q = query.toLowerCase();
        return (productData?.data || []).filter((p) =>
            p.name?.toLowerCase().includes(q)
        );
    }, [productData, query]);

    const filteredStores = useMemo(() => {
        if (!query.trim()) return storeData?.data || [];
        const q = query.toLowerCase();
        return (storeData?.data || []).filter((s) =>
            s.store_name?.toLowerCase().includes(q)
        );
    }, [storeData, query]);

    /* Dummy services until real API is ready */
    const filteredServices = useMemo(() => {
        const dummy = [
            {
                id: "1",
                name: "Sasha Stores",
                price: "₦5,000 - ₦100,000",
                service: "Fashion designing Service",
                rating: 4.5,
                cover: require("../../assets/Frame 264 (4).png"),
                avatar: require("../../assets/Ellipse 18.png"),
            },
            {
                id: "2",
                name: "Sasha Stores",
                price: "₦5,000 - ₦100,000",
                service: "Fashion designing Service",
                rating: 4.5,
                cover: require("../../assets/Frame 264 (5).png"),
                avatar: require("../../assets/Ellipse 18.png"),
            },
        ];
        if (!query.trim()) return dummy;
        const q = query.toLowerCase();
        return dummy.filter((s) => s.service.toLowerCase().includes(q));
    }, [query]);

    /* ========== Helper renderers ========== */

    // Build absolute media URL from API
    const imgUrl = (path) =>
        path ? `${BASE_URL.replace("/api", "")}/storage/${path}` : null;

    const renderProductCard = ({ item }) => {
        const imageUri =
            item.images && item.images.length
                ? { uri: imgUrl(item.images[0].path) }
                : require("../../assets/Frame 264.png");
        const storeAvatar = item.store?.profile_image
            ? { uri: imgUrl(item.store.profile_image) }
            : require("../../assets/Ellipse 18.png");

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() =>
                    navigation.navigate("CategoryNavigator", {
                        screen: "ProductDetails",
                        params: { productId: item.id },
                    })
                }
            >
                <Image source={imageUri} style={styles.productImage} resizeMode="cover" />
                <View style={[styles.rowBetween, styles.productHeader]}>
                    <View style={styles.storeRow}>
                        <Image source={storeAvatar} style={styles.storeAvatar} />
                        <ThemedText style={styles.storeName}>
                            {item.store?.store_name || "Store"}
                        </ThemedText>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" color="#FF0000" size={10} />
                        <ThemedText style={styles.ratingText}>4.5</ThemedText>
                    </View>
                </View>
                <View style={styles.productBody}>
                    <ThemedText style={styles.productTitle}>{item.name}</ThemedText>
                    <View style={styles.priceRow}>
                        <ThemedText style={styles.price}>
                            ₦{Number(item.discount_price || item.price).toLocaleString()}
                        </ThemedText>
                        {item.discount_price && (
                            <ThemedText style={styles.oldPrice}>
                                ₦{Number(item.price).toLocaleString()}
                            </ThemedText>
                        )}
                    </View>
                    <View style={styles.rowBetween}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#444" />
                            <ThemedText style={styles.locationText}>
                                {item.store?.store_location || "Location"}
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            onPress={() =>
                                addToCart.mutate({ product_id: item.id, qty: 1 })
                            }
                        >
                            <Image
                                source={require("../../assets/Frame 265.png")}
                                style={{ width: 30, height: 30 }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderStoreCard = ({ item }) => {
        const cover = imgUrl(item.banner_image);
        const avatar = imgUrl(item.profile_image);

        return (
            <View style={styles.storeCard}>
                <Image
                    source={cover ? { uri: cover } : require("../../assets/Frame 264.png")}
                    style={styles.storeCover}
                />
                <Image
                    source={avatar ? { uri: avatar } : require("../../assets/Ellipse 18.png")}
                    style={styles.storeBigAvatar}
                />
                <View style={styles.storeContent}>
                    <View style={styles.rowBetween}>
                        <ThemedText numberOfLines={1} style={styles.storeCardName}>
                            {item.store_name}
                        </ThemedText>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={10} color={COLOR.primary} />
                            <ThemedText style={styles.ratingText}>4.5</ThemedText>
                        </View>
                    </View>
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { borderColor: "#3D71FF", backgroundColor: "#E9F0FF" }]}>
                            <ThemedText style={[styles.tagText, { color: "#3D71FF" }]}>
                                Electronics
                            </ThemedText>
                        </View>
                        <View style={[styles.tag, { borderColor: COLOR.primary, backgroundColor: "#FFE7E6" }]}>
                            <ThemedText style={[styles.tagText, { color: COLOR.primary }]}>
                                Phones
                            </ThemedText>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.goShopBtn}
                        onPress={() =>
                            navigation.navigate("ServiceNavigator", {
                                screen: "StoreDetails",
                                params: { storeId: item.id },
                            })
                        }
                    >
                        <ThemedText style={styles.goShopText}>Go to Shop</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderServiceCard = ({ item }) => (
        <View style={styles.serviceCard}>
            <Image source={item.cover} style={styles.serviceImage} />
            <View style={styles.serviceHeader}>
                <Image source={item.avatar} style={styles.serviceAvatar} />
                <ThemedText style={styles.storeName}>{item.name}</ThemedText>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={COLOR.primary} />
                    <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
                </View>
            </View>
            <View style={styles.serviceBody}>
                <ThemedText style={styles.serviceTitle}>{item.service}</ThemedText>
                <ThemedText style={styles.price}>{item.price}</ThemedText>
                <TouchableOpacity style={styles.detailsBtn}>
                    <ThemedText style={styles.detailsText}>Details</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

    /* ========== Tab switch ========== */
    const renderContent = () => {
        if (activeTab === "products") {
            if (productsLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;
            return (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-around", gap: 10 }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={renderProductCard}
                />
            );
        }
        if (activeTab === "stores") {
            if (storesLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;
            return (
                <FlatList
                    data={filteredStores}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 10, justifyContent: "space-between" }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    renderItem={renderStoreCard}
                />
            );
        }
        return (
            <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                renderItem={renderServiceCard}
            />
        );
    };

    /* ========== Main render ========== */
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
            <StatusBar style="dark" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Search</ThemedText>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ServiceNavigator', { screen: 'Cart' })}
                    style={styles.cartBtn}
                >
                    <Image
                        source={require('../../assets/cart-black.png')}
                        style={styles.iconImg}
                    />
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search products, stores or services"
                    placeholderTextColor="#888"
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                />
                <Image
                    source={require("../../assets/camera-icon.png")}
                    style={{ width: 22, height: 22, resizeMode: "contain" }}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {["products", "stores", "services"].map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setActiveTab(t)}
                        style={[styles.tab, activeTab === t && styles.tabActive]}
                    >
                        <ThemedText style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>{renderContent()}</View>
        </SafeAreaView>
    );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
    backBtn: { padding: 6, borderWidth: 0.3, borderColor: '#ccc', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    cartBtn: { padding: 6, borderWidth: 0.3, borderColor: '#ccc', borderRadius: 20, justifyContent: 'center', alignItems: 'center'  },

    searchBar: {
        margin: 16,
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 14,
        borderWidth: 0.5,
        borderColor: '#ccc',
        flexDirection: "row",
        alignItems: "center",
        height: 60,
    },
    searchInput: { flex: 1, fontSize: 14, color: COLOR.text },

    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginHorizontal: 17,
        gap: 10,
        marginBottom: 8,
        borderRadius: 7,
        paddingVertical: 4,
    },
    tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 8,  backgroundColor: "#fff" },
    tabActive: { backgroundColor: COLOR.primary },
    tabText: { color: COLOR.text, fontSize: 10 },
    tabTextActive: { color: "#fff", fontWeight: "600" },

    /* Product cards */
    productCard: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        marginTop: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: { width: "100%", height: 120 },
    productHeader: { backgroundColor: "#F2F2F2", padding: 7 },
    storeRow: { flexDirection: "row", alignItems: "center" },
    storeAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 6 },
    storeName: { fontSize: 9, color: COLOR.primary },
    ratingRow: { flexDirection: "row", alignItems: "center" },
    ratingText: { fontSize: 9, marginLeft: 2 },
    productBody: { padding: 10 },
    productTitle: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { color: COLOR.primary, fontWeight: "bold", fontSize: 13, marginRight: 6 },
    oldPrice: { color: "#999", fontSize: 10, textDecorationLine: "line-through" },
    locationRow: { flexDirection: "row", alignItems: "center" },
    locationText: { fontSize: 8, color: "#444" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

    /* Store cards */
    storeCard: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "visible",
        marginTop: 12,
        elevation: 3,
    },
    storeCover: { width: "100%", height: 100, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
    storeBigAvatar: {
        position: "absolute",
        top: 75,
        left: 16,
        width: 49,
        height: 49,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#fff",
    },
    storeContent: { paddingHorizontal: 14, paddingTop: 30, paddingBottom: 12 },
    storeCardName: { fontSize: 14, fontWeight: "700", color: COLOR.text },
    tagRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 10 },
    tag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1 },
    tagText: { fontSize: 8, fontWeight: "600" },
    goShopBtn: {
        backgroundColor: COLOR.primary,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    goShopText: { color: "#fff", fontSize: 10, fontWeight: "400" },

    /* Service cards */
    serviceCard: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        marginTop: 12,
        elevation: 3,
    },
    serviceImage: { width: "100%", height: 100 },
    serviceHeader: { flexDirection: "row", alignItems: "center", padding: 6, backgroundColor: "#F2F2F2" },
    serviceAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
    serviceBody: { padding: 10 },
    serviceTitle: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
    detailsBtn: { backgroundColor: COLOR.primary, paddingVertical: 8, borderRadius: 10, marginTop: 6 },
    detailsText: { color: "#fff", fontSize: 10, textAlign: "center" },
});
