import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Keyboard, SafeAreaView as RNSafeAreaView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const COLOR = {
  primary: '#E53E3E',
  bg: '#F5F6F8',
  lightPink: '#FCDCDC',
  white: '#fff',
  text: '#101318',
  sub: '#6C727A',
};

const toSrc = (v) => (typeof v === 'number' ? v : v ? { uri: String(v) } : undefined);

export default function StoreChatScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const store = params?.store || {};
  const avatarSrc = toSrc(store?.profileImage);

  // initial messages to match the screenshot order
  const [messages, setMessages] = useState([
    { id: 1, text: 'How will i get the product delivered', sender: 'me', time: '07:22AM' },
    { id: 2, text: 'Thank you for purchasing from us', sender: 'store', time: '07:22AM' },
    { id: 3, text: 'I will arrange a dispatch rider soon and i will contact you', sender: 'store', time: '07:22AM' },
    { id: 4, text: 'Okay i will be expecting.', sender: 'me', time: '07:29AM' },
  ]);

  const [inputText, setInputText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => scrollToEnd());
    const b = Keyboard.addListener('keyboardDidHide', () => scrollToEnd());
    return () => { a.remove(); b.remove(); };
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const handleSend = () => {
    const v = inputText.trim();
    if (!v) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    setMessages((prev) => [...prev, { id: Date.now(), text: v, sender: 'me', time }]);
    setInputText('');
    scrollToEnd();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.hIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={avatarSrc} style={styles.avatar} />
            <View>
              <Text style={styles.storeName}>{store?.name || 'Sasha Stores'}</Text>
              <Text style={styles.lastSeen}>Last seen 2 mins ago</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.hIcon}>
              <Ionicons name="ellipsis-vertical" size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.hIcon}>
              <Ionicons name="cart-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const mine = item.sender === 'me';
            return (
              <View style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.msg, { color: mine ? '#fff' : '#000' }]}>{item.text}</Text>
                <Text style={[styles.time, { color: mine ? '#fff' : '#000' }]}>{item.time}</Text>
              </View>
            );
          }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TouchableOpacity>
            <Ionicons name="attach" size={20} color="#777" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#777"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0.3,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 10,
    color: '#000',
  },
});
