import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { useNavigation } from "@react-navigation/native";
import { useStores } from "../config/api.config";

const { width } = Dimensions.get("window");

const TopStoresSection = () => {
  const navigation = useNavigation();
  const { data: apiData, isLoading, error } = useStores();

  // Build absolute media url from API paths; fallback to null
  const mediaUrl = (p) => {
    if (!p) return null;
    const host = "https://colala.hmstech.xyz";
    return `${host}/storage/${String(p)}`;
  };

  // Placeholders (same as StoreScreen)
  const FALLBACK_COVER = require("../assets/Rectangle 30.png");
  const FALLBACK_AVATAR = require("../assets/Ellipse 18.png");

  // Navigation handlers
  const handleViewAllPress = () => {
    navigation.navigate("Stores");
  };

  const handleStorePress = (store) => {
    // const cover = store.banner_image ? { uri: mediaUrl(store.banner_image) } : FALLBACK_COVER;
    // const avatar = store.profile_image ? { uri: mediaUrl(store.profile_image) } : FALLBACK_AVATAR;

    const cover = mediaUrl(store.banner_image) || FALLBACK_COVER;
    const avatar = mediaUrl(store.profile_image) || FALLBACK_AVATAR;
    
    navigation.navigate("ServiceNavigator", {
      screen: "StoreDetails",
      params: { 
        store: {
          id: store.id.toString(),
          name: store.store_name,
          cover,
          avatar,
          tags: ["Electronics", "Phones"], // Default tags
          rating: 4.5, // Default rating
          _api: store,
        },
        storeId: store.id
      },
    });
  };

  // Process API data and limit to 4 items
  const processedStores = React.useMemo(() => {
    if (!apiData?.data || apiData.data.length === 0) {
      return [];
    }

    return apiData.data.slice(0, 4).map((store) => {
      const cover = store.banner_image ? { uri: mediaUrl(store.banner_image) } : FALLBACK_COVER;
      const avatar = store.profile_image ? { uri: mediaUrl(store.profile_image) } : FALLBACK_AVATAR;
      return {
        id: store.id.toString(),
        name: store.store_name || "Store Name",
        rating: Number(store.average_rating ?? 0) || 0,
        tags: ["Electronics", "Phones"], // Default tags since not in API
        backgroundImage: cover,
        profileImage: avatar,
        qtySold: Number(store.qty_sold ?? store.total_sold ?? 0) || 0,
        followers: Number(store.followers_count ?? 0) || 0,
        products: 100, // Default value since not in API
        _api: store, // Keep original API data for navigation
      };
    });
  }, [apiData]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Top Stores</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53E3E" />
          <ThemedText style={styles.loadingText}>Loading top stores...</ThemedText>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Top Stores</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#E53E3E" />
          <ThemedText style={styles.emptyTitle}>Unable to load stores</ThemedText>
          <ThemedText style={styles.emptyText}>
            There was an error loading the top stores. Please try again later.
          </ThemedText>
        </View>
      </View>
    );
  }

  // Empty state
  if (processedStores.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Top Stores</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={48} color="#E53E3E" />
          <ThemedText style={styles.emptyTitle}>No top stores</ThemedText>
          <ThemedText style={styles.emptyText}>
            There are currently no top stores available. Check back later for updates.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Top Stores</ThemedText>
        <TouchableOpacity onPress={handleViewAllPress}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Cards */}
      <FlatList
        data={processedStores}
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
                    <View key={i}>
                      <Text
                        style={[
                          styles.tag,
                          {
                            backgroundColor:
                              i % 2 === 0 ? "#0000FF33" : "#FF000033",
                            color: i % 2 === 0 ? "#0000FF" : "#FF0000",
                            borderColor: i % 2 === 0 ? "#0000FF" : "#FF0000",
                            borderWidth: 0.5,
                          },
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" color="red" size={16} />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Footer: Qty, Followers, Go to Shop */}
              <View style={styles.footerRow}>
                <Image
                  source={require("../assets/shop.png")}
                  style={styles.statIcon}
                />
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Qty Sold</Text>
                  <Text style={styles.statValue}>{item.qtySold}</Text>
                </View>

                <View style={styles.verticalDivider} />

                <Image
                  source={require("../assets/profile-2user.png")}
                  style={styles.statIcon}
                />
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Followers</Text>
                  <Text style={styles.statValue}>{item.followers}</Text>
                </View>

                <View style={styles.verticalDivider} />

                <TouchableOpacity 
                  style={styles.shopBtn}
                  onPress={() => handleStorePress(item._api)}
                >
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
    marginTop: 10,
    paddingHorizontal: 16,
    marginBottom: 110,
  },
  headerRow: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAll: {
    color: "white",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  card: {
    width: width * 0.75,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    position: "relative",
    elevation: 1,
  },
  bgImage: {
    width: "100%",
    height: 100,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    position: "absolute",
    top: 75,
    left: 16,
  },
  content: {
    paddingTop: 6,
    padding: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 80,
  },
  ratingTagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 40,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 3,
    marginLeft: 19,
    // marginRight: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: 400,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  tag: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    // backgroundColor: '#eee',
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
    marginLeft: -20,
  },
  statIcon: {
    width: 23,
    height: 23,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: "#888",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  shopBtn: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  shopBtnText: {
    color: "white",
    fontSize: 10,
    fontWeight: "400",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  verticalDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#ccc",
    marginHorizontal: 10,
  },
  
  // Loading and Empty state styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
