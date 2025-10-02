import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput,
  FlatList, SafeAreaView, Dimensions, Modal, Pressable, Image, Platform,
  ScrollView, KeyboardAvoidingView, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../../../components/ThemedText'; // ← adjust path if needed

const COLOR = { primary:'#E53E3E', white:'#fff', text:'#101318', sub:'#6C727A', border:'#ECEDEF', pill:'#F1F2F5', line:'#E9EBEF', danger:'#E74C3C' };
const { width } = Dimensions.get('window');

import {useListOfAllSavedItems, fileUrl} from '../../../config/api.config';
import { useQueryClient } from '@tanstack/react-query';


/* ------- Card sizes ------- */
const productCardWidth = (width - 48) / 2;          // Products/Services

const TABS = ['Products', 'Services', 'Posts'];
const LOCATIONS = ['All', 'Lagos, Nigeria', 'Abuja, Nigeria', 'Kano, Nigeria'];
const PRODUCT_CATEGORIES = ['All', 'Laptops', 'Phones', 'Accessories'];
const SERVICE_CATEGORIES = ['All', 'Fashion', 'Repairs', 'Beauty'];

const SAVED_PRODUCTS = [
  { id: '1', title: 'Dell Inspiron Laptop', store: 'Sasha Stores', store_image: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', rating: 4.5, price: '₦2,000,000', originalPrice: '₦3,000,000', image: require('../../../assets/Frame 264.png'), tagImages: [require('../../../assets/freedel.png'), require('../../../assets/bulk.png')], category: 'Laptops', sponsored: true },
  { id: '2', title: 'Dell Inspiron Laptop', store: 'Sasha Stores', store_image: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', rating: 4.5, price: '₦2,000,000', originalPrice: '₦3,000,000', image: require('../../../assets/Frame 264 (1).png'), tagImages: [require('../../../assets/freedel.png'), require('../../../assets/bulk.png')], category: 'Laptops', sponsored: true },
  { id: '3', title: 'Dell Inspiron Laptop', store: 'Sasha Stores', store_image: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', rating: 4.5, price: '₦2,000,000', originalPrice: '₦3,000,000', image: require('../../../assets/Frame 264 (2).png'), tagImages: [require('../../../assets/freedel.png'), require('../../../assets/bulk.png')], category: 'Laptops' },
  { id: '4', title: 'Dell Inspiron Laptop', store: 'Sasha Stores', store_image: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', rating: 4.5, price: '₦2,000,000', originalPrice: '₦3,000,000', image: require('../../../assets/Frame 264 (3).png'), tagImages: [require('../../../assets/freedel.png'), require('../../../assets/bulk.png')], category: 'Laptops' },
];


/* -------- Services -------- */
const SAVED_SERVICES = [
  { id: 's1', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Rectangle 32.png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
  { id: 's2', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Frame 264 (4).png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
  { id: 's3', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Frame 264 (5).png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
  { id: 's4', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Rectangle 32.png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
  { id: 's5', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Frame 264 (4).png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
  { id: 's6', name: 'Sasha Stores', service: 'Fashion designing Service', price: '₦5,000 - ₦100,000', image: require('../../../assets/Frame 264 (5).png'), rating: 4.5, profileImage: require('../../../assets/Ellipse 18.png'), location: 'Lagos, Nigeria', category: 'Fashion' },
];

/* -------- Posts (from FeedScreen) -------- */
const SAVED_POSTS = [
  {
    id: 'p1',
    store: 'Sasha Stores',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    location: 'Lagos, Nigeria',
    timeAgo: '20 min ago',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
    ],
    caption: 'Get this phone at a cheap price for a limited period',
    likes: 500, comments: 26, shares: 26,
  },
  {
    id: 'p2',
    store: 'Vee Stores',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop',
    location: 'Lagos, Nigeria',
    timeAgo: '20 min ago',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
    caption: 'Weekend discount on accessories only!',
    likes: 128, comments: 12, shares: 8,
  },
];

const SavedItemsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Products');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState('All');
  const [picker, setPicker] = useState(null);

  // API Integration
  const { data: savedItemsRes, isLoading, error } = useListOfAllSavedItems();
  const apiSavedItems = savedItemsRes?.data || [];

  // Debug logging
  console.log("=== SAVED ITEMS SCREEN DEBUG ===");
  console.log("API Response:", savedItemsRes);
  console.log("Saved Items from API:", apiSavedItems);
  console.log("API Error Details:", error);
  console.log("Navigation object:", navigation);
  console.log("Navigation available:", !!navigation);
  console.log("Navigation methods:", navigation ? Object.keys(navigation) : "No navigation");
  
  // Log the structure of saved items to understand the data format
  if (apiSavedItems.length > 0) {
    console.log("=== SAVED ITEMS STRUCTURE DEBUG ===");
    apiSavedItems.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item.id,
        type: item.type,
        product_id: item.product_id,
        service_id: item.service_id,
        name: item.name,
        price: item.price
      });
    });
  }

  // Map API data to component format
  const mapApiProductToComponent = (apiItem) => {
    console.log("=== MAPPING PRODUCT ===");
    console.log("Original API Item:", apiItem);
    console.log("Product ID:", apiItem.id);
    console.log("Product ID Type:", typeof apiItem.id);
    console.log("Product Name:", apiItem.name);
    console.log("Product Price:", apiItem.price);
    console.log("Product ID from API:", apiItem.product_id);
    
    // Use product_id if available, otherwise use id
    const productId = apiItem.product_id || apiItem.id;
    console.log("Using Product ID for navigation:", productId);
    
    const mapped = {
      id: String(productId), // Use the correct product ID for navigation
      title: apiItem.name || 'Product',
      store: 'Store', // Store name not provided in API
      store_image: require('../../../assets/Ellipse 18.png'),
      location: 'Lagos, Nigeria', // Default location
      rating: 4.5, // Default rating
      price: `₦${parseFloat(apiItem.price || 0).toLocaleString()}`,
      originalPrice: apiItem.discount_price ? `₦${parseFloat(apiItem.discount_price).toLocaleString()}` : null,
      image: apiItem.images?.[0] ? { uri: apiItem.images[0] } : require('../../../assets/Frame 264.png'),
      tagImages: [require('../../../assets/freedel.png'), require('../../../assets/bulk.png')],
      category: 'Products',
      sponsored: false,
      // Add original API data for navigation
      originalApiData: apiItem,
    };
    
    console.log("Mapped Product:", mapped);
    return mapped;
  };

  const mapApiServiceToComponent = (apiItem) => {
    console.log("=== MAPPING SERVICE ===");
    console.log("Original API Item:", apiItem);
    console.log("Service ID:", apiItem.id);
    console.log("Service ID Type:", typeof apiItem.id);
    console.log("Service Name:", apiItem.name);
    console.log("Service Price:", apiItem.price);
    console.log("Service ID from API:", apiItem.service_id);
    console.log("Service Media:", apiItem.media);
    
    // Use service_id if available, otherwise use id
    const serviceId = apiItem.service_id || apiItem.id;
    console.log("Using Service ID for navigation:", serviceId);
    
    // Get service image from media array
    const serviceImage = apiItem.media && apiItem.media.length > 0 
      ? { uri: apiItem.media[0] } 
      : require('../../../assets/Rectangle 32.png');
    
    const mapped = {
      id: String(serviceId), // Use the correct service ID for navigation
      name: 'Store', // Store name not provided in API
      service: apiItem.name || 'Service',
      price: apiItem.price ? `₦${parseFloat(apiItem.price).toLocaleString()}` : 'Contact for price',
      image: serviceImage, // Use actual service image from API
      rating: 4.5, // Default rating
      profileImage: require('../../../assets/Ellipse 18.png'),
      location: 'Lagos, Nigeria', // Default location
      category: 'Services',
      // Add original API data for navigation
      originalApiData: apiItem,
    };
    
    console.log("Mapped Service:", mapped);
    return mapped;
  };

  const mapApiPostToComponent = (apiItem) => ({
    id: String(apiItem.id),
    store: 'Store', // Store name not provided in API
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    location: 'Lagos, Nigeria', // Default location
    timeAgo: new Date(apiItem.saved_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    images: apiItem.post?.media_urls?.map(media => fileUrl(media.url)) || [],
    image: apiItem.post?.media_urls?.[0] ? fileUrl(apiItem.post.media_urls[0].url) : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
    caption: apiItem.post?.body || 'Check out this amazing product',
    likes: apiItem.post?.likes_count || 0,
    comments: apiItem.post?.comments_count || 0,
    shares: apiItem.post?.shares_count || 0,
  });

  // posts sheets
  const [activePost, setActivePost] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // Query client for refresh functionality
  const queryClient = useQueryClient();
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Reset filters when switching tabs
  useEffect(() => { setQuery(''); setLocation('All'); setCategory('All'); }, [activeTab]);

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch saved items query
      await queryClient.invalidateQueries({ queryKey: ['savedItems'] });
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const filteredProducts = useMemo(() => {
    console.log("=== FILTERING PRODUCTS ===");
    console.log("Active tab:", activeTab);
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
    console.log("API saved items length:", apiSavedItems.length);
    
    if (activeTab !== 'Products') return [];
    
    // Use API data if available, otherwise fallback to dummy data
    let products = [];
    if (!isLoading && !error && apiSavedItems.length > 0) {
      const apiProducts = apiSavedItems.filter(item => item.type === 'product');
      console.log("API Products found:", apiProducts.length);
      products = apiProducts.map(mapApiProductToComponent);
      console.log("Mapped API Products:", products);
    } else if (error) {
      console.log("API Error, using dummy products:", error);
      products = SAVED_PRODUCTS;
    } else {
      console.log("Using dummy products");
      products = SAVED_PRODUCTS;
    }
    
    const q = query.trim().toLowerCase();
    const filtered = products.filter(p =>
      (p.title + p.store).toLowerCase().includes(q) &&
      (location === 'All' || p.location === location) &&
      (category === 'All' || p.category === category)
    );
    
    console.log("Final filtered products:", filtered);
    console.log("Filtered products count:", filtered.length);
    return filtered;
  }, [activeTab, query, location, category, apiSavedItems, isLoading, error]);


  const filteredServices = useMemo(() => {
    console.log("=== FILTERING SERVICES ===");
    console.log("Active tab:", activeTab);
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
    console.log("API saved items length:", apiSavedItems.length);
    
    if (activeTab !== 'Services') return [];
    
    // Use API data if available, otherwise fallback to dummy data
    let services = [];
    if (!isLoading && !error && apiSavedItems.length > 0) {
      const apiServices = apiSavedItems.filter(item => item.type === 'service');
      console.log("API Services found:", apiServices.length);
      services = apiServices.map(mapApiServiceToComponent);
      console.log("Mapped API Services:", services);
    } else if (error) {
      console.log("API Error, using dummy services:", error);
      services = SAVED_SERVICES;
    } else {
      console.log("Using dummy services");
      services = SAVED_SERVICES;
    }
    
    const q = query.trim().toLowerCase();
    const filtered = services.filter(s =>
      (!q || s.service.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) &&
      (location === 'All' || s.location === location) &&
      (category === 'All' || s.category === category)
    );
    
    console.log("Final filtered services:", filtered);
    console.log("Filtered services count:", filtered.length);
    return filtered;
  }, [activeTab, query, location, category, apiSavedItems, isLoading, error]);

  const filteredPosts = useMemo(() => {
    if (activeTab !== 'Posts') return [];
    
    // Use API data if available, otherwise fallback to dummy data
    let posts = [];
    if (!isLoading && !error && apiSavedItems.length > 0) {
      const apiPosts = apiSavedItems.filter(item => item.type === 'post');
      posts = apiPosts.map(mapApiPostToComponent);
      console.log("Mapped API Posts:", posts);
    } else if (error) {
      console.log("API Error, using dummy posts:", error);
      posts = SAVED_POSTS;
    } else {
      console.log("Using dummy posts");
      posts = SAVED_POSTS;
    }
    
    const q = query.trim().toLowerCase();
    return posts.filter(p =>
      (!q || p.caption?.toLowerCase().includes(q) || p.store.toLowerCase().includes(q)) &&
      (location === 'All' || p.location === location)
    );
  }, [activeTab, query, location, apiSavedItems, isLoading, error]);

  const isServices = activeTab === 'Services';
  const isPosts = activeTab === 'Posts';

  const listData = isServices ? filteredServices : isPosts ? filteredPosts : filteredProducts;
  const listKey  = isServices ? 'services' : isPosts ? 'posts' : 'products';
  const placeholder = isServices ? 'Search Service' : isPosts ? 'Search Post' : 'Search Product';

  /* ---------- Post helpers (Feed design) ---------- */
  const openComments = (post) => { setActivePost(post); setCommentsVisible(true); };
  const openOptions  = (post) => { setActivePost(post); setOptionsVisible(true); };

  const PostCard = ({ item }) => {
    const [liked, setLiked] = useState(false);
    const likeCount = liked ? item.likes + 1 : item.likes;
    const images = item.images?.length ? item.images : [item.image];
    const [activeIdx, setActiveIdx] = useState(0);
    const [carouselW, setCarouselW] = useState(0);

    return (
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => navigation?.navigate?.('MainNavigator', { 
          screen: 'FeedScreen', 
          params: { postId: item.id, post: item } 
        })}
        activeOpacity={0.95}
      >
        {/* Top bar */}
        <View style={styles.postTop}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.storeNamePost}>{item.store}</ThemedText>
            <ThemedText style={styles.metaText}>{item.location} · {item.timeAgo}</ThemedText>
          </View>
          <TouchableOpacity onPress={() => openOptions(item)}>
            <Ionicons name="ellipsis-vertical" size={18} color={COLOR.sub} />
          </TouchableOpacity>
        </View>

        {/* Media */}
        <View style={styles.carouselWrap} onLayout={(e)=>setCarouselW(e.nativeEvent.layout.width)}>
          {carouselW>0 && (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onScroll={(e)=>{
                const x=e.nativeEvent.contentOffset.x;
                setActiveIdx(Math.round(x / carouselW));
              }} scrollEventThrottle={16}>
              {images.map((uri, idx)=>(
                <Image key={`${item.id}-img-${idx}`} source={{ uri }} style={[styles.postImage,{ width: carouselW }]} />
              ))}
            </ScrollView>
          )}
          {images.length>1 && (
            <View style={styles.dotsRow}>
              {images.map((_,i)=>(
                <View key={`dot-${i}`} style={[styles.dot, i===activeIdx && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {item.caption ? (
          <View style={styles.captionPill}>
            <ThemedText style={styles.captionText}>{item.caption}</ThemedText>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity style={styles.actionBtn} onPress={()=>setLiked(p=>!p)}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={25} color={liked?COLOR.primary:COLOR.text} />
              <ThemedText style={styles.actionCount}>{likeCount}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={()=>openComments(item)}>
              <Ionicons name="chatbubble-outline" size={25} color={COLOR.text} />
              <ThemedText style={styles.actionCount}>{item.comments}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="arrow-redo-outline" size={25} color={COLOR.text} />
              <ThemedText style={styles.actionCount}>{item.shares}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRight}>
            <TouchableOpacity 
              style={styles.visitBtn}
              onPress={() => navigation?.navigate?.('ServiceNavigator', { 
                screen: 'StoreDetails', 
                params: { store: { name: item.store } } 
              })}
            >
              <ThemedText style={styles.visitBtnText}>Visit Store</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <Ionicons name="download-outline" size={24} color={COLOR.text} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const CommentsSheet = ({ visible, onClose, post }) => {
    const inputRef = useRef(null);
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const currentUser = { name: 'Sasha Stores', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' };
    const [comments, setComments] = useState([
      { id: 'c1', user: 'Adam Chris', time: '1 min',
        avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop',
        body: 'This product looks really nice, do you deliver nationwide ?', likes: 30,
        replies: [{ id:'r1', user:'Sasha Stores', time:'1 min',
          avatar: currentUser.avatar, body:'We do deliver nationwide.', mentionOf:'Adam Chris' }]},
    ]);

    const startReply = (c)=>{ setReplyTo({ commentId:c.id, username:c.user }); setText(`@${c.user} `); setTimeout(()=>inputRef.current?.focus(),0); };
    const clearReply = ()=>{ setReplyTo(null); setText(''); inputRef.current?.focus(); };
    const handleSend=()=>{
      const trimmed=text.trim(); if(!trimmed) return;
      if(replyTo){
        const newReply={ id:`r-${Date.now()}`, user:currentUser.name, time:'1 min', avatar:currentUser.avatar,
          body: trimmed.replace(new RegExp(`^@${replyTo.username}\\s*`), ''), mentionOf: replyTo.username };
        setComments(prev=>prev.map(c=>c.id===replyTo.commentId?{...c, replies:[...(c.replies||[]), newReply]}:c));
        setReplyTo(null); setText('');
      }else{
        setComments(prev=>[...prev,{ id:`c-${Date.now()}`, user:currentUser.name, time:'1 min', avatar:currentUser.avatar, body:trimmed, likes:0, replies:[] }]);
        setText('');
      }
    };

    const ReplyBlock = ({ reply })=>(
      <View style={styles.replyContainer}>
        <Image source={{ uri: reply.avatar }} style={styles.commentAvatar} />
        <View style={{ flex:1 }}>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <ThemedText style={styles.commentName}>{reply.user}</ThemedText><ThemedText style={styles.commentTime}>  {reply.time}</ThemedText>
          </View>
          <ThemedText style={styles.commentBody}>
            {reply.mentionOf ? (<><ThemedText style={styles.mentionText}>@{reply.mentionOf} </ThemedText>{reply.body}</>) : reply.body}
          </ThemedText>
        </View>
      </View>
    );

    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex:1 }} activeOpacity={1} onPress={onClose} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>Comments</ThemedText>
              <TouchableOpacity style={{ borderColor:'#000', borderWidth:1.4, borderRadius:20, padding:2, alignItems:'center' }} onPress={onClose}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(i)=>i.id}
              style={{ maxHeight: 420 }}
              renderItem={({ item })=>(
                <View style={{ paddingBottom:4 }}>
                  <View style={styles.commentRow}>
                    <Image source={{ uri:item.avatar }} style={styles.commentAvatar} />
                    <View style={{ flex:1 }}>
                      <View style={{ flexDirection:'row', alignItems:'center' }}>
                        <ThemedText style={styles.commentName}>{item.user}</ThemedText><ThemedText style={styles.commentTime}>  {item.time}</ThemedText>
                      </View>
                      <ThemedText style={styles.commentBody}>{item.body}</ThemedText>
                      <View style={styles.commentMetaRow}>
                        <TouchableOpacity onPress={()=>startReply(item)}><ThemedText style={styles.replyText}>Reply</ThemedText></TouchableOpacity>
                        <View style={{ flexDirection:'row', alignItems:'center' }}>
                          <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLOR.text} />
                          <ThemedText style={styles.commentLikeCount}>  {item.likes}</ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                  {item.replies?.length ? (
                    <View style={styles.repliesWrap}>
                      {item.replies.map((r)=>(<ReplyBlock key={r.id} reply={r} />))}
                    </View>
                  ) : null}
                </View>
              )}
            />

            {replyTo ? (
              <View style={styles.replyingChip}>
                <ThemedText style={styles.replyingText}>Replying to {replyTo.username}</ThemedText>
                <TouchableOpacity onPress={clearReply} style={{ padding:6 }}>
                  <Ionicons name="close-circle" size={18} color={COLOR.sub} />
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <TextInput ref={inputRef} value={text} onChangeText={setText}
                placeholder={replyTo?`Reply to ${replyTo.username}`:'Type a message'} placeholderTextColor={COLOR.sub} style={styles.input} />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Ionicons name="send" size={20} color={COLOR.text} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const OptionsSheet = ({ visible, onClose }) => {
    const Row = ({ icon, label, danger, onPress }) => (
      <TouchableOpacity style={[styles.optionRow, danger && styles.optionRowDanger]} onPress={onPress}>
        <View style={styles.optionLeft}>
          {icon}
          <ThemedText style={[styles.optionLabel, danger && { color: COLOR.danger }]}>{label}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={danger ? COLOR.danger : COLOR.sub} />
      </TouchableOpacity>
    );
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex:1 }} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor:'#F9F9F9' }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>Options</ThemedText>
              <TouchableOpacity style={{ borderColor:'#000', borderWidth:1.4, borderRadius:20, padding:2, alignItems:'center' }} onPress={onClose}>
                <Ionicons name="close" size={18} color={COLOR.text} />
              </TouchableOpacity>
            </View>
            <Row icon={<Ionicons name="share-outline" size={20} color={COLOR.text} />} label="Share this post" onPress={onClose} />
            <Row icon={<Ionicons name="person-add-outline" size={20} color={COLOR.text} />} label="Follow User" onPress={onClose} />
            <Row icon={<Ionicons name="eye-off-outline" size={20} color={COLOR.text} />} label="Hide Post" onPress={onClose} />
            <Row icon={<Ionicons name="warning-outline" size={20} color={COLOR.danger} />} label="Report Post" danger onPress={onClose} />
          </View>
        </View>
      </Modal>
    );
  };

  /* ---------- Product / Store / Service renderers ---------- */
  const renderItem = ({ item }) => {
    console.log("=== RENDER ITEM DEBUG ===");
    console.log("Rendering item:", item);
    console.log("Item ID:", item?.id);
    console.log("Item type:", typeof item?.id);
    console.log("Is Posts:", isPosts);
    console.log("Is Services:", isServices);
    console.log("Active tab:", activeTab);
    
    if (isPosts) return <PostCard item={item} />;
    if (isServices) {
      return (
        <TouchableOpacity 
          style={styles.serviceCard} 
          onPress={() => {
            console.log("=== SERVICE NAVIGATION DEBUG ===");
            console.log("Service item being clicked:", item);
            console.log("Service ID:", item.id);
            console.log("Service Name:", item.service);
            console.log("Service Type:", typeof item.id);
            console.log("Navigation object:", navigation);
            console.log("Navigation navigate method:", navigation?.navigate);
            
            const navigationParams = { 
              screen: 'ServiceDetails', 
              params: { service: item } 
            };
            console.log("Navigation params:", navigationParams);
            
            try {
              navigation?.navigate?.('ServiceNavigator', navigationParams);
              console.log("Service navigation call completed successfully");
            } catch (error) {
              console.error("Service navigation error:", error);
            }
          }}
          activeOpacity={0.9}
        >
          <Image source={item.image} style={styles.serviceImage} />
          <View style={styles.serviceHeader}>
            <Image source={item.profileImage} style={styles.profileImage} />
            <ThemedText style={styles.serviceStoreName}>{item.name}</ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLOR.primary} />
              <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            </View>
          </View>
          <View style={styles.serviceBody}>
            <ThemedText style={styles.serviceTitle}>{item.service}</ThemedText>
            <ThemedText style={styles.servicePrice}>{item.price}</ThemedText>
            <TouchableOpacity style={styles.detailsBtn} onPress={() => {
              console.log("=== SERVICE DETAILS BUTTON NAVIGATION DEBUG ===");
              console.log("Service item being clicked (details button):", item);
              console.log("Service ID:", item.id);
              console.log("Service Name:", item.service);
              console.log("Navigation object:", navigation);
              
              const navigationParams = { 
                screen: 'ServiceDetails', 
                params: { service: item } 
              };
              console.log("Navigation params:", navigationParams);
              
              try {
                navigation?.navigate?.('ServiceNavigator', navigationParams);
                console.log("Service details button navigation call completed successfully");
              } catch (error) {
                console.error("Service details button navigation error:", error);
              }
            }} activeOpacity={0.9}>
              <ThemedText style={styles.detailsText}>Details</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => {
          console.log("=== PRODUCT NAVIGATION DEBUG ===");
          console.log("Item being clicked:", item);
          console.log("Item ID:", item.id);
          console.log("Item Type:", typeof item.id);
          console.log("Navigation object:", navigation);
          console.log("Navigation navigate method:", navigation?.navigate);
          
          const navigationParams = { 
            screen: 'ProductDetails', 
            params: { productId: item.id } 
          };
          console.log("Navigation params:", navigationParams);
          
          try {
            navigation?.navigate?.('CategoryNavigator', navigationParams);
            console.log("Navigation call completed successfully");
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }} 
        style={styles.productCard}
      >
        <View>
          <Image source={item.image} style={styles.productImage} resizeMode="cover" />
          {item.sponsored ? (<View style={styles.sponsoredBadge}><ThemedText style={styles.sponsoredText}>Sponsored</ThemedText></View>) : null}
        </View>
        <View style={[styles.rowBetween, styles.storeBar]}>
          <View style={styles.storeRow}>
            <Image source={item.store_image} style={styles.storeAvatar} />
            <ThemedText style={styles.storeName}>{item.store}</ThemedText>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" color="#E53E3E" size={12} /><ThemedText style={styles.rating}>{item.rating}</ThemedText>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <ThemedText numberOfLines={2} style={styles.productTitle}>{item.title}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>{item.price}</ThemedText>
            {!!item.originalPrice && <ThemedText style={styles.originalPrice}>{item.originalPrice}</ThemedText>}
          </View>
          {!!item.tagImages?.length && (
            <View style={styles.tagsRow}>
              {item.tagImages.map((src, i)=>(<Image key={i} source={src} style={styles.tagIcon} resizeMode="contain" />))}
            </View>
          )}
          <View style={styles.rowBetween}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#444" style={{ marginRight: 2 }} />
              <ThemedText numberOfLines={1} style={styles.location}>{item.location}</ThemedText>
            </View>
            <TouchableOpacity onPress={() => {
              console.log("=== PRODUCT CART ICON NAVIGATION DEBUG ===");
              console.log("Item being clicked (cart icon):", item);
              console.log("Item ID:", item.id);
              console.log("Navigation object:", navigation);
              
              const navigationParams = { 
                screen: 'ProductDetails', 
                params: { productId: item.id } 
              };
              console.log("Navigation params:", navigationParams);
              
              try {
                navigation?.navigate?.('CategoryNavigator', navigationParams);
                console.log("Cart icon navigation call completed successfully");
              } catch (error) {
                console.error("Cart icon navigation error:", error);
              }
            }}>
              <Image source={require('../../../assets/Frame 265.png')} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPicker = (type) => {
    const options =
      type === 'location'
        ? LOCATIONS
        : activeTab === 'Services'
          ? SERVICE_CATEGORIES
          : PRODUCT_CATEGORIES;

    return (
      <Modal visible={picker === type} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)}>
          <View style={styles.sheet}>
            {options.map(opt => (
              <TouchableOpacity key={opt} style={styles.sheetItem} onPress={() => { type === 'location' ? setLocation(opt) : setCategory(opt); setPicker(null); }}>
                <ThemedText style={[styles.sheetText, (type === 'location' ? location : category) === opt && { color: COLOR.primary, fontWeight: '600' }]}>{opt}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.circleBtn}>
          <Ionicons name="chevron-back" size={22} color="#101318" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Saved Items</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      {/* Header loading indicator */}
      {isLoading && (
        <View style={styles.headerLoadingContainer}>
          <ActivityIndicator size="small" color={COLOR.primary} />
          <ThemedText style={styles.headerLoadingText}>Loading saved items...</ThemedText>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}>
            <ThemedText style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search & Filters (hidden for Posts) */}
      {!isPosts && (
        <>
          <View style={styles.searchBox}>
            {/* <Ionicons name="search" size={18} color="#9AA0A6" /> */}
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#9AA0A6"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>

          <View style={styles.filtersRow}>
            <TouchableOpacity style={styles.filterChip} onPress={() => setPicker('location')}>
              <ThemedText style={styles.filterText}>{location === 'All' ? 'Location' : location}</ThemedText>
              <Ionicons name="chevron-down" size={16} color="#101318" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip} onPress={() => setPicker('category')}>
              <ThemedText style={styles.filterText}>{category === 'All' ? 'Category' : category}</ThemedText>
              <Ionicons name="chevron-down" size={16} color="#101318" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Image source={require('../../../assets/Users.png')} style={{ width: 120, height: 120, opacity: 0.6 }} />
          <ThemedText style={styles.loadingText}>Loading saved items...</ThemedText>
        </View>
      ) : (
        <FlatList
          key={listKey}
          data={listData}
          keyExtractor={(it) => it.id}
          numColumns={isPosts ? 1 : 2}
          columnWrapperStyle={!isPosts ? { justifyContent: 'space-between' } : undefined}
          contentContainerStyle={
            isPosts
              ? { paddingBottom: 24 }
              : { paddingHorizontal: 16, paddingBottom: 24 }
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLOR.primary]}
              tintColor={COLOR.primary}
              title="Pull to refresh"
              titleColor={COLOR.sub}
            />
          }
          ListEmptyComponent={
            <View style={styles.placeholder}>
              <Image source={require('../../../assets/Users.png')} style={{ width: 120, height: 120, opacity: 0.6 }} />
              <ThemedText style={{ color: COLOR.sub, marginTop: 10 }}>{`No saved ${activeTab.toLowerCase()} yet`}</ThemedText>
            </View>
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Pickers */}
      {renderPicker('location')}
      {renderPicker('category')}

      {/* Post sheets */}
      <CommentsSheet visible={commentsVisible} onClose={()=>setCommentsVisible(false)} post={activePost} />
      <OptionsSheet  visible={optionsVisible}  onClose={()=>setOptionsVisible(false)} />
    </SafeAreaView>
  );
};

export default SavedItemsScreen;

/* ---------- Styles ---------- */
function shadow(e = 6) {
  return Platform.select({
    android: { elevation: e },
    ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: e / 2, shadowOffset: { width: 0, height: e / 3 } },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F7' },

  header: {
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 25 : 0, paddingBottom: 12, marginBottom:10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor:"#fff"
  },
  circleBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLOR.text },

  tabsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  tabBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 10, borderRadius: 7, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLOR.primary },
  tabText: { color: COLOR.text, fontSize: 13, fontWeight: '400' },
  tabTextActive: { color: COLOR.white },

  searchBox: {
    marginHorizontal: 16, marginTop: 6, marginBottom: 8,
    backgroundColor: COLOR.white, borderRadius: 20, paddingHorizontal: 12, height: 60,
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLOR.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLOR.text },

  filtersRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 6 },
  filterChip: { flex: 1, backgroundColor: "#EDEDED", borderRadius: 12, paddingHorizontal: 12, height: 42,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLOR.border },
  filterText: { color: COLOR.text, fontSize: 13 },

  // picker
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetItem: { paddingVertical: 12, paddingHorizontal: 6 },
  sheetText: { fontSize: 16, color: COLOR.text },

  placeholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  
  // Loading styles
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60 
  },
  loadingText: { 
    color: COLOR.sub, 
    marginTop: 12, 
    fontSize: 14 
  },

  /* ---- Product card ---- */
  productCard: { backgroundColor: '#fff', borderRadius: 16, marginTop: 12, width: productCardWidth, overflow: 'hidden', ...shadow(4) },
  productImage: { width: '100%', height: 120 },
  sponsoredBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#00000099', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sponsoredText: { color: 'white', fontSize: 10 },
  storeBar: { backgroundColor: '#F2F2F2', width: '100%', padding: 6 },
  infoContainer: { padding: 10 },
  storeName: { fontSize: 12, color: '#E53E3E', fontWeight: '400' },
  productTitle: { fontSize: 13, fontWeight: '500', marginVertical: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { color: '#F44336', fontWeight: '700', fontSize: 14, marginRight: 6 },
  originalPrice: { color: '#999', fontSize: 10, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { marginLeft: 2, fontSize: 11, color: '#000' },
  tagsRow: { flexDirection: 'row', marginTop: 3, gap: 3 },
  tagIcon: { width: 70, height: 20, borderRadius: 50 },
  locationRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  location: { fontSize: 9, color: '#444', fontWeight: '500' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeRow: { flexDirection: 'row', alignItems: 'center' },
  storeAvatar: { width: 20, height: 20, borderRadius: 12, marginRight: 6 },


  /* ---- Service card ---- */
  serviceCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginTop: 12, width: productCardWidth, ...shadow(4) },
  serviceImage: { width: '100%', height: 100 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, padding: 6, backgroundColor: '#F2F2F2' },
  profileImage: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  serviceStoreName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  serviceBody: { padding: 10, paddingTop: 0 },
  serviceTitle: { fontSize: 12, fontWeight: '500', color: '#1A1A1A', marginBottom: 4 },
  servicePrice: { fontSize: 13, color: COLOR.primary, marginBottom: 6, fontWeight: '700' },
  detailsBtn: { backgroundColor: COLOR.primary, paddingVertical: 10, borderRadius: 10 },
  detailsText: { color: '#fff', fontSize: 10, textAlign: 'center', fontWeight: '400' },

  /* ---- Post card (Feed design) ---- */
  postCard: { backgroundColor:'#fff', marginHorizontal:14, marginTop:14, borderRadius:18, padding:12, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:8, shadowOffset:{ width:0, height:2 } },
  postTop: { flexDirection:'row', alignItems:'center', marginBottom:10 },
  avatar: { width:36, height:36, borderRadius:18, marginRight:10 },
  storeNamePost: { fontSize:14, fontWeight:'700', color:COLOR.text },
  metaText: { fontSize:12, color:COLOR.sub, marginTop:2 },
  carouselWrap: { borderRadius:14, overflow:'hidden', backgroundColor:COLOR.line },
  postImage: { height:300, borderRadius:10, resizeMode:'cover', borderTopRightRadius:30, borderTopLeftRadius:30 },
  dotsRow: { position:'absolute', bottom:10, alignSelf:'center', flexDirection:'row', gap:6 },
  dot: { width:6, height:6, borderRadius:3, backgroundColor:'#bbb', opacity:0.6 },
  dotActive: { backgroundColor:COLOR.primary, opacity:1, width:8, height:8, borderRadius:4, marginTop:-1 },
  captionPill: { marginTop:10, backgroundColor:COLOR.pill, borderRadius:12, paddingHorizontal:12, paddingVertical:15 },
  captionText: { color:COLOR.text, fontSize:13 },
  actionsRow: { marginTop:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  actionsLeft: { flexDirection:'row', alignItems:'center' },
  actionBtn: { flexDirection:'row', alignItems:'center', marginRight:14 },
  actionCount: { marginLeft:6, fontSize:12, color:COLOR.text },
  actionsRight: { flexDirection:'row', alignItems:'center' },
  visitBtn: { backgroundColor:COLOR.primary, paddingHorizontal:14, paddingVertical:8, borderRadius:10 },
  visitBtnText: { color:'#fff', fontSize:12, fontWeight:'700' },

  /* ---- Comments / Options shared ---- */
  modalOverlay: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor:'#fff', paddingHorizontal:16, paddingTop:8, paddingBottom:8, borderTopLeftRadius:20, borderTopRightRadius:20 },
  sheetHandle: { alignSelf:'center', width:68, height:6, borderRadius:999, backgroundColor:'#D8DCE2', marginBottom:6 },
  sheetHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8 },
  sheetTitle: { fontSize:18, fontWeight:'700', color:COLOR.text },

  commentRow: { flexDirection:'row', paddingVertical:10 },
  commentAvatar: { width:36, height:36, borderRadius:18, marginRight:10 },
  commentName: { fontWeight:'700', color:COLOR.text },
  commentTime: { color:COLOR.sub, fontSize:12 },
  commentBody: { color:COLOR.text, marginTop:2 },
  commentMetaRow: { flexDirection:'row', alignItems:'center', marginTop:8, justifyContent:'space-between', paddingRight:14 },
  replyText: { color:COLOR.sub },
  commentLikeCount: { color:COLOR.text, fontSize:12 },
  repliesWrap: { marginLeft:44, marginTop:6 },
  replyContainer: { flexDirection:'row', marginTop:10 },
  mentionText: { color:COLOR.primary, fontWeight:'600' },
  replyingChip: { alignSelf:'flex-start', marginTop:8, backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:10, paddingVertical:6, flexDirection:'row', alignItems:'center', gap:6 },
  replyingText: { color:COLOR.sub, fontSize:12 },
  inputRow: { flexDirection:'row', alignItems:'center', backgroundColor:COLOR.pill, borderRadius:16, paddingLeft:14, marginTop:12, marginBottom:6 },
  input: { flex:1, height:46, fontSize:14, color:COLOR.text },
  sendBtn: { width:44, height:46, alignItems:'center', justifyContent:'center' },

  optionRow: { height:56, borderRadius:12, paddingHorizontal:12, marginBottom:10, flexDirection:'row', alignItems:'center', backgroundColor:'#fff', justifyContent:'space-between', ...shadow(1) },
  optionRowDanger: { borderColor:'#FDE2E0', backgroundColor:'#FFF8F8' },
  optionLeft: { flexDirection:'row', alignItems:'center', gap:12 },
  optionLabel: { fontSize:15, color:COLOR.text },

  // Header loading styles
  headerLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: COLOR.white,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerLoadingText: {
    marginLeft: 8,
    color: COLOR.sub,
    fontSize: 14,
    fontWeight: "500",
  },
});
