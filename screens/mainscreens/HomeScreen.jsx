import React from 'react';
import { View, ScrollView } from 'react-native';
import HomeHeader from '../../components/HomeHeader';
import BannerCarousel from '../../components/BannerCarousel';
import CategorySection from '../../components/CategorySection';
import TopSellingSection from '../../components/TopSellingSection';
import FeaturedServices from '../../components/FeaturedServices';
import TopStoresSection from '../../components/TopSoresSection';

const HomeScreen = () => {
    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <HomeHeader />
            <View style={{ marginTop: -25, backgroundColor: "#F9F9F9", borderTopLeftRadius: 30, borderTopRightRadius: 30 }}  >
                <BannerCarousel />
                <CategorySection />
                <TopSellingSection />
                <FeaturedServices />
                <TopStoresSection />
            </View>
            {/* Other components will go here */}
        </ScrollView>
    );
};

export default HomeScreen;
