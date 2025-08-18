import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Image, FlatList, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Modal, Pressable
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ThemedText from '../../../components/ThemedText';

// If you want image picking, install then uncomment:
// import * as ImagePicker from 'expo-image-picker';

const COLOR = { primary: '#E53E3E', bg: '#F5F6F8', lightPink: '#FCDCDC', white: '#fff', text: '#101318', sub: '#6C727A' };
const toSrc = (v) => (typeof v === 'number' ? v : v ? { uri: String(v) } : undefined);
const CATEGORIES = ['Order Dispute', 'Wrong Item', 'Damaged Item', 'Late Delivery', 'Refund Request', 'Other'];

export default function ChatDetailsScreen() {
    const navigation = useNavigation();
    const { params } = useRoute();
    const store = params?.store || {};
    const avatarSrc = toSrc(store?.profileImage);
    const insets = useSafeAreaInsets();

    const [headerH, setHeaderH] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDispute, setShowDispute] = useState(false);

    const [messages, setMessages] = useState([
        { id: 1, text: 'How will i get the product delivered', sender: 'me', time: '07:22AM' },
        { id: 2, text: 'Thank you for purchasing from us', sender: 'store', time: '07:22AM' },
        { id: 3, text: 'I will arrange a dispatch rider soon and i will contact you', sender: 'store', time: '07:22AM' },
        { id: 4, text: 'Okay i will be expecting.', sender: 'me', time: '07:29AM' },
    ]);

    const [inputText, setInputText] = useState('');
    const listRef = useRef(null);

    useEffect(() => {
        const a = Keyboard.addListener('keyboardDidShow', scrollToEnd);
        const b = Keyboard.addListener('keyboardDidHide', scrollToEnd);
        return () => { a.remove(); b.remove(); };
    }, []);

    const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    const handleSend = () => {
        const v = inputText.trim();
        if (!v) return;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
        setMessages((prev) => [...prev, { id: Date.now(), text: v, sender: 'me', time }]);
        setInputText('');
        scrollToEnd();
    };

    const KAV_OFFSET = Platform.OS === 'ios' ? insets.top + headerH : 0;

    // ---------- Dispute modal state ----------
    const [issueCategory, setIssueCategory] = useState('');
    const [issueDetails, setIssueDetails] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const resetDisputeForm = () => {
        setIssueCategory('');
        setIssueDetails('');
        setImageUri(null);
    };

    const submitDispute = () => {
        if (!issueCategory || !issueDetails.trim()) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

        // push a special "dispute" message
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                type: 'dispute',
                sender: 'me',
                time,
                payload: { category: issueCategory, details: issueDetails.trim(), imageUri }
            }
        ]);

        setShowDispute(false);
        resetDisputeForm();
        scrollToEnd();
    };

    // Optional: image picker (Expo)
    // const pickImage = async () => {
    //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //   if (status !== 'granted') return;
    //   const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    //   if (!result.canceled) setImageUri(result.assets[0].uri);
    // };

    const pickImage = () => { }; // no-op if you don't need images now

    // ---------- Renderers ----------
    const renderMessage = ({ item }) => {
        if (item.type === 'dispute') {
            const { category, details } = item.payload || {};
            return (
                <View style={styles.disputeCard}>
                    <ThemedText style={styles.disputeLabel}>Category</ThemedText>
                    <ThemedText style={styles.disputeValue}>{category}</ThemedText>

                    <ThemedText style={[styles.disputeLabel, { marginTop: 10 }]}>Details</ThemedText>
                    <ThemedText style={styles.disputeValue}>{details}</ThemedText>

                    <View style={styles.disputeNotice}>
                        <ThemedText style={styles.disputeNoticeText}>
                            Kindly be patient, a  customer agent will join you shortly
                        </ThemedText>
                    </View>
                </View>
            );
        }

        const mine = item.sender === 'me';
        return (
            <View style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft]}>
                <ThemedText style={[styles.msg, { color: mine ? '#fff' : '#000' }]}>{item.text}</ThemedText>
                <ThemedText style={[styles.time, { color: mine ? '#fff' : '#000' }]}>{item.time}</ThemedText>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={KAV_OFFSET}>
                {/* Header */}
                <View style={styles.header} onLayout={e => setHeaderH(e.nativeEvent.layout.height)}>
                    <TouchableOpacity style={styles.hIcon} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Image source={avatarSrc} style={styles.avatar} />
                        <View>
                            <ThemedText style={styles.storeName}>{store?.name || 'Sasha Stores'}</ThemedText>
                            <ThemedText style={styles.lastSeen}>Last seen 2 mins ago</ThemedText>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.hIcon} onPress={() => setMenuOpen(v => !v)}>
                            <Ionicons name="ellipsis-vertical" size={18} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.hIcon}>
                            <Ionicons name="cart-outline" size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Popover menu */}
                {/* Popover menu */}
                <Modal
                    visible={menuOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setMenuOpen(false)}
                >
                    {/* tap outside to close */}
                    <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />
                    <View style={[styles.popover, { top: insets.top + headerH + 6, right: 16 }]}>
                        <TouchableOpacity
                            style={styles.popoverItem}
                            onPress={() => { setMenuOpen(false); setShowDispute(true); }}
                        >
                            <ThemedText style={styles.popoverText}>Create a dispute</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Modal>


                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(i) => String(i.id)}
                    contentContainerStyle={{ padding: 16, paddingBottom: 8 + insets.bottom }}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                    renderItem={renderMessage}
                    onContentSizeChange={scrollToEnd}
                    style={{ flex: 1 }}
                />

                {/* Composer */}
                <View style={[styles.composer, { marginBottom: 10 + insets.bottom }]}>
                    <TouchableOpacity><Ionicons name="attach" size={20} color="#777" /></TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message"
                        placeholderTextColor="#777"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity onPress={handleSend}><Ionicons name="send" size={20} color="#000" /></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ------------- Full-screen Dispute Modal ------------- */}
            <Modal animationType="slide" visible={showDispute} presentationStyle="fullScreen" onRequestClose={() => setShowDispute(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
                    {/* Modal header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDispute(false)} style={styles.hIcon}>
                            <Ionicons name="chevron-back" size={22} color="#000" />
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>Support Form</ThemedText>
                        <View style={{ width: 32 }} />
                    </View>

                    <View style={{ flex: 1, backgroundColor: COLOR.bg, paddingHorizontal: 16, paddingTop: 8 }}>
                        {/* Category field */}
                        <TouchableOpacity style={styles.selectRow} onPress={() => {
                            // simple inline picker; replace with a real picker if you like
                            const i = Math.max(0, CATEGORIES.indexOf(issueCategory));
                            const next = CATEGORIES[(i + 1) % CATEGORIES.length];
                            setIssueCategory(next);
                        }}>
                            <ThemedText style={[styles.selectText, { color: issueCategory ? '#000' : '#9BA0A6' }]}>
                                {issueCategory || 'Issue Category'}
                            </ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#000" />
                        </TouchableOpacity>

                        {/* Details */}
                        <TextInput
                            style={styles.detailsInput}
                            placeholder="Type Issue Details"
                            placeholderTextColor="#9BA0A6"
                            value={issueDetails}
                            onChangeText={setIssueDetails}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Image attach (optional) */}
                        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                            ) : (
                                <Ionicons name="image" size={22} color="#9BA0A6" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Proceed */}
                    <View style={{ padding: 16 }}>
                        <TouchableOpacity
                            onPress={submitDispute}
                            disabled={!issueCategory || !issueDetails.trim()}
                            style={[styles.proceedBtn, { opacity: (!issueCategory || !issueDetails.trim()) ? 0.6 : 1 }]}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: '400' }}>Proceed</ThemedText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hIcon: { padding: 6, borderColor: '#ddd', borderWidth: 1, borderRadius: 20 },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginHorizontal: 10 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    storeName: { fontSize: 16, color: '#000', fontWeight: '400' },
    lastSeen: { fontSize: 11, color: '#888' },

    bubble: { maxWidth: '76%', padding: 12, borderRadius: 20, marginVertical: 5 },
    bubbleLeft: { alignSelf: 'flex-start', backgroundColor: COLOR.lightPink, borderTopLeftRadius: 6 },
    bubbleRight: { alignSelf: 'flex-end', backgroundColor: COLOR.primary, borderBottomRightRadius: 6 },
    msg: { fontSize: 13 },
    time: { fontSize: 10, textAlign: 'right', marginTop: 6 },

    composer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, borderWidth: 0.3, borderColor: '#ddd',
    },
    input: { flex: 1, fontSize: 14, paddingVertical: Platform.OS === 'ios' ? 8 : 10, color: '#000', marginHorizontal: 10 },

    // Popover
    popover: {
        position: 'absolute', backgroundColor: '#fff', borderRadius: 12,
        paddingVertical: 8, minWidth: 170, shadowColor: '#000',
        shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    popoverItem: { paddingHorizontal: 14, paddingVertical: 10 },
    popoverText: { color: '#000' },

    // Dispute card in chat
    disputeCard: {
        backgroundColor: '#FFE8E8', borderColor: '#F7B6B6', borderWidth: 1,
        borderRadius: 12, padding: 12, marginVertical: 8, alignSelf: 'stretch',
    },
    disputeLabel: { color: '#7A7A7A', fontSize: 12 },
    disputeValue: { color: '#000', fontSize: 13, marginTop: 2 },
    disputeNotice: {
        borderRadius: 999, borderWidth: 1, borderColor: '#EF534E',
        paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', marginTop: 12,
        backgroundColor: '#FFE8E8',
    },
    disputeNoticeText: { color: '#EF534E', fontSize: 12 },

    // Modal styles
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    },
    modalTitle: { fontSize: 16, color: '#000', fontWeight: '600' },

    selectRow: {
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8,
    },
    selectText: { fontSize: 14 },

    detailsInput: {
        backgroundColor: '#fff', borderRadius: 12, marginTop: 12, height: 160, padding: 12,
        fontSize: 14, color: '#000',
    },
    imageBox: {
        width: 56, height: 56, borderRadius: 10, backgroundColor: '#EDEDED',
        alignItems: 'center', justifyContent: 'center', marginTop: 14,
    },
    proceedBtn: {
        backgroundColor: COLOR.primary, borderRadius: 15, alignItems: 'center',
        paddingVertical: 18,
    },
});
