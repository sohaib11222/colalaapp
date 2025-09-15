// components/BannerCarousel.js

import React, { useRef, useState } from 'react';
import ThemedText from './ThemedText';
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const bannerImages = [
    require('../assets/Frame 253.png'), // Replace with actual images
    require('../assets/Frame 253.png'), // Replace with actual images
    require('../assets/Frame 253.png'), // Replace with actual images

];

const BannerCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onViewRef = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    });

    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

    return (
        <View style={styles.container}>
            <FlatList
                data={bannerImages}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Image source={item} style={styles.bannerImage} resizeMode="cover" />
                )}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Dots */}
            <View style={styles.dotsContainer}>
                {bannerImages.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, activeIndex === index && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
};

export default BannerCarousel;

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        alignItems: 'center',
    },
    bannerImage: {
        width: width * 0.92,
        height: 170,
        borderRadius: 16,
        marginHorizontal: width * 0.04,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#B91919',
    },
});
