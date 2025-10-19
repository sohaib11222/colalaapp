import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import HomeHeader from "../../components/HomeHeader";
import BannerCarousel from "../../components/BannerCarousel";
import CategorySection from "../../components/CategorySection";
import TopSellingSection from "../../components/TopSellingSection";
import FeaturedServices from "../../components/FeaturedServices";
import TopStoresSection from "../../components/TopSoresSection";
import { useQueryClient } from "@tanstack/react-query";

const HomeScreen = () => {
  // Query client for refresh functionality
  const queryClient = useQueryClient();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch home-related queries
      await queryClient.invalidateQueries({ queryKey: ["home"] });
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#E53E3E"]}
          tintColor={"#E53E3E"}
          title="Pull to refresh"
          titleColor={"#6C727A"}
        />
      }
    >
      <HomeHeader />
      <View
        style={{
          marginTop: -15,
          backgroundColor: "#F9F9F9",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
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
