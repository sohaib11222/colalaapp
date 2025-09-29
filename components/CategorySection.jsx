// // components/CategorySection.js

// import { useNavigation } from 'expo-router';
// import React from 'react';
// import ThemedText from './ThemedText';
// import {
//     View,
//     Text,
//     StyleSheet,
//     FlatList,
//     Image,
//     TouchableOpacity,
// } from 'react-native';

// const categories = [
//     {
//         id: '1',
//         name: 'Phones',
//         icon: require('../assets/image 52.png'),
//         bgColor: '#C7E1E1',
//     },
//     {
//         id: '2',
//         name: 'Fashion',
//         icon: require('../assets/image 45.png'),
//         bgColor: '#C7C7FA',
//     },
//     {
//         id: '3',
//         name: 'Electronics',
//         icon: require('../assets/image 46 (1).png'),
//         bgColor: '#C7E1C7',
//     },
//     {
//         id: '4',
//         name: 'Grocery',
//         icon: require('../assets/image 47 (1).png'),
//         bgColor: '#ECCCCC',
//     },
//     {
//         id: '5',
//         name: 'Services',
//         icon: require('../assets/image 55.png'),
//         bgColor: '#FAFAC7',
//     },
// ];

// const CategorySection = ({ onCategoryPress }) => {
//     const navigation = useNavigation()

//     return (
//         <View style={styles.container}>
//             {/* Header Row */}
//             <View style={styles.headerRow}>
//                 <ThemedText style={styles.title}>Categories</ThemedText>
//                 <TouchableOpacity onPress={() => navigation.navigate('CategoryNavigator', {
//                     screen: 'Category',
//                 })}>
//                 <ThemedText style={styles.viewAll}>View All</ThemedText>
//             </TouchableOpacity>
//         </View>

//             {/* Scrollable Category List */ }
//     <FlatList
//         data={categories}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ paddingVertical: 10 }}
//         renderItem={({ item }) => (
//             <TouchableOpacity
//                 style={styles.categoryItem}
//                 onPress={() => {
//                     if (item.name === 'Services') {
//                         navigation.navigate('ServiceNavigator', {
//                             screen: 'ServicesScreen',
//                             // params: { id: 42 }
//                         }); // Replace with actual screen name
//                     } else {
//                         onCategoryPress?.(item); // Call optional handler for other categories
//                     }
//                 }}

//             >
//                 <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
//                     <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
//                 </View>
//                 <ThemedText style={styles.categoryText}>{item.name}</ThemedText>
//             </TouchableOpacity>
//         )}
//     />
//         </View >
//     );
// };

// export default CategorySection;

// const styles = StyleSheet.create({
//     container: {
//         marginTop: 12,
//         paddingHorizontal: 16,
//     },
//     headerRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#E53E3E',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 5
//     },
//     title: {
//         color: 'white',
//         fontWeight: '600',
//         fontSize: 14,
//     },
//     viewAll: {
//         color: 'white',
//         fontSize: 13,
//         textDecorationLine:'underline'
//     },
//     categoryItem: {
//         alignItems: 'center',
//         marginRight: 14,
//     },
//     iconWrapper: {
//         width: 69,
//         height: 69,
//         borderRadius: 45,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 6,
//     },
//     iconImage: {
//         width: 40,
//         height: 40,
//     },
//     categoryText: {
//         fontSize: 12,
//         textAlign: 'center',
//         color: '#333',
//     },
// });
// components/CategorySection.js
import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "expo-router"; // keep this
import ThemedText from "./ThemedText";
import { useCategories } from "../config/api.config";

const SERVICES_TILE = {
  id: "services-tile",
  name: "Services",
  localIcon: require("../assets/image 55.png"),
  bgColor: "#FAFAC7",
  isServices: true,
};

const CategorySection = ({ onCategoryPress }) => {
  const navigation = useNavigation();
  const { data, isLoading, isError } = useCategories();

  const apiItems = Array.isArray(data?.data) ? data.data : [];
  const mappedFromApi = apiItems.map((c) => ({
    id: String(c.id),
    name: c.title,
    imageUrl: c.image_url, // ← use as-is
    bgColor: c.color || "#EEE",
    isServices: false,
  }));
  const categories = [...mappedFromApi, SERVICES_TILE];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Categories</ThemedText>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CategoryNavigator", { screen: "Category" })
          }
        >
          <ThemedText style={styles.viewAll}>View All</ThemedText>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: 14 }}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <ThemedText style={{ paddingVertical: 14 }}>
          Failed to load categories
        </ThemedText>
      ) : (
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
                if (item.isServices) {
                  navigation.navigate("ServiceNavigator", {
                    screen: "ServicesScreen",
                  });
                } else {
                  // Open the same Category page, with THIS parent expanded
                  navigation.navigate("CategoryNavigator", {
                    screen: "Category",
                    params: { initialParentId: item.id }, // <-- key change
                  });
                  // still call optional callback if you use it elsewhere
                  onCategoryPress?.(item);
                }
              }}
            >
              <View
                style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }} // ← no prefix
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={item.localIcon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              <ThemedText style={styles.categoryText}>{item.name}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: { marginTop: 12, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E53E3E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  title: { color: "white", fontWeight: "600", fontSize: 14 },
  viewAll: { color: "white", fontSize: 13, textDecorationLine: "underline" },
  categoryItem: { alignItems: "center", marginRight: 14 },
  iconWrapper: {
    width: 69,
    height: 69,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconImage: { width: 44, height: 44 },
  categoryText: { fontSize: 12, textAlign: "center", color: "#333" },
});
