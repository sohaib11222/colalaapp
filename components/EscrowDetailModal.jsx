import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from './ThemedText';

const { width, height } = Dimensions.get('window');

/* ---- THEME ---- */
const COLOR = {
  primary: "#E53E3E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#ECEDEF",
  success: "#18A957",
  danger: "#E53E3E",
  warning: "#F59E0B",
};

const EscrowDetailModal = ({ visible, onClose, escrowItem }) => {
  if (!escrowItem) return null;

  const formatCurrency = (amount) => {
    if (!amount) return "₦0";
    return `₦${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'locked':
        return COLOR.warning;
      case 'released':
        return COLOR.success;
      case 'refunded':
        return COLOR.danger;
      default:
        return COLOR.sub;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'locked':
        return 'lock-closed';
      case 'released':
        return 'checkmark-circle';
      case 'refunded':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return COLOR.warning;
      case 'out_for_delivery':
        return COLOR.primary;
      case 'delivered':
        return COLOR.success;
      case 'cancelled':
        return COLOR.danger;
      default:
        return COLOR.sub;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={COLOR.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Escrow Details</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status Card */}
          <LinearGradient
            colors={[getStatusColor(escrowItem.status), getStatusColor(escrowItem.status) + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <Ionicons 
                name={getStatusIcon(escrowItem.status)} 
                size={32} 
                color="#fff" 
              />
              <View style={styles.statusTextContainer}>
                <ThemedText style={styles.statusTitle}>
                  {escrowItem.status?.toUpperCase()}
                </ThemedText>
                <ThemedText style={styles.statusSubtitle}>
                  Amount: {formatCurrency(escrowItem.amount)}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>

          {/* Product Information */}
          {escrowItem.items && escrowItem.items.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Order Items ({escrowItem.items.length})
              </ThemedText>
              
              {escrowItem.items.map((item, index) => (
                <View key={index} style={[styles.productCard, index > 0 && { marginTop: 12 }]}>
                  {item.product_image && (
                    <Image
                      source={{ uri: item.product_image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.productInfo}>
                    <ThemedText style={styles.productName}>
                      {item.name || 'Unknown Product'}
                    </ThemedText>
                    <ThemedText style={styles.productPrice}>
                      {formatCurrency(item.unit_price)} x {item.qty}
                    </ThemedText>
                    <ThemedText style={styles.productLineTotal}>
                      Total: {formatCurrency(item.line_total)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Order Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Order Information</ThemedText>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Order Number</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {escrowItem.order?.order_no || 'N/A'}
                </ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Payment Status</ThemedText>
                <View style={styles.statusBadge}>
                  <ThemedText style={[styles.statusBadgeText, { color: COLOR.success }]}>
                    {escrowItem.order?.payment_status?.toUpperCase() || 'N/A'}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Order Status</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(escrowItem.order?.status || escrowItem.store_order?.status) + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: getOrderStatusColor(escrowItem.order?.status || escrowItem.store_order?.status) }]}>
                    {(escrowItem.order?.status || escrowItem.store_order?.status)?.toUpperCase() || 'N/A'}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Created Date</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatDate(escrowItem.created_at)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Store Information */}
          {escrowItem.store && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Store Information</ThemedText>
              
              <View style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  {escrowItem.store.profile_image && (
                    <Image
                      source={{ uri: escrowItem.store.profile_image }}
                      style={styles.storeImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.storeInfo}>
                    <ThemedText style={styles.storeName}>
                      {escrowItem.store.store_name || 'Unknown Store'}
                    </ThemedText>
                    <ThemedText style={styles.storeLocation}>
                      Store ID: {escrowItem.store.id}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Financial Details */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Financial Details</ThemedText>
            
            <View style={styles.financialCard}>
              <View style={styles.financialRow}>
                <ThemedText style={styles.financialLabel}>Items Subtotal</ThemedText>
                <ThemedText style={styles.financialValue}>
                  {formatCurrency(escrowItem.store_order?.items_subtotal || escrowItem.amount)}
                </ThemedText>
              </View>
              
              <View style={styles.financialRow}>
                <ThemedText style={styles.financialLabel}>Shipping Fee</ThemedText>
                <ThemedText style={styles.financialValue}>
                  {formatCurrency(escrowItem.shipping_fee || escrowItem.store_order?.shipping_fee)}
                </ThemedText>
              </View>
              
              <View style={[styles.financialRow, styles.financialTotal]}>
                <ThemedText style={styles.financialTotalLabel}>Total Amount</ThemedText>
                <ThemedText style={styles.financialTotalValue}>
                  {formatCurrency(escrowItem.store_order?.total || escrowItem.amount)}
                </ThemedText>
              </View>
              
              <View style={styles.statusInfoRow}>
                <Ionicons 
                  name={getStatusIcon(escrowItem.status)} 
                  size={16} 
                  color={getStatusColor(escrowItem.status)} 
                />
                <ThemedText style={[styles.statusInfoText, { color: getStatusColor(escrowItem.status) }]}>
                  Funds are {escrowItem.status?.toLowerCase()} in escrow
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLOR.card,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.text,
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLOR.line,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR.primary,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    color: COLOR.sub,
    lineHeight: 16,
  },
  productLineTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.text,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  infoLabel: {
    fontSize: 14,
    color: COLOR.sub,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLOR.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLOR.success + '20',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR.success,
  },
  storeCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLOR.line,
  },
  storeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.text,
  },
  storeLocation: {
    fontSize: 12,
    color: COLOR.sub,
    marginTop: 2,
  },
  storeDetails: {
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    paddingTop: 16,
  },
  financialCard: {
    backgroundColor: COLOR.card,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  financialLabel: {
    fontSize: 14,
    color: COLOR.sub,
  },
  financialValue: {
    fontSize: 14,
    color: COLOR.text,
    fontWeight: '500',
  },
  financialTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLOR.primary,
  },
  financialTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR.text,
  },
  financialTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR.primary,
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
  },
  statusInfoText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default EscrowDetailModal;
