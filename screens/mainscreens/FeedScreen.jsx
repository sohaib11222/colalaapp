// // screens/FeedScreen.js
// import React, { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   StatusBar,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import ThemedText from "../../components/ThemedText";
// import { useNavigation } from '@react-navigation/native';

// /* -------------------- THEME -------------------- */
// const COLOR = {
//   primary: "#EF534E",
//   bg: "#F5F6F8",
//   card: "#FFFFFF",
//   text: "#101318",
//   sub: "#6C727A",
//   line: "#E9EBEF",
//   pill: "#F1F2F5",
//   danger: "#E74C3C",
// };

// /* -------------------- MOCK DATA -------------------- */
// const POSTS = [
//   {
//     id: "1",
//     store: "Sasha Stores",
//     avatar:
//       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
//     location: "Lagos, Nigeria",
//     timeAgo: "20 min ago",
//     // multiple images here
//     images: [
//       "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
//     ],
//     caption: "Get this phone at a cheap price for a limited period",
//     likes: 500,
//     comments: 26,
//     shares: 26,
//   },
//   {
//     id: "2",
//     store: "Vee Stores",
//     avatar:
//       "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
//     location: "Lagos, Nigeria",
//     timeAgo: "20 min ago",
//     // single image still works (fallback)
//     image:
//       "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
//     caption: "Weekend discount on accessories only!",
//     likes: 128,
//     comments: 12,
//     shares: 8,
//   },
// ];

// /* -------------------- HEADER -------------------- */
// const FeedHeader = ({ navigation }) => (
//   <View style={styles.header}>
//     <View style={styles.headerTopRow}>
//       <ThemedText font="oleo" style={styles.headerTitle}>Social Feeds</ThemedText>
//       <View style={styles.iconRow}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('ServiceNavigator', { screen: 'Cart' })
//           }
//           style={[styles.iconButton, styles.iconPill]}
//           accessibilityRole="button"
//           accessibilityLabel="Open cart"
//         >
//           <Image
//             source={require('../../assets/cart-icon.png')}
//             style={styles.iconImg}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('ServiceNavigator', { screen: 'Notifications' })
//           }
//           style={[styles.iconButton, styles.iconPill]}
//           accessibilityRole="button"
//           accessibilityLabel="Open notifications"
//         >
//           <Image
//             source={require('../../assets/bell-icon.png')}
//             style={styles.iconImg}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>

//     {/* Search */}
//     <View style={styles.searchContainer}>
//       <TextInput
//         placeholder="Search any product, shop or category"
//         placeholderTextColor="#888"
//         style={styles.searchInput}
//       />
//       <Image
//         source={require('../../assets/camera-icon.png')}
//         style={styles.iconImg}
//       />    </View>
//   </View>
// );

// /* -------------------- POST CARD -------------------- */
// const PostCard = ({ item, onOpenComments, onOpenOptions }) => {
//   const [liked, setLiked] = useState(false);
//   const likeCount = liked ? item.likes + 1 : item.likes;

//   // carousel state
//   const images = item.images?.length ? item.images : [item.image];
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [carouselW, setCarouselW] = useState(0);

//   const onCarouselScroll = (e) => {
//     if (!carouselW) return;
//     const x = e.nativeEvent.contentOffset.x;
//     setActiveIdx(Math.round(x / carouselW));
//   };

//   return (
//     <View style={styles.postCard}>
//       {/* Top bar */}
//       <View style={styles.postTop}>
//         <Image source={{ uri: item.avatar }} style={styles.avatar} />
//         <View style={{ flex: 1 }}>
//           <ThemedText style={styles.storeName}>{item.store}</ThemedText>
//           <ThemedText style={styles.metaText}>
//             {item.location} • {item.timeAgo}
//           </ThemedText>
//         </View>
//         <TouchableOpacity onPress={() => onOpenOptions(item)}>
//           <Ionicons name="ellipsis-vertical" size={18} />
//         </TouchableOpacity>
//       </View>

//       {/* Media (supports multiple images) */}
//       <View
//         style={styles.carouselWrap}
//         onLayout={(e) => setCarouselW(e.nativeEvent.layout.width)}
//       >
//         {carouselW > 0 && (
//           <ScrollView
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onScroll={onCarouselScroll}
//             scrollEventThrottle={16}
//           >
//             {images.map((uri, idx) => (
//               <Image
//                 key={`${item.id}-img-${idx}`}
//                 source={{ uri }}
//                 style={[styles.postImage, { width: carouselW }]}
//               />
//             ))}
//           </ScrollView>
//         )}

//         {/* dots */}
//         {images.length > 1 && (
//           <View style={styles.dotsRow}>
//             {images.map((_, i) => (
//               <View key={`dot-${i}`} style={[styles.dot, i === activeIdx && styles.dotActive]} />
//             ))}
//           </View>
//         )}
//       </View>

//       {/* Caption pill */}
//       {item.caption ? (
//         <View style={styles.captionPill}>
//           <ThemedText style={styles.captionText}>{item.caption}</ThemedText>
//         </View>
//       ) : null}

//       {/* Actions */}
//       <View style={styles.actionsRow}>
//         <View style={styles.actionsLeft}>
//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={() => setLiked((p) => !p)}
//           >
//             <Ionicons
//               name={liked ? "heart" : "heart-outline"}
//               size={23}
//               color={liked ? COLOR.primary : COLOR.text}
//             />
//             <ThemedText style={styles.actionCount}>{likeCount}</ThemedText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={() => onOpenComments(item)}
//           >
//             <Ionicons name="chatbubble-outline" size={23} color={COLOR.text} />
//             <ThemedText style={styles.actionCount}>{item.comments}</ThemedText>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionBtn}>
//             <Ionicons name="arrow-redo-outline" size={23} color={COLOR.text} />
//             <ThemedText style={styles.actionCount}>{item.shares}</ThemedText>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.actionsRight}>
//           <TouchableOpacity style={styles.visitBtn}>
//             <ThemedText style={styles.visitBtnText}>Visit Store</ThemedText>
//           </TouchableOpacity>
//           <TouchableOpacity style={{ marginLeft: 10 }}>
//             <Image
//               source={require("../../assets/DownloadSimple.png")}
//               style={{ width: 30, height: 30 }}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// /* -------------------- COMMENTS SHEET (with inline replies) -------------------- */
// const CommentsSheet = ({ visible, onClose, post }) => {
//   const inputRef = useRef(null);
//   const [text, setText] = useState("");
//   const [replyTo, setReplyTo] = useState(null); // { commentId, username }
//   const currentUser = {
//     name: "Sasha Stores",
//     avatar:
//       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
//   };

//   // stateful comments (supports nested replies)
//   const [comments, setComments] = useState([
//     {
//       id: "c1",
//       user: "Adam Chris",
//       time: "1 min",
//       avatar:
//         "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
//       body: "This product looks really nice, do you deliver nationwide ?",
//       likes: 30,
//       replies: [
//         {
//           id: "r1",
//           user: "Sasha Stores",
//           time: "1 min",
//           avatar:
//             "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
//           body: "We do deliver nationwide.",
//           mentionOf: "Adam Chris",
//         },
//       ],
//     },
//     {
//       id: "c2",
//       user: "Adam Chris",
//       time: "1 min",
//       avatar:
//         "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
//       body: "This product looks really nice, do you deliver nationwide ?",
//       likes: 30,
//       replies: [],
//     },
//     {
//       id: "c3",
//       user: "Adam Chris",
//       time: "1 min",
//       avatar:
//         "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
//       body: "This product looks really nice, do you deliver nationwide ?",
//       likes: 30,
//       replies: [],
//     },
//   ]);

//   const startReply = (c) => {
//     setReplyTo({ commentId: c.id, username: c.user });
//     setText(`@${c.user} `);
//     setTimeout(() => inputRef.current?.focus(), 0);
//   };

//   const clearReply = () => {
//     setReplyTo(null);
//     setText("");
//     inputRef.current?.focus();
//   };

//   const handleSend = () => {
//     const trimmed = text.trim();
//     if (!trimmed) return;

//     if (replyTo) {
//       const newReply = {
//         id: `r-${Date.now()}`,
//         user: currentUser.name,
//         time: "1 min",
//         avatar: currentUser.avatar,
//         body: trimmed.replace(new RegExp(`^@${replyTo.username}\\s*`), ""),
//         mentionOf: replyTo.username,
//       };
//       setComments((prev) =>
//         prev.map((c) =>
//           c.id === replyTo.commentId
//             ? { ...c, replies: [...(c.replies || []), newReply] }
//             : c
//         )
//       );
//       setReplyTo(null);
//       setText("");
//     } else {
//       const newComment = {
//         id: `c-${Date.now()}`,
//         user: currentUser.name,
//         time: "1 min",
//         avatar: currentUser.avatar,
//         body: trimmed,
//         likes: 0,
//         replies: [],
//       };
//       setComments((prev) => [...prev, newComment]);
//       setText("");
//     }
//   };

//   const ReplyBlock = ({ reply }) => (
//     <View style={styles.replyContainer}>
//       <Image source={{ uri: reply.avatar }} style={styles.commentAvatar} />
//       <View style={{ flex: 1 }}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <ThemedText style={styles.commentName}>{reply.user}</ThemedText>
//           <ThemedText style={styles.commentTime}>  {reply.time}</ThemedText>
//         </View>
//         <ThemedText style={styles.commentBody}>
//           {reply.mentionOf ? (
//             <>
//               <ThemedText style={styles.mentionText}>@{reply.mentionOf} </ThemedText>
//               {reply.body}
//             </>
//           ) : (
//             reply.body
//           )}
//         </ThemedText>
//       </View>
//     </View>
//   );

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         style={styles.modalOverlay}
//       >
//         <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
//         <View style={styles.sheet}>
//           <View style={styles.sheetHandle} />
//           <View style={styles.sheetHeader}>
//             <ThemedText font="oleo" style={styles.sheetTitle}>Comments</ThemedText>
//             <TouchableOpacity
//               style={{
//                 borderColor: "#000",
//                 borderWidth: 1.4,
//                 borderRadius: 20,
//                 padding: 2,
//                 alignItems: "center",
//               }}
//               onPress={onClose}
//             >
//               <Ionicons name="close" size={16} color={COLOR.text} />
//             </TouchableOpacity>
//           </View>

//           <FlatList
//             data={comments}
//             keyExtractor={(i) => i.id}
//             style={{ maxHeight: 420 }}
//             showsVerticalScrollIndicator={false}
//             renderItem={({ item }) => (
//               <View style={{ paddingBottom: 4 }}>
//                 {/* main comment */}
//                 <View style={styles.commentRow}>
//                   <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
//                   <View style={{ flex: 1 }}>
//                     <View style={{ flexDirection: "row", alignItems: "center" }}>
//                       <ThemedText style={styles.commentName}>{item.user}</ThemedText>
//                       <ThemedText style={styles.commentTime}>  {item.time}</ThemedText>
//                     </View>
//                     <ThemedText style={styles.commentBody}>{item.body}</ThemedText>

//                     <View style={styles.commentMetaRow}>
//                       <TouchableOpacity onPress={() => startReply(item)}>
//                         <ThemedText style={styles.replyText}>Reply</ThemedText>
//                       </TouchableOpacity>
//                       <View style={{ flexDirection: "row", alignItems: "center" }}>
//                         <Ionicons
//                           name="chatbubble-ellipses-outline"
//                           size={14}
//                           color={COLOR.text}
//                         />
//                         <ThemedText style={styles.commentLikeCount}>  {item.likes}</ThemedText>
//                       </View>
//                     </View>
//                   </View>
//                 </View>

//                 {/* replies */}
//                 {item.replies?.length ? (
//                   <View style={styles.repliesWrap}>
//                     {item.replies.map((r) => (
//                       <ReplyBlock key={r.id} reply={r} />
//                     ))}
//                   </View>
//                 ) : null}
//               </View>
//             )}
//           />

//           {/* Replying chip */}
//           {replyTo ? (
//             <View style={styles.replyingChip}>
//               <ThemedText style={styles.replyingText}>Replying to {replyTo.username}</ThemedText>
//               <TouchableOpacity onPress={clearReply} style={{ padding: 6 }}>
//                 <Ionicons name="close-circle" size={18} color={COLOR.sub} />
//               </TouchableOpacity>
//             </View>
//           ) : null}

//           {/* Input */}
//           <View style={styles.inputRow}>
//             <TextInput
//               ref={inputRef}
//               value={text}
//               onChangeText={setText}
//               placeholder={replyTo ? `Reply to ${replyTo.username}` : "Type a message"}
//               placeholderTextColor={COLOR.sub}
//               style={styles.input}
//             />
//             <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
//               <Ionicons name="send" size={20} color={COLOR.text} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// /* -------------------- OPTIONS SHEET -------------------- */
// const OptionsSheet = ({ visible, onClose }) => {
//   const Row = ({ icon, label, danger, onPress }) => (
//     <TouchableOpacity
//       style={[styles.optionRow, danger && styles.optionRowDanger]}
//       onPress={onPress}
//     >
//       <View style={styles.optionLeft}>
//         {icon}
//         <ThemedText style={[styles.optionLabel, danger && { color: COLOR.danger }]}>{label}</ThemedText>
//       </View>
//       {/* <Ionicons name="chevron-forward" size={18} color={danger ? COLOR.danger : COLOR.sub} /> */}
//     </TouchableOpacity>
//   );

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.modalOverlay}>
//         <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
//         <View style={[styles.sheet, { backgroundColor: "#F9F9F9" }]}>
//           <View style={styles.sheetHandle} />
//           <View style={styles.sheetHeader}>
//             <ThemedText font="oleo" style={styles.sheetTitle}>Options</ThemedText>
//             <TouchableOpacity
//               style={{
//                 borderColor: "#000",
//                 borderWidth: 1.4,
//                 borderRadius: 20,
//                 padding: 2,
//                 alignItems: "center",
//               }}
//               onPress={onClose}
//             >
//               <Ionicons name="close" size={16} color={COLOR.text} />
//             </TouchableOpacity>
//           </View>

//           <Row
//             icon={<Image
//               source={require('../../assets/Vector (16).png')}
//               style={styles.profileImage}
//             />} label="Share this post"
//             onPress={onClose}
//           />
//           <Row
//             icon={<Image
//               source={require('../../assets/Vector (17).png')}
//               style={styles.profileImage}
//             />}
//             label="Follow User"
//             onPress={onClose}
//           />
//           <Row
//             icon={<Image
//               source={require('../../assets/Vector (18).png')}
//               style={styles.profileImage}
//             />} label="Hide Post"
//             onPress={onClose}
//           />
//           <Row
//             icon={<Image
//               source={require('../../assets/Vector (19).png')}
//               style={styles.profileImage}
//             />} label="Report Post"
//             danger
//             onPress={onClose}
//           />
//         </View>
//       </View>
//     </Modal>
//   );
// };

// /* -------------------- SCREEN -------------------- */
// export default function FeedScreen() {

//   const navigation = useNavigation()
//   const [activePost, setActivePost] = useState(null);
//   const [commentsVisible, setCommentsVisible] = useState(false);
//   const [optionsVisible, setOptionsVisible] = useState(false);

//   const openComments = (post) => {
//     setActivePost(post);
//     setCommentsVisible(true);
//   };
//   const openOptions = (post) => {
//     setActivePost(post);
//     setOptionsVisible(true);
//   };

//   return (
//     <View style={styles.screen}>
//       <StatusBar style="dark" />
//       <FlatList
//         data={POSTS}
//         keyExtractor={(it) => it.id}
//         // ListHeaderComponent={<FeedHeader />}
//         ListHeaderComponent={() => <FeedHeader navigation={navigation} />}
//         contentContainerStyle={{ paddingBottom: 32 }}
//         renderItem={({ item }) => (
//           <PostCard item={item} onOpenComments={openComments} onOpenOptions={openOptions} />
//         )}
//         showsVerticalScrollIndicator={false}
//       />

//       <CommentsSheet
//         visible={commentsVisible}
//         onClose={() => setCommentsVisible(false)}
//         post={activePost}
//       />
//       <OptionsSheet
//         visible={optionsVisible}
//         onClose={() => setOptionsVisible(false)}
//       />
//     </View>
//   );
// }

// /* -------------------- STYLES -------------------- */
// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: "#fff" },

//   /* Header */
//   header: {
//     backgroundColor: "#E53E3E",
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 16,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerTitle: { color: "#fff", fontSize: 24, fontWeight: "600" },
//   headerIcons: { flexDirection: "row" },
//   icon: { backgroundColor: "#fff", padding: 6, borderRadius: 30, marginLeft: 8 },
//   searchContainer: {
//     marginTop: 20,
//     backgroundColor: "white",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     height: 50,
//   },
//   searchInput: { flex: 1, fontSize: 14, color: "#333" },
//   cameraIcon: { marginLeft: 8 },

//   /* Post card */
//   postCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 14,
//     marginTop: 14,
//     borderRadius: 18,
//     padding: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   postTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
//   avatar: { width: 55, height: 55, borderRadius: 40, marginRight: 10 },
//   storeName: { fontSize: 14, fontWeight: "400", color: COLOR.text },
//   metaText: { fontSize: 10, color: "#000000B2", marginTop: 2 },

//   carouselWrap: {
//     borderRadius: 14,
//     overflow: "hidden",
//     // backgroundColor: COLOR.line,
//   },
//   postImage: { height: 390, borderRadius: 10, resizeMode: "cover", borderTopRightRadius: 30, borderTopLeftRadius: 30 },

//   dotsRow: {
//     marginTop: 8,
//     alignSelf: "center",
//     flexDirection: "row",
//     gap: 6,
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#bbb",
//     opacity: 0.6,
//   },
//   dotActive: {
//     backgroundColor: COLOR.primary,
//     opacity: 1,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginTop: -1,
//   },

//   captionPill: {
//     marginTop: 10,
//     backgroundColor: COLOR.pill,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 15,
//   },
//   captionText: { color: COLOR.text, fontSize: 12 },

//   actionsRow: {
//     marginTop: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   actionsLeft: { flexDirection: "row", alignItems: "center" },
//   actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 14 },
//   actionCount: { marginLeft: 6, fontSize: 12, color: COLOR.text },
//   actionsRight: { flexDirection: "row", alignItems: "center" },
//   visitBtn: {
//     backgroundColor: COLOR.primary,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//   },
//   visitBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },

//   /* Modal / Bottom sheet */
//   modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
//   sheet: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 8,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   sheetHandle: {
//     alignSelf: "center",
//     width: 68,
//     height: 6,
//     borderRadius: 999,
//     backgroundColor: "#D8DCE2",
//     marginBottom: 6,
//   },
//   sheetHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//     marginBottom: 10
//   },
//   sheetTitle: { fontSize: 20, fontWeight: "700", color: COLOR.text, textAlign: 'center', marginLeft: 160 },

//   /* Comments */
//   commentRow: { flexDirection: "row", paddingVertical: 10 },
//   commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
//   commentName: { fontWeight: "700", color: COLOR.text },
//   commentTime: { color: COLOR.sub, fontSize: 12 },
//   commentBody: { color: COLOR.text, marginTop: 2 },
//   commentMetaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//     justifyContent: "space-between",
//     paddingRight: 14,
//   },
//   replyText: { color: COLOR.sub },
//   commentLikeCount: { color: COLOR.text, fontSize: 12 },

//   repliesWrap: { marginLeft: 44, marginTop: 6 },
//   replyContainer: { flexDirection: "row", marginTop: 10 },
//   mentionText: { color: COLOR.primary, fontWeight: "600" },

//   replyingChip: {
//     alignSelf: "flex-start",
//     marginTop: 8,
//     backgroundColor: "#F3F4F6",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   replyingText: { color: COLOR.sub, fontSize: 12 },

//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLOR.pill,
//     borderRadius: 16,
//     paddingLeft: 14,
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   input: { flex: 1, height: 46, fontSize: 12, color: COLOR.text },
//   sendBtn: { width: 44, height: 46, alignItems: "center", justifyContent: "center" },

//   /* Options */
//   optionRow: {
//     height: 56,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     justifyContent: "space-between",
//     elevation: 1,
//   },
//   optionRowDanger: { borderColor: "#FDE2E0", backgroundColor: "#FFF8F8" },
//   optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   optionLabel: { fontSize: 15, color: COLOR.text },
//   iconRow: { flexDirection: 'row' },
//   iconButton: { marginLeft: 9 },
//   iconPill: { backgroundColor: '#fff', padding: 6, borderRadius: 25 },

//   // If your PNGs are already colored, remove tintColor.
//   iconImg: { width: 22, height: 22, resizeMode: 'contain' },
// });
// screens/FeedScreen.js
// screens/FeedScreen.js
// screens/FeedScreen.js
import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ThemedText from "../../components/ThemedText";
import { useNavigation } from "@react-navigation/native";
import {
  usePosts,
  useTogglePostLike,
  useAddPostComment,
} from "../../config/api.config";

/* -------------------- THEME -------------------- */
const COLOR = {
  primary: "#EF534E",
  bg: "#F5F6F8",
  card: "#FFFFFF",
  text: "#101318",
  sub: "#6C727A",
  line: "#E9EBEF",
  pill: "#F1F2F5",
  danger: "#E74C3C",
};

/* -------------------- HELPERS -------------------- */
const HOST = "https://colala.hmstech.xyz";
const absUrl = (u) => (u?.startsWith("http") ? u : `${HOST}${u || ""}`);

const timeAgo = (iso) => {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

/* -------------------- HEADER (UI unchanged) -------------------- */
const FeedHeader = ({ navigation }) => (
  <View style={styles.header}>
    <View style={styles.headerTopRow}>
      <ThemedText font="oleo" style={styles.headerTitle}>
        Social Feeds
      </ThemedText>
      <View style={styles.iconRow}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ServiceNavigator", { screen: "Cart" })
          }
          style={[styles.iconButton, styles.iconPill]}
          accessibilityRole="button"
          accessibilityLabel="Open cart"
        >
          <Image
            source={require("../../assets/cart-icon.png")}
            style={styles.iconImg}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ServiceNavigator", { screen: "Notifications" })
          }
          style={[styles.iconButton, styles.iconPill]}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Image
            source={require("../../assets/bell-icon.png")}
            style={styles.iconImg}
          />
        </TouchableOpacity>
      </View>
    </View>

    {/* Search */}
    <View style={styles.searchContainer}>
      <TextInput
        placeholder="Search any product, shop or category"
        placeholderTextColor="#888"
        style={styles.searchInput}
      />
      <Image
        source={require("../../assets/camera-icon.png")}
        style={styles.iconImg}
      />
    </View>
  </View>
);

/* -------------------- POST CARD (UI unchanged) -------------------- */
const PostCard = ({ item, onOpenComments, onOpenOptions, onToggleLike }) => {
  const [liked, setLiked] = useState(item._liked ?? false);
  const [likeCount, setLikeCount] = useState(item.likes);

  React.useEffect(() => {
    if (typeof item._liked === "boolean") setLiked(item._liked);
    if (typeof item.likes === "number") setLikeCount(item.likes);
  }, [item._liked, item.likes]);

  // carousel state
  const images = item.images?.length ? item.images : [item.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const [carouselW, setCarouselW] = useState(0);

  const onCarouselScroll = (e) => {
    if (!carouselW) return;
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / carouselW));
  };

  const handleLikePress = async () => {
    // optimistic
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    try {
      const res = await onToggleLike?.(item.id);
      if (res && typeof res.liked === "boolean") setLiked(res.liked);
      if (res && typeof res.likes_count === "number")
        setLikeCount(res.likes_count);
    } catch {
      // rollback if failed
      setLiked((p) => !p);
      setLikeCount((c) => (liked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Top bar */}
      <View style={styles.postTop}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.storeName}>{item.store}</ThemedText>
          <ThemedText style={styles.metaText}>
            {item.location} • {item.timeAgo}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => onOpenOptions(item)}>
          <Ionicons name="ellipsis-vertical" size={18} />
        </TouchableOpacity>
      </View>

      {/* Media (supports multiple images) */}
      <View
        style={styles.carouselWrap}
        onLayout={(e) => setCarouselW(e.nativeEvent.layout.width)}
      >
        {carouselW > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
          >
            {images.map((uri, idx) => (
              <Image
                key={`${item.id}-img-${idx}`}
                source={{ uri }}
                style={[styles.postImage, { width: carouselW }]}
              />
            ))}
          </ScrollView>
        )}

        {/* dots */}
        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[styles.dot, i === activeIdx && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Caption pill */}
      {item.caption ? (
        <View style={styles.captionPill}>
          <ThemedText style={styles.captionText}>{item.caption}</ThemedText>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLikePress}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={23}
              color={liked ? COLOR.primary : COLOR.text}
            />
            <ThemedText style={styles.actionCount}>{likeCount}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenComments(item)}
          >
            <Ionicons name="chatbubble-outline" size={23} color={COLOR.text} />
            <ThemedText style={styles.actionCount}>{item.comments}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={23} color={COLOR.text} />
            <ThemedText style={styles.actionCount}>{item.shares}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRight}>
          <TouchableOpacity style={styles.visitBtn}>
            <ThemedText style={styles.visitBtnText}>Visit Store</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 10 }}>
            <Image
              source={require("../../assets/DownloadSimple.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* -------------------- COMMENTS SHEET (UI unchanged) -------------------- */
const CommentsSheet = ({ visible, onClose, post, onSubmitComment }) => {
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { commentId, username }
  const currentUser = {
    name: "You",
    avatar: "https://via.placeholder.com/100",
  };

  const [comments, setComments] = useState([]);

  const startReply = (c) => {
    setReplyTo({ commentId: c.id, username: c.user });
    setText(`@${c.user} `);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearReply = () => {
    setReplyTo(null);
    setText("");
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !post?.id) return;
    try {
      const created = await onSubmitComment?.(post.id, trimmed);
      const newComment = {
        id: String(created?.id ?? `c-${Date.now()}`),
        user: created?.user?.full_name ?? currentUser.name,
        time: "Just now",
        avatar:
          created?.user?.profile_picture
            ? absUrl(
                created.user.profile_picture.startsWith("/storage")
                  ? created.user.profile_picture
                  : `/storage/${created.user.profile_picture}`
              )
            : currentUser.avatar,
        body: created?.body ?? trimmed,
        likes: 0,
        replies: [],
      };
      setComments((prev) => [...prev, newComment]);
      setText("");
      setReplyTo(null);
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText font="oleo" style={styles.sheetTitle}>
              Comments
            </ThemedText>
            <TouchableOpacity
              style={{
                borderColor: "#000",
                borderWidth: 1.4,
                borderRadius: 20,
                padding: 2,
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={16} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(i) => i.id}
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ paddingBottom: 4 }}>
                {/* main comment */}
                <View style={styles.commentRow}>
                  <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <ThemedText style={styles.commentName}>{item.user}</ThemedText>
                      <ThemedText style={styles.commentTime}>  {item.time}</ThemedText>
                    </View>
                    <ThemedText style={styles.commentBody}>{item.body}</ThemedText>

                    <View style={styles.commentMetaRow}>
                      <TouchableOpacity onPress={() => startReply(item)}>
                        <ThemedText style={styles.replyText}>Reply</ThemedText>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={14}
                          color={COLOR.text}
                        />
                        <ThemedText style={styles.commentLikeCount}>  {item.likes}</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>

                {/* replies kept for parity (not used) */}
                {item.replies?.length ? (
                  <View style={styles.repliesWrap}>
                    {item.replies.map((r) => (
                      <View key={r.id} style={styles.replyContainer}>
                        <Image source={{ uri: r.avatar }} style={styles.commentAvatar} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ThemedText style={styles.commentName}>{r.user}</ThemedText>
                            <ThemedText style={styles.commentTime}>  {r.time}</ThemedText>
                          </View>
                          <ThemedText style={styles.commentBody}>{r.body}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}
          />

          {/* Replying chip */}
          {replyTo ? (
            <View style={styles.replyingChip}>
              <ThemedText style={styles.replyingText}>
                Replying to {replyTo.username}
              </ThemedText>
              <TouchableOpacity onPress={clearReply} style={{ padding: 6 }}>
                <Ionicons name="close-circle" size={18} color={COLOR.sub} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder={replyTo ? `Reply to ${replyTo.username}` : "Type a message"}
              placeholderTextColor={COLOR.sub}
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={20} color={COLOR.text} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* -------------------- OPTIONS SHEET (UI unchanged) -------------------- */
const OptionsSheet = ({ visible, onClose }) => {
  const Row = ({ icon, label, danger, onPress }) => (
    <TouchableOpacity
      style={[styles.optionRow, danger && styles.optionRowDanger]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        {icon}
        <ThemedText style={[styles.optionLabel, danger && { color: COLOR.danger }]}>
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: "#F9F9F9" }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <ThemedText font="oleo" style={styles.sheetTitle}>
              Options
            </ThemedText>
            <TouchableOpacity
              style={{
                borderColor: "#000",
                borderWidth: 1.4,
                borderRadius: 20,
                padding: 2,
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={16} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <Row
            icon={<Image source={require("../../assets/Vector (16).png")} style={styles.profileImage} />}
            label="Share this post"
            onPress={onClose}
          />
          <Row
            icon={<Image source={require("../../assets/Vector (17).png")} style={styles.profileImage} />}
            label="Follow User"
            onPress={onClose}
          />
          <Row
            icon={<Image source={require("../../assets/Vector (18).png")} style={styles.profileImage} />}
            label="Hide Post"
            onPress={onClose}
          />
          <Row
            icon={<Image source={require("../../assets/Vector (19).png")} style={styles.profileImage} />}
            label="Report Post"
            danger
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

/* -------------------- SCREEN -------------------- */
export default function FeedScreen() {
  const navigation = useNavigation();
  const [activePost, setActivePost] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePosts(page);

  const postsPage = data?.data?.posts;
  const apiItems = Array.isArray(postsPage?.data) ? postsPage.data : [];

  // local per-post overrides (liked state, like count, comments count)
  const [postOverrides, setPostOverrides] = useState({}); // id -> { liked, likes, comments }

  // mutations (from api.config hooks)
  const likeMutation = useTogglePostLike();
  const addCommentMutation = useAddPostComment();

  const handleToggleLike = async (postId) => {
    const res = await likeMutation.mutateAsync(postId);
    setPostOverrides((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        liked: !!res?.data?.liked,
        likes: Number(res?.data?.likes_count ?? 0),
      },
    }));
    return { liked: res?.data?.liked, likes_count: res?.data?.likes_count };
  };

  const handleSubmitComment = async (postId, body) => {
    const res = await addCommentMutation.mutateAsync({ postId, body });
    setPostOverrides((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        comments: Number((prev[postId]?.comments ?? 0) + 1),
      },
    }));
    return res?.data; // created comment payload
  };

  // map API -> UI shape used by PostCard (no UI changes)
  const POSTS = useMemo(() => {
    return apiItems.map((p) => {
      const media = Array.isArray(p.media_urls) ? p.media_urls : [];
      const mediaSorted = [...media].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );
      const images = mediaSorted.map((m) => absUrl(m.url));
      const avatarRaw = p.user?.profile_picture;
      const avatar = avatarRaw
        ? absUrl(
            avatarRaw.startsWith("/storage")
              ? avatarRaw
              : `/storage/${avatarRaw}`
          )
        : "https://via.placeholder.com/100";

      const overrides = postOverrides[p.id] || {};
      const likes =
        typeof overrides.likes === "number" ? overrides.likes : Number(p.likes_count ?? 0);
      const commentsCount =
        typeof overrides.comments === "number"
          ? overrides.comments
          : Number(p.comments_count ?? 0);

      return {
        id: String(p.id),
        store: p.user?.full_name ?? "Unknown",
        avatar,
        location: "Lagos, Nigeria",
        timeAgo: timeAgo(p.created_at),
        images,
        image: images[0],
        caption: p.body ?? "",
        likes,
        comments: commentsCount,
        shares: Number(p.shares_count ?? 0),
        _liked: overrides.liked,
      };
    });
  }, [apiItems, postOverrides]);

  const nextPageUrl = postsPage?.next_page_url;

  const openComments = (post) => {
    setActivePost(post);
    setCommentsVisible(true);
  };
  const openOptions = (post) => {
    setActivePost(post);
    setOptionsVisible(true);
  };

  const loadMore = () => {
    if (isFetching) return;
    if (nextPageUrl) setPage((p) => p + 1);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {isLoading && !POSTS.length ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={POSTS}
          keyExtractor={(it) => it.id}
          ListHeaderComponent={() => <FeedHeader navigation={navigation} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <PostCard
              item={item}
              onOpenComments={openComments}
              onOpenOptions={openOptions}
              onToggleLike={handleToggleLike}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={
            isFetching && nextPageUrl ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}

      <CommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        post={activePost}
        onSubmitComment={handleSubmitComment}
      />
      <OptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
      />
    </View>
  );
}

/* -------------------- STYLES (unchanged) -------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  /* Header */
  header: {
    backgroundColor: "#E53E3E",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "600" },
  headerIcons: { flexDirection: "row" },
  icon: { backgroundColor: "#fff", padding: 6, borderRadius: 30, marginLeft: 8 },
  searchContainer: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  cameraIcon: { marginLeft: 8 },

  /* Post card */
  postCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  postTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 55, height: 55, borderRadius: 40, marginRight: 10 },
  storeName: { fontSize: 14, fontWeight: "400", color: COLOR.text },
  metaText: { fontSize: 10, color: "#000000B2", marginTop: 2 },

  carouselWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  postImage: {
    height: 390,
    borderRadius: 10,
    resizeMode: "cover",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },

  dotsRow: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#bbb",
    opacity: 0.6,
  },
  dotActive: {
    backgroundColor: COLOR.primary,
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -1,
  },

  captionPill: {
    marginTop: 10,
    backgroundColor: COLOR.pill,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  captionText: { color: COLOR.text, fontSize: 12 },

  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsLeft: { flexDirection: "row", alignItems: "center" },
  actionBtn: { flexDirection: "row", alignItems: "center", marginRight: 14 },
  actionCount: { marginLeft: 6, fontSize: 12, color: COLOR.text },
  actionsRight: { flexDirection: "row", alignItems: "center" },
  visitBtn: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  visitBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  /* Modal / Bottom sheet */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 68,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D8DCE2",
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR.text,
    textAlign: "center",
    marginLeft: 160,
  },

  /* Comments */
  commentRow: { flexDirection: "row", paddingVertical: 10 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentName: { fontWeight: "700", color: COLOR.text },
  commentTime: { color: COLOR.sub, fontSize: 12 },
  commentBody: { color: COLOR.text, marginTop: 2 },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
    paddingRight: 14,
  },
  replyText: { color: COLOR.sub },
  commentLikeCount: { color: COLOR.text, fontSize: 12 },

  repliesWrap: { marginLeft: 44, marginTop: 6 },
  replyContainer: { flexDirection: "row", marginTop: 10 },
  mentionText: { color: COLOR.primary, fontWeight: "600" },

  replyingChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyingText: { color: COLOR.sub, fontSize: 12 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.pill,
    borderRadius: 16,
    paddingLeft: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  input: { flex: 1, height: 46, fontSize: 12, color: COLOR.text },
  sendBtn: {
    width: 44,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Options */
  optionRow: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    elevation: 1,
  },
  optionRowDanger: { borderColor: "#FDE2E0", backgroundColor: "#FFF8F8" },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionLabel: { fontSize: 15, color: COLOR.text },
  iconRow: { flexDirection: "row" },
  iconButton: { marginLeft: 9 },
  iconPill: { backgroundColor: "#fff", padding: 6, borderRadius: 25 },

  // If your PNGs are already colored, remove tintColor.
  iconImg: { width: 22, height: 22, resizeMode: "contain" },
});
