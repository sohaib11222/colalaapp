import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';


// Sample category data
const initialCategories = [
    {
        id: '1',
        title: 'Phones & Tablets',
        image: require('../../../assets/Rectangle 32 (10).png'), // update path accordingly
        productCount: 500,
        isExpanded: true,
        subcategories: [
            {
                group: 'Mobile Phones',
                items: [
                    { title: 'Smartphones', image: require('../../../assets/phone1.png'), count: 27 },
                    { title: 'Basic Phones', image: require('../../../assets/phone2.png'), count: 33 },
                    { title: 'Basic Phones', image: require('../../../assets/phone2.png'), count: 33 },
                ],
            },
            {
                group: 'Tablets',
                items: [
                    { title: 'Android Tablets', image: require('../../../assets/Frame 253.png'), count: 20 },
                    { title: 'Educational Tablets', image: require('../../../assets/tablet2.png'), count: 20 },
                    { title: 'iPads', image: require('../../../assets/tablet1.png'), count: 20 },
                ],
            },
        ],
    },
    {
        id: '2',
        title: 'Fashion',
        // image: require('../assets/fashion.png'),
        productCount: 500,
        isExpanded: false,
        subcategories: [],
    },
    {
        id: '3',
        title: 'Home & Office',
        // image: require('../assets/home.png'),
        productCount: 500,
        isExpanded: false,
        subcategories: [],
    },
    // Add more categories similarly...
];

const CategoryScreen = () => {
    const navigation = useNavigation();
  
    const [categories, setCategories] = useState(initialCategories);

    const toggleExpand = (id) => {
        setCategories(prev =>
            prev.map(cat =>
                cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
            )
        );
    };

    const renderCategory = ({ item }) => (
        <View style={styles.categoryContainer}>
            <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleExpand(item.id)}
            >
                <Image source={item.image} style={styles.categoryImage} />
                <View style={styles.categoryTextContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subText}>{item.productCount} products</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: "#ccc", padding: 5, borderRadius: 20 }}>
                    <AntDesign
                        name={item.isExpanded ? 'up' : 'down'}
                        size={20}
                        color="red"
                    />
                </View>
            </TouchableOpacity>

            {item.isExpanded && item.subcategories.length > 0 && (
                <View style={styles.subCategoryContainer}>
                    {item.subcategories.map((group, index) => (
                        <View key={index}>
                            <View style={styles.subHeader}>
                                <Text style={styles.subTitle}>{group.group}</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("ProductsList", {
                                            categoryTitle: group.group,
                                            products: group.items, // or fetch from API
                                        })
                                    }
                                >
                                    <Text style={styles.viewAll}>View All</Text>
                                </TouchableOpacity>

                            </View>
                            <View style={styles.itemRow}>
                                {group.items.map((sub, i) => (
                                    <View key={i} style={styles.subItem}>
                                        <Image source={sub.image} style={[styles.subImage]} />
                                        <View style={{ backgroundColor: "#F7F7F7", padding: 4, zIndex: 1, marginTop: -5, borderBottomRightRadius: 5, borderBottomLeftRadius: 5 }}>
                                            <Text style={styles.subItemTitle}>{sub.title}</Text>
                                            <Text style={styles.subCount}>{sub.count} Products</Text></View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Categories</Text>
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
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                contentContainerStyle={{ padding: 16 }}
            />
        </SafeAreaView>
    );
};

export default CategoryScreen;

const styles = StyleSheet.create({
    categoryContainer: {
        backgroundColor: '#fff',
        marginBottom: 12,
        paddingRight: 12,  // keep right padding
        // paddingBottom: 12, // keep bottom padding
        paddingTop: 0,     // no top padding
        paddingLeft: 0,    // no left padding
        borderRadius: 12,
        elevation: 2,
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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryImage: {
        width: 75,
        height: 75,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        marginRight: 10,
        padding: 0
    },
    categoryTextContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    subText: {
        color: '#888',
        fontSize: 13,
    },
    subCategoryContainer: {
        marginTop: 10,
        padding: 16
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: "#E53E3E",
        borderRadius: 5,
        paddingVertical: 7
    },
    subTitle: {
        fontWeight: '400',
        fontSize: 12,
        color: "#fff"
    },
    viewAll: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '400',
        textDecorationLine: "underline"
    },
    itemRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // gap: 10,
    },
    subItem: {
        width: '30.3%',
        margin: 5,
    },
    subImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
    },
    subItemTitle: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
    subCount: {
        fontSize: 10,
        color: '#777',
    },
    iconButton: {
        marginLeft: 9,
    },
});
