import React, { useState, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThemedText from "../../components/ThemedText";
import {
    useGetAllProducts,
    useStores,
    useServices,
    useAddToCart,
    BASE_URL,
} from "../../config/api.config";

const { width } = Dimensions.get("window");
const COLOR = { primary: "#E53E3E", bg: "#F5F6F8", text: "#101318" };
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(null); // null = discover view
    const [query, setQuery] = useState("");

    // APIs
    const { data: productData, isLoading: productsLoading } = useGetAllProducts();
    const { data: storeData, isLoading: storesLoading } = useStores();
    const { data: serviceData, isLoading: servicesLoading } = useServices();
    const addToCart = useAddToCart({
        onSuccess: () => Alert.alert("Success", "Item added to cart."),
        onError: () => Alert.alert("Error", "Could not add to cart."),
    });

    // Filtering
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

    const filteredServices = useMemo(() => {
        if (!serviceData?.data) return [];
        const q = query.toLowerCase();
        return (serviceData.data || []).filter((s) =>
            s.name?.toLowerCase().includes(q)
        );
    }, [serviceData, query]);

    // Helpers
    const imgUrl = (path) =>
        path ? `${BASE_URL.replace("/api", "")}/storage/${path}` : null;

    /* ========== Tabbed Views (Products/Stores/Services) ========== */

    const renderProductCard = ({ item }) => {
        const imageUri =
            item.images?.length
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
                            <ThemedText style={[styles.tagText, { color: "#3D71FF" }]}>Electronics</ThemedText>
                        </View>
                        <View style={[styles.tag, { borderColor: COLOR.primary, backgroundColor: "#FFE7E6" }]}>
                            <ThemedText style={[styles.tagText, { color: COLOR.primary }]}>Phones</ThemedText>
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

    /* ========== Default Discover View ========== */

    const renderDiscover = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Recent Search full width chips */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recent Search</ThemedText>
                {["Iphone 15", "Womens dress", "Hisensense television"].map((t, i) => (
                    <View key={i} style={styles.recentSearchRow}>
                        <Text style={styles.recentSearchText}>{t}</Text>
                        <Ionicons name="close" size={18} color="#000" />
                    </View>
                ))}
            </View>

            {/* Categories smaller chips */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recent Search Categories</ThemedText>
                <View style={styles.discoverChipRow}>
                    {["Home & Office", "Fashion", "Electronics", "Baby Products"].map((t, i) => (
                        <View key={i} style={styles.discoverChip}>
                            <Text style={styles.discoverChipText}>{t}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Dummy images */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recent Image Search</ThemedText>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[1, 2, 3, 4]}
                    keyExtractor={(i) => i.toString()}
                    renderItem={() => (
                        <Image
                            source={require("../../assets/Frame 264.png")}
                            style={{ width: 100, height: 100, borderRadius: 10, marginRight: 12 }}
                        />
                    )}
                />
            </View>

            {/* Recommended Products simplified */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recommended Products</ThemedText>
                {productsLoading ? (
                    <ActivityIndicator />
                ) : (
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={productData?.data || []}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const img =
                                item.images?.length
                                    ? { uri: imgUrl(item.images[0].path) }
                                    : require("../../assets/Frame 264.png");
                            const storeAvatar = item.store?.profile_image
                                ? { uri: imgUrl(item.store.profile_image) }
                                : require("../../assets/Ellipse 18.png");
                            return (
                                <View style={styles.discoverProductCard}>
                                    <Image source={img} style={styles.discoverProductImage} />
                                    <View style={styles.discoverProductHeader}>
                                        <Image source={storeAvatar} style={styles.discoverStoreAvatar} />
                                        <Text style={styles.discoverStoreName}>
                                            {item.store?.store_name || "Store"}
                                        </Text>
                                        <Ionicons name="star" size={10} color={COLOR.primary} style={{ marginLeft: "auto" }} />
                                        <Text style={styles.discoverRatingText}>4.5</Text>
                                    </View>
                                    <View style={{ padding: 8 }}>
                                        <Text numberOfLines={1} style={styles.discoverProductTitle}>{item.name}</Text>
                                        <Text style={styles.discoverPrice}>
                                            ₦{Number(item.discount_price || item.price).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                        contentContainerStyle={{ paddingVertical: 10 }}
                    />
                )}
            </View>

            {/* Recommended Stores — TopStoresSection design */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Recommended Stores</ThemedText>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={storeData?.data || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const cover = item.banner_image ? { uri: imgUrl(item.banner_image) } : require("../../assets/Rectangle 30.png");
                        const avatar = item.profile_image ? { uri: imgUrl(item.profile_image) } : require("../../assets/Ellipse 18.png");
                        return (
                            <View style={styles.topStoreCard}>
                                <Image source={cover} style={styles.topStoreCover} />
                                <Image source={avatar} style={styles.topStoreAvatar} />
                                <Text style={styles.topStoreName}>{item.store_name}</Text>
                                <View style={styles.topStoreContent}>
                                    <View style={styles.topStoreTags}>
                                        {["Electronics", "Phones"].map((tag, i) => (
                                            <Text key={i} style={[styles.topTag, i % 2 ? styles.redTag : styles.blueTag]}>{tag}</Text>
                                        ))}
                                        <Ionicons name="star" size={14} color="red" />
                                        <Text style={styles.topRating}>4.5</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.topFooter}>
                                        <View style={styles.statBlock}><Text style={styles.statLabel}>Qty Sold</Text><Text style={styles.statValue}>100</Text></View>
                                        <View style={styles.verticalDivider} />
                                        <View style={styles.statBlock}><Text style={styles.statLabel}>Followers</Text><Text style={styles.statValue}>5</Text></View>
                                        <View style={styles.verticalDivider} />
                                        <TouchableOpacity
                                            style={styles.shopBtn}
                                            onPress={() =>
                                                navigation.navigate("ServiceNavigator", {
                                                    screen: "StoreDetails",
                                                    params: { storeId: item.id },
                                                })
                                            }
                                        >
                                            <Text style={styles.shopBtnText}>Go to Shop</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
        </ScrollView>
    );

    /* ========== Tab Switching ========== */
    const renderContent = () => {
        if (!activeTab) return renderDiscover();

        if (activeTab === "products")
            return productsLoading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-around", gap: 10 }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={renderProductCard}
                />
            );

        if (activeTab === "stores")
            return storesLoading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredStores}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 10, justifyContent: "space-between" }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    renderItem={renderStoreCard}
                />
            );

        if (activeTab === "services")
            return servicesLoading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredServices}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <View style={styles.serviceCard}>
                            <Image
                                source={
                                    item.media?.length
                                        ? { uri: imgUrl(item.media[0].path) }
                                        : require("../../assets/Frame 264.png")
                                }
                                style={styles.serviceImage}
                            />
                            <View style={styles.serviceHeader}>
                                <Image source={require("../../assets/Ellipse 18.png")} style={styles.serviceAvatar} />
                                <ThemedText style={styles.storeName}>{item.name}</ThemedText>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color={COLOR.primary} />
                                    <ThemedText style={styles.ratingText}>4.5</ThemedText>
                                </View>
                            </View>
                            <View style={styles.serviceBody}>
                                <ThemedText style={styles.serviceTitle}>{item.short_description || "No description"}</ThemedText>
                                <ThemedText style={styles.price}>
                                    ₦{Number(item.price_from).toLocaleString()} - ₦{Number(item.price_to).toLocaleString()}
                                </ThemedText>
                                <TouchableOpacity style={styles.detailsBtn}>
                                    <ThemedText style={styles.detailsText}>Details</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Search</ThemedText>
                <TouchableOpacity
                    onPress={() => navigation.navigate("ServiceNavigator", { screen: "Cart" })}
                    style={styles.cartBtn}
                >
                    <Image source={require("../../assets/cart-black.png")} style={styles.iconImg} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search any product, shop or category"
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

            <View style={styles.tabs}>
                {["products", "stores", "services"].map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setActiveTab(activeTab === t ? null : t)}
                        style={[styles.tab, activeTab === t && styles.tabActive]}
                    >
                        <ThemedText style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flex: 1 }}>{renderContent()}</View>
        </SafeAreaView>
    );
}

/* ========== Styles ========== */
const styles = StyleSheet.create({
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#fff" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },
    backBtn: { padding: 6, borderWidth: 0.3, borderColor: "#ccc", borderRadius: 20 },
    cartBtn: { padding: 6, borderWidth: 0.3, borderColor: "#ccc", borderRadius: 20 },
    iconImg: { width: 22, height: 22, resizeMode: "contain" },
    searchBar: { margin: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, borderWidth: 0.5, borderColor: "#ccc", flexDirection: "row", alignItems: "center", height: 60 },
    searchInput: { flex: 1, fontSize: 14, color: COLOR.text },
    tabs: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 17, gap: 10, marginBottom: 8, borderRadius: 7, paddingVertical: 4 },
    tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 8, backgroundColor: "#fff" },
    tabActive: { backgroundColor: COLOR.primary },
    tabText: { color: COLOR.text, fontSize: 10 },
    tabTextActive: { color: "#fff", fontWeight: "600" },

    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: COLOR.text },

    recentSearchRow: { backgroundColor: "#B9191933", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 25, paddingHorizontal: 20, paddingVertical: 13, marginBottom: 12 },
    recentSearchText: { color: "#000", fontSize: 14 },

    discoverChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    discoverChip: { backgroundColor: "#B9191933", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 25 },
    discoverChipText: { color: "#000", fontSize: 13 },

    discoverProductCard: { width: width * 0.4, backgroundColor: "#fff", borderRadius: 18, marginRight: 14, elevation: 2 },
    discoverProductImage: { width: "100%", height: 100, borderRadius: 12, padding: 8 },
    discoverProductHeader: { flexDirection: "row", alignItems: "center", marginTop: 6, padding: 6, backgroundColor: "#F2F2F2", },
    discoverStoreAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
    discoverStoreName: { fontSize: 10, color: COLOR.primary },
    discoverRatingText: { fontSize: 10, marginLeft: 3 },
    discoverProductTitle: { fontSize: 13, fontWeight: "500", marginTop: 6 },
    discoverPrice: { color: COLOR.primary, fontWeight: "700", marginTop: 4 },

    topStoreCard: { width: width * 0.75, backgroundColor: "#fff", borderRadius: 16, marginRight: 16, overflow: "hidden", elevation: 1 },
    topStoreCover: { width: "100%", height: 100 },
    topStoreAvatar: { width: 56, height: 56, borderRadius: 28, position: "absolute", top: 75, left: 16 },
    topStoreName: { fontSize: 16, fontWeight: "500", marginLeft: 80 },
    topStoreContent: { paddingTop: 6, padding: 12 },
    topStoreTags: { flexDirection: "row", alignItems: "center", gap: 6 },
    topTag: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontWeight: "500" },
    blueTag: { backgroundColor: "#0000FF33", color: "#0000FF", borderColor: "#0000FF", borderWidth: 0.5 },
    redTag: { backgroundColor: "#FF000033", color: "#FF0000", borderColor: "#FF0000", borderWidth: 0.5 },
    topRating: { fontSize: 14, marginLeft: 4 },
    divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },
    topFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    statBlock: { alignItems: "center" },
    statLabel: { fontSize: 9, color: "#888" },
    statValue: { fontSize: 14, fontWeight: "400" },
    verticalDivider: { width: 1, height: "100%", backgroundColor: "#ccc" },
    shopBtn: { backgroundColor: COLOR.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
    shopBtnText: { color: "#fff", fontSize: 10 },

    productCard: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginTop: 12, elevation: 3 },
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

    storeCard: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 18, overflow: "visible", marginTop: 12, elevation: 3 },
    storeCover: { width: "100%", height: 100, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
    storeBigAvatar: { position: "absolute", top: 75, left: 16, width: 49, height: 49, borderRadius: 25, borderWidth: 2, borderColor: "#fff" },
    storeContent: { paddingHorizontal: 14, paddingTop: 30, paddingBottom: 12 },
    storeCardName: { fontSize: 14, fontWeight: "700", color: COLOR.text },
    tagRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 10 },
    tag: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1 },
    tagText: { fontSize: 8, fontWeight: "600" },
    goShopBtn: { backgroundColor: COLOR.primary, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    goShopText: { color: "#fff", fontSize: 10, fontWeight: "400" },

    serviceCard: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginTop: 12, elevation: 3 },
    serviceImage: { width: "100%", height: 100 },
    serviceHeader: { flexDirection: "row", alignItems: "center", padding: 6, backgroundColor: "#F2F2F2" },
    serviceAvatar: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
    serviceBody: { padding: 10 },
    serviceTitle: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
    detailsBtn: { backgroundColor: COLOR.primary, paddingVertical: 8, borderRadius: 10, marginTop: 6 },
    detailsText: { color: "#fff", fontSize: 10, textAlign: "center" },
});
