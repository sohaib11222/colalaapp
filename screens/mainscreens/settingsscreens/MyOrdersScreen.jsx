// MyOrdersScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const COLOR = {
  primary: '#E53E3E',
  white: '#FFFFFF',
  text: '#101318',
  sub: '#6C727A',
  border: '#ECEDEF',
  chip: '#F5F6F8',
  pinkLite: '#F8D8D8', // soft pink circle
};

const mockOrders = [
  { id: 'Ord-1wcjcn', stores: 2, amount: '₦9,999,990' },
  { id: 'Ord-1wcjcn2', stores: 2, amount: '₦9,999,990' },
  { id: 'Ord-1wcjcn3', stores: 2, amount: '₦9,999,990' },
  { id: 'Ord-1wcjcn4', stores: 2, amount: '₦9,999,990' },
  { id: 'Ord-1wcjcn5', stores: 2, amount: '₦9,999,990' },
];

export default function MyOrdersScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      style={styles.card}
    >
      {/* Left icon circle */}
      <View style={styles.leftCircle}>
        <Ionicons name="cart" size={20} color="#E53E3E" />
      </View>

      {/* Middle texts */}
      <View style={{ flex: 1 }}>
        <Text style={styles.orderId} numberOfLines={1}>{item.id}</Text>
        <Text style={styles.storesText}>{item.stores} stores</Text>
      </View>

      {/* Amount right */}
      <Text style={styles.amountText}>{item.amount}</Text>
    </TouchableOpacity>
  );

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
        <View style={{ width: 36 }} />{/* spacer to center title */}
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        data={mockOrders}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 22, paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#111' },

  card: {
    backgroundColor: COLOR.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  leftCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#F1D1D1",
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  orderId: { fontSize: 14.5, fontWeight: '600', color: COLOR.text },
  storesText: { marginTop: 3, fontSize: 12, color: COLOR.sub },
  amountText: { marginLeft: 10, fontSize: 14.5, fontWeight: '800', color: COLOR.primary },
});
