import React, { useState, useMemo, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../components/ThemedText";
import {
    useAddToCart,
    BASE_URL,
} from "../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const { width } = Dimensions.get("window");
const COLOR = { primary: "#E53E3E", bg: "#F5F6F8", text: "#101318" };
const CARD_WIDTH = (width - 48) / 2;

export default function CameraSearchScreen() {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { searchResults, extractedText, searchQuery } = params || {};
    
    // Query client for refresh functionality
    const queryClient = useQueryClient();
    
    // Refresh state
    const [refreshing, setRefreshing] = useState(false);

    const addToCart = useAddToCart({
        onSuccess: () => Alert.alert("Success", "Item added to cart."),
        onError: () => Alert.alert("Error", "Could not add to cart."),
    });

    const imgUrl = (p) => (p ? `${BASE_URL.replace("/api", "")}/storage/${p}` : null);

    // Pull to refresh functionality
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Invalidate and refetch all queries
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['products'] }),
                queryClient.invalidateQueries({ queryKey: ['stores'] }),
                queryClient.invalidateQueries({ queryKey: ['services'] }),
            ]);
        } catch (error) {
            console.log('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [queryClient]);

    /* ---------- Product Card ---------- */
    const renderProductCard = ({ item }) => {
        const imageUri = item.images?.length
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
                <Image source={imageUri} style={styles.productImage} />
                <View style={[styles.rowBetween, styles.productHeader]}>
                    <View style={styles.storeRow}>
                        <Image source={storeAvatar} style={styles.storeAvatar} />
                        <ThemedText style={styles.storeName}>
                            {item.store?.store_name || "Store"}
                        </ThemedText>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" color="#FF0000" size={10} />
                        <ThemedText style={styles.ratingText}>
                            {item.store?.average_rating || "4.5"}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.productBody}>
                    <ThemedText numberOfLines={1} style={styles.productTitle}>
                        {item.name}
                    </ThemedText>
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
                            onPress={() => addToCart.mutate({ product_id: item.id, qty: 1 })}
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

    const products = searchResults?.data || [];
    console.log("products we got from data is ", products);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Camera Search Results</ThemedText>
                <TouchableOpacity
                    onPress={() => navigation.navigate("ServiceNavigator", { screen: "Cart" })}
                    style={styles.cartBtn}
                >
                    <Image source={require("../../assets/cart-black.png")} style={styles.iconImg} />
                </TouchableOpacity>
            </View>

            {/* Search Info */}
            <View style={styles.searchInfo}>
                <View style={styles.searchInfoRow}>
                    <Ionicons name="camera" size={20} color={COLOR.primary} />
                    <ThemedText style={styles.searchInfoText}>
                        {extractedText ? `Detected: "${extractedText}"` : "Image analyzed"}
                    </ThemedText>
                </View>
                <ThemedText style={styles.resultCount}>
                    Found {products.length} products
                </ThemedText>
            </View>

            {/* Results */}
            {products.length > 0 ? (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-around", gap: 10 }}
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLOR.primary]}
                            tintColor={COLOR.primary}
                            title="Pull to refresh"
                            titleColor="#888"
                        />
                    }
                    renderItem={renderProductCard}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={60} color="#ccc" />
                    <ThemedText style={styles.emptyText}>
                        No products found for this image
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ThemedText style={styles.retryButtonText}>Try Another Image</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingHorizontal: 16, 
        paddingVertical: 16, 
        backgroundColor: "#fff" 
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
    backBtn: { padding: 6, borderWidth: 0.3, borderColor: "#ccc", borderRadius: 20 },
    cartBtn: { padding: 6, borderWidth: 0.3, borderColor: "#ccc", borderRadius: 20 },
    iconImg: { width: 22, height: 22, resizeMode: "contain" },

    searchInfo: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E53E3E",
    },
    searchInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    searchInfoText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "600",
        color: COLOR.text,
    },
    resultCount: {
        fontSize: 12,
        color: "#666",
    },

    productCard: { 
        width: CARD_WIDTH, 
        backgroundColor: "#fff", 
        borderRadius: 20, 
        overflow: "hidden", 
        marginTop: 12, 
        elevation: 3 
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

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: COLOR.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
