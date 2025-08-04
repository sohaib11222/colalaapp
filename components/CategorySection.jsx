// components/CategorySection.js

import { useNavigation } from 'expo-router';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';

const categories = [
    {
        id: '1',
        name: 'Phones',
        icon: require('../assets/image 52.png'),
        bgColor: '#C7E1E1',
    },
    {
        id: '2',
        name: 'Fashion',
        icon: require('../assets/image 45.png'),
        bgColor: '#C7C7FA',
    },
    {
        id: '3',
        name: 'Electronics',
        icon: require('../assets/image 46 (1).png'),
        bgColor: '#C7E1C7',
    },
    {
        id: '4',
        name: 'Grocery',
        icon: require('../assets/image 47 (1).png'),
        bgColor: '#ECCCCC',
    },
    {
        id: '5',
        name: 'Services',
        icon: require('../assets/image 55.png'),
        bgColor: '#FAFAC7',
    },
];

const CategorySection = ({ onCategoryPress }) => {
    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryNavigator', {
                    screen: 'Category',
                })}>
                <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
        </View>

            {/* Scrollable Category List */ }
    <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
            <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                    if (item.name === 'Services') {
                        navigation.navigate('ServiceNavigator', {
                            screen: 'ServicesScreen',
                            // params: { id: 42 }
                        }); // Replace with actual screen name
                    } else {
                        onCategoryPress?.(item); // Call optional handler for other categories
                    }
                }}

            >
                <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                    <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
                </View>
                <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
        )}
    />
        </View >
    );
};

export default CategorySection;

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E53E3E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5
    },
    title: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    viewAll: {
        color: 'white',
        fontSize: 13,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 14,
    },
    iconWrapper: {
        width: 63,
        height: 63,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconImage: {
        width: 34,
        height: 34,
    },
    categoryText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
    },
});
