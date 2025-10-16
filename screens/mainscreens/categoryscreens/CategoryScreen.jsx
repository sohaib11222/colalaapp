import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import ThemedText from "../../../components/ThemedText";
import { useCategories, useCartQuantity } from "../../../config/api.config";
import { useQueryClient } from "@tanstack/react-query";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Use shared cart quantity hook
  const { data: cartQuantity = 0, isLoading: isCartLoading } = useCartQuantity();

  // id of the parent category to expand when arriving from the home strip
  const initialParentIdRaw = route?.params?.initialParentId;
  const initialParentId =
    initialParentIdRaw !== undefined && initialParentIdRaw !== null
      ? Number(initialParentIdRaw)
      : null;

  const { data, isLoading, isError } = useCategories();

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  const apiCategories = Array.isArray(data?.data) ? data.data : [];
  const [expanded, setExpanded] = useState({}); // { [parentId]: boolean }
  const [searchQuery, setSearchQuery] = useState('');

  // If we were given a parent id, expand only that on first load.
  useEffect(() => {
    if (!initialParentId || !apiCategories.length) return;
    setExpanded((prev) => {
      // don't clobber if already manually toggled
      if (typeof prev[initialParentId] !== "undefined") return prev;
      // collapse others, open only the requested parent
      return { [initialParentId]: true };
    });
  }, [initialParentId, apiCategories.length]);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch categories query
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Filter categories based on search query and hide empty categories
  const filteredCategories = useMemo(() => {
    // First filter out categories with no children (unless they have products)
    const categoriesWithContent = apiCategories.filter(category => {
      // Show if category has children or has products
      return (category.children && category.children.length > 0) || (category.products_count > 0);
    });

    if (!searchQuery.trim()) return categoriesWithContent;
    
    const query = searchQuery.toLowerCase().trim();
    return categoriesWithContent.filter(category => {
      // Search in main category title
      if (category.title?.toLowerCase().includes(query)) return true;
      
      // Search in subcategories
      if (category.children && Array.isArray(category.children)) {
        return category.children.some(sub => {
          // Search in subcategory title
          if (sub.title?.toLowerCase().includes(query)) return true;
          
          // Search in subcategory children (grandchildren)
          if (sub.children && Array.isArray(sub.children)) {
            return sub.children.some(grand => 
              grand.title?.toLowerCase().includes(query)
            );
          }
          return false;
        });
      }
      return false;
    });
  }, [apiCategories, searchQuery]);

  const categories = useMemo(() => {
    const hasInitial =
      initialParentId !== null && initialParentId !== undefined;
    return filteredCategories.map((c, idx) => ({
      ...c,
      isExpanded:
        expanded[c.id] ?? (hasInitial ? c.id === initialParentId : idx === 0),
    }));
  }, [filteredCategories, expanded, initialParentId]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderCategory = ({ item }) => {
    const subs = Array.isArray(item.children) ? item.children : [];

    return (
      <View style={styles.categoryContainer}>
        {/* Parent row */}
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleExpand(item.id)}
        >
          {!!item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.categoryImage}
            />
          )}
          <View style={styles.categoryTextContainer}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.subText}>
              {item.products_count ?? 0} products
            </ThemedText>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <AntDesign
              name={item.isExpanded ? "up" : "down"}
              size={20}
              color="red"
            />
          </View>
        </TouchableOpacity>

        {/* For each SUBCATEGORY: show its name in the red header row, and BELOW it render its CHILDREN grid */}
        {item.isExpanded && subs.length > 0 && (
          <View style={styles.subCategoryContainer}>
            {subs.map((sub) => {
              const grand = Array.isArray(sub.children) ? sub.children : [];
              return (
                <View key={`sub-${sub.id}`} style={{ marginBottom: 8 }}>
                  {/* This bar shows ONLY the subcategory name + View All */}
                  <View style={styles.subHeader}>
                    <ThemedText style={styles.subTitle}>{sub.title}</ThemedText>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ProductsList", {
                          categoryId: sub.id,
                          categoryTitle: sub.title,
                          // IMPORTANT: fetch from the parent that actually has products right now
                          fetchCategoryId: item.id,
                          products: grand.map((g) => ({
                            title: g.title,
                            image_url: g.image_url,
                            count: g.products_count ?? 0,
                          })),
                        })
                      }
                    >
                      <ThemedText style={styles.viewAll}>View All</ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* BELOW: child categories of the subcategory (grandchildren of parent) */}
                  <View style={styles.itemRow}>
                    {grand.map((g) => (
                      <View key={`grand-${g.id}`} style={styles.subItem}>
                        {!!g.image_url && (
                          <Image
                            source={{ uri: g.image_url }}
                            style={styles.subImage}
                          />
                        )}
                        <View
                          style={{
                            backgroundColor: "#F7F7F7",
                            padding: 4,
                            zIndex: 1,
                            marginTop: -5,
                            borderBottomRightRadius: 5,
                            borderBottomLeftRadius: 5,
                          }}
                        >
                          <ThemedText style={styles.subItemTitle}>
                            {g.title}
                          </ThemedText>
                          <ThemedText style={styles.subCount}>
                            {g.products_count ?? 0} Products
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              padding: 6,
              borderRadius: 30,
              marginLeft: 10,
              zIndex: 5,
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#E53E3E" />
          </TouchableOpacity>

          <ThemedText font="oleo" style={styles.headerTitle}>
            Categories
          </ThemedText>
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ServiceNavigator", { screen: "Cart" })
              }
              style={[styles.iconButton, styles.iconPill]}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
            >
              <View style={styles.cartIconContainer}>
                <Image
                  source={require("../../../assets/cart-icon.png")}
                  style={styles.iconImg}
                />
                {cartQuantity > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartQuantity > 99 ? "99+" : cartQuantity}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ServiceNavigator", {
                  screen: "Notifications",
                })
              }
              style={[styles.iconButton, styles.iconPill]}
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <Image
                source={require("../../../assets/bell-icon.png")}
                style={styles.iconImg}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search any product, shop or category"
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {/* <Image
            source={require("../../../assets/camera-icon.png")}
            style={styles.iconImg}
          />{" "} */}
        </View>
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color="#E53E3E" />
          <ThemedText style={styles.headerLoadingText}>Loading categories...</ThemedText>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={{ padding: 24 }}>
          <ThemedText>Failed to load categories</ThemedText>
        </View>
      ) : categories.length === 0 && searchQuery.trim() ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <ThemedText style={{ color: '#888', textAlign: 'center' }}>
            No categories found for "{searchQuery}"
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategory}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E53E3E']}
              tintColor={'#E53E3E'}
              title="Pull to refresh"
              titleColor={'#6C727A'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: "#fff",
    marginBottom: 12,
    paddingRight: 12,
    paddingTop: 0,
    paddingLeft: 0,
    borderRadius: 12,
    elevation: 2,
  },

  header: {
    backgroundColor: "#E53E3E",
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    zIndex: 1,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    position: "absolute",
    left: 20,
    right: 0,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    marginLeft: -180,
    fontWeight: "400",
  },
  headerIcons: { flexDirection: "row" },
  searchContainer: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    height: 57,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  cameraIcon: { marginLeft: 8 },

  categoryHeader: { flexDirection: "row", alignItems: "center" },
  categoryImage: {
    width: 75,
    height: 75,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    marginRight: 10,
    padding: 0,
  },
  categoryTextContainer: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 16 },
  subText: { color: "#888", fontSize: 13 },

  subCategoryContainer: { marginTop: 10, padding: 16 },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#E53E3E",
    borderRadius: 5,
    paddingVertical: 7,
  },
  subTitle: { fontWeight: "400", fontSize: 12, color: "#fff" },
  viewAll: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "underline",
  },

  itemRow: { flexDirection: "row", flexWrap: "wrap" },
  subItem: { width: "30.3%", margin: 5 },
  subImage: { width: "100%", height: 80, borderRadius: 8 },
  subItemTitle: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  subCount: { fontSize: 10, color: "#777" },

  iconButton: { marginLeft: 9 },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: "contain" },

  cartIconContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Header loading styles
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEDEF",
  },
  headerLoadingText: {
    marginLeft: 8,
    color: "#6C727A",
    fontSize: 14,
    fontWeight: "500",
  },
});
