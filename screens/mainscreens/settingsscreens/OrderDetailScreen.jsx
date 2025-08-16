// OrderDetailsScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLOR = {
  primary: '#E53E3E',
  white: '#FFFFFF',
  text: '#101318',
  sub: '#6C727A',
  border: '#ECEDEF',
  chip: '#EFEFEF',
};

const TABS = ['Order Placed', 'Out for delivery', 'Delivered', 'Completed'];

const sampleStores = [
  {
    id: 'store-1',
    name: 'Sasha Stores',
    items: [
      {
        id: '1',
        title: 'Iphone 16 pro max - Black',
        price: '₦2,500,000',
        qty: 1,
        img: 'https://picsum.photos/seed/iphone1/120/80',
      },
      {
        id: '2',
        title: 'Iphone 16 pro max - Black',
        price: '₦2,500,000',
        qty: 1,
        img: 'https://picsum.photos/seed/iphone2/120/80',
      },
    ],
  },
  {
    id: 'store-2',
    name: 'Vee Stores',
    items: [
      {
        id: '3',
        title: 'Iphone 16 pro max - Black',
        price: '₦2,500,000',
        qty: 1,
        img: 'https://picsum.photos/seed/iphone3/120/80',
      },
      {
        id: '4',
        title: 'Iphone 16 pro max - Black',
        price: '₦2,500,000',
        qty: 1,
        img: 'https://picsum.photos/seed/iphone4/120/80',
      },
    ],
  },
];

export default function OrderDetailsScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [active, setActive] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {TABS.map((t, idx) => {
          const isActive = active === idx;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.8}
              onPress={() => setActive(idx)}
              style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
            >
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {sampleStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* Store card with red header and items list */
const StoreCard = ({ store }) => {
  return (
    <View style={styles.storeCard}>
      {/* Red header */}
      <View style={styles.storeHeader}>
        <Text style={styles.storeTitle}>{store.name}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.85} style={styles.chatBtn}>
            <Text style={styles.chatBtnText}>Start Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.headerIcon}>
            <Ionicons name="close" size={16} color="#E53E3E" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.headerIcon}>
            <Ionicons name="heart-outline" size={16} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items */}
      <View style={{ padding: 10}}>
        {store.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.img }} style={styles.itemImg} />

            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Text style={styles.itemQty}>Qty : {item.qty}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Open Chat input style */}
        <View style={styles.openChatBox}>
          <Text style={styles.openChatText}>Open Chat</Text>
        </View>

        {/* Expand */}
        <TouchableOpacity activeOpacity={0.7} style={styles.expandBtn}>
          <Text style={styles.expandText}>Expand</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F3F3',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111' },

  /* Tabs */
  tabsWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#FFFFFF', borderBottomColor: '#F0F0F0', borderBottomWidth: 1,
  },
  tab: {
    flex: 1, marginHorizontal: 4, paddingVertical: 10,
    borderRadius: 10, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLOR.primary + '22', borderWidth: 1, borderColor: COLOR.primary },
  tabInactive: { backgroundColor: '#F2F2F2' },
  tabText: { fontSize: 12.5, fontWeight: '600' },
  tabTextActive: { color: COLOR.primary },
  tabTextInactive: { color: '#7C7C7C' },

  /* Store card */
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  storeHeader: {
    backgroundColor: COLOR.primary,
    paddingVertical: 10, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  storeTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 14.5 },

  chatBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 999, marginRight: 8,
  },
  chatBtnText: { color: COLOR.primary, fontWeight: '700', fontSize: 12 },

  headerIcon: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginLeft: 6,
  },

  /* Item card */
  itemCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#EEEEEE',
    flexDirection: 'row',
    padding: 8,
    marginBottom: 10,
  },
  itemImg: { width: 96, height: 72, borderRadius: 8, marginRight: 10, backgroundColor: '#DDD' },
  itemTitle: { fontSize: 13.5, color: '#111', fontWeight: '600' },
  itemPrice: { marginTop: 6, color: COLOR.primary, fontWeight: '800', fontSize: 14 },
  itemQty: { color: COLOR.primary, marginTop: 4, fontWeight: '700', fontSize: 12 },

  trackBtn: {
    alignSelf: 'center',
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLOR.primary,
  },
  trackBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  openChatBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#EEEEEE',
    paddingVertical: 12, alignItems: 'center',
    marginTop: 6,
  },
  openChatText: { color: '#555', fontWeight: '600' },

  expandBtn: {
    marginTop: 8, alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#EEEEEE',
  },
  expandText: { color: '#999', fontWeight: '600' },
});
