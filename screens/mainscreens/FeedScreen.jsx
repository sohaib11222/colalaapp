// screens/FeedScreen.js
import React, { useRef, useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

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

/* -------------------- MOCK DATA -------------------- */
const POSTS = [
  {
    id: "1",
    store: "Sasha Stores",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    location: "Lagos, Nigeria",
    timeAgo: "20 min ago",
    // multiple images here
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    ],
    caption: "Get this phone at a cheap price for a limited period",
    likes: 500,
    comments: 26,
    shares: 26,
  },
  {
    id: "2",
    store: "Vee Stores",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
    location: "Lagos, Nigeria",
    timeAgo: "20 min ago",
    // single image still works (fallback)
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    caption: "Weekend discount on accessories only!",
    likes: 128,
    comments: 12,
    shares: 8,
  },
];

/* -------------------- HEADER -------------------- */
const FeedHeader = () => (
  <View style={styles.header}>
    <View style={styles.headerTopRow}>
      <Text style={styles.headerTitle}>Social Feeds</Text>
      <View style={styles.headerIcons}>
        <Ionicons name="cart-outline" size={22} color="#E53E3E" style={styles.icon} />
        <Ionicons name="notifications-outline" size={22} color="#E53E3E" style={styles.icon} />
      </View>
    </View>

    {/* Search */}
    <View style={styles.searchContainer}>
      <TextInput
        placeholder="Search any product, shop or category"
        placeholderTextColor="#888"
        style={styles.searchInput}
      />
      <Ionicons name="camera-outline" size={22} color="#444" style={styles.cameraIcon} />
    </View>
  </View>
);

/* -------------------- POST CARD -------------------- */
const PostCard = ({ item, onOpenComments, onOpenOptions }) => {
  const [liked, setLiked] = useState(false);
  const likeCount = liked ? item.likes + 1 : item.likes;

  // carousel state
  const images = item.images?.length ? item.images : [item.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const [carouselW, setCarouselW] = useState(0);

  const onCarouselScroll = (e) => {
    if (!carouselW) return;
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / carouselW));
  };

  return (
    <View style={styles.postCard}>
      {/* Top bar */}
      <View style={styles.postTop}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{item.store}</Text>
          <Text style={styles.metaText}>
            {item.location} · {item.timeAgo}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onOpenOptions(item)}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLOR.sub} />
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
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setLiked((p) => !p)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={25}
              color={liked ? COLOR.primary : COLOR.text}
            />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onOpenComments(item)}
          >
            <Ionicons name="chatbubble-outline" size={25} color={COLOR.text} />
            <Text style={styles.actionCount}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={25} color={COLOR.text} />
            <Text style={styles.actionCount}>{item.shares}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRight}>
          <TouchableOpacity style={styles.visitBtn}>
            <Text style={styles.visitBtnText}>Visit Store</Text>
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

/* -------------------- COMMENTS SHEET (with inline replies) -------------------- */
const CommentsSheet = ({ visible, onClose, post }) => {
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { commentId, username }
  const currentUser = {
    name: "Sasha Stores",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  };

  // stateful comments (supports nested replies)
  const [comments, setComments] = useState([
    {
      id: "c1",
      user: "Adam Chris",
      time: "1 min",
      avatar:
        "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
      body: "This product looks really nice, do you deliver nationwide ?",
      likes: 30,
      replies: [
        {
          id: "r1",
          user: "Sasha Stores",
          time: "1 min",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
          body: "We do deliver nationwide.",
          mentionOf: "Adam Chris",
        },
      ],
    },
    {
      id: "c2",
      user: "Adam Chris",
      time: "1 min",
      avatar:
        "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
      body: "This product looks really nice, do you deliver nationwide ?",
      likes: 30,
      replies: [],
    },
    {
      id: "c3",
      user: "Adam Chris",
      time: "1 min",
      avatar:
        "https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=200&auto=format&fit=crop",
      body: "This product looks really nice, do you deliver nationwide ?",
      likes: 30,
      replies: [],
    },
  ]);

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

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (replyTo) {
      const newReply = {
        id: `r-${Date.now()}`,
        user: currentUser.name,
        time: "1 min",
        avatar: currentUser.avatar,
        body: trimmed.replace(new RegExp(`^@${replyTo.username}\\s*`), ""),
        mentionOf: replyTo.username,
      };
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );
      setReplyTo(null);
      setText("");
    } else {
      const newComment = {
        id: `c-${Date.now()}`,
        user: currentUser.name,
        time: "1 min",
        avatar: currentUser.avatar,
        body: trimmed,
        likes: 0,
        replies: [],
      };
      setComments((prev) => [...prev, newComment]);
      setText("");
    }
  };

  const ReplyBlock = ({ reply }) => (
    <View style={styles.replyContainer}>
      <Image source={{ uri: reply.avatar }} style={styles.commentAvatar} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.commentName}>{reply.user}</Text>
          <Text style={styles.commentTime}>  {reply.time}</Text>
        </View>
        <Text style={styles.commentBody}>
          {reply.mentionOf ? (
            <>
              <Text style={styles.mentionText}>@{reply.mentionOf} </Text>
              {reply.body}
            </>
          ) : (
            reply.body
          )}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Comments</Text>
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
              <Ionicons name="close" size={18} color={COLOR.text} />
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
                      <Text style={styles.commentName}>{item.user}</Text>
                      <Text style={styles.commentTime}>  {item.time}</Text>
                    </View>
                    <Text style={styles.commentBody}>{item.body}</Text>

                    <View style={styles.commentMetaRow}>
                      <TouchableOpacity onPress={() => startReply(item)}>
                        <Text style={styles.replyText}>Reply</Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={14}
                          color={COLOR.text}
                        />
                        <Text style={styles.commentLikeCount}>  {item.likes}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* replies */}
                {item.replies?.length ? (
                  <View style={styles.repliesWrap}>
                    {item.replies.map((r) => (
                      <ReplyBlock key={r.id} reply={r} />
                    ))}
                  </View>
                ) : null}
              </View>
            )}
          />

          {/* Replying chip */}
          {replyTo ? (
            <View style={styles.replyingChip}>
              <Text style={styles.replyingText}>Replying to {replyTo.username}</Text>
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

/* -------------------- OPTIONS SHEET -------------------- */
const OptionsSheet = ({ visible, onClose }) => {
  const Row = ({ icon, label, danger, onPress }) => (
    <TouchableOpacity
      style={[styles.optionRow, danger && styles.optionRowDanger]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        {icon}
        <Text style={[styles.optionLabel, danger && { color: COLOR.danger }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={danger ? COLOR.danger : COLOR.sub} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: "#F9F9F9" }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Options</Text>
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
              <Ionicons name="close" size={18} color={COLOR.text} />
            </TouchableOpacity>
          </View>

          <Row
            icon={<Ionicons name="share-outline" size={20} color={COLOR.text} />}
            label="Share this post"
            onPress={onClose}
          />
          <Row
            icon={<Ionicons name="person-add-outline" size={20} color={COLOR.text} />}
            label="Follow User"
            onPress={onClose}
          />
          <Row
            icon={<Ionicons name="eye-off-outline" size={20} color={COLOR.text} />}
            label="Hide Post"
            onPress={onClose}
          />
          <Row
            icon={<Ionicons name="warning-outline" size={20} color={COLOR.danger} />}
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
  const [activePost, setActivePost] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const openComments = (post) => {
    setActivePost(post);
    setCommentsVisible(true);
  };
  const openOptions = (post) => {
    setActivePost(post);
    setOptionsVisible(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        data={POSTS}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={<FeedHeader />}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <PostCard item={item} onOpenComments={openComments} onOpenOptions={openOptions} />
        )}
        showsVerticalScrollIndicator={false}
      />

      <CommentsSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        post={activePost}
      />
      <OptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
      />
    </View>
  );
}

/* -------------------- STYLES -------------------- */
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
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "600" },
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
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  storeName: { fontSize: 14, fontWeight: "700", color: COLOR.text },
  metaText: { fontSize: 12, color: COLOR.sub, marginTop: 2 },

  carouselWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLOR.line,
  },
  postImage: { height: 300, borderRadius: 10, resizeMode: "cover", borderTopRightRadius:30, borderTopLeftRadius:30 },

  dotsRow: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "transparent",
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
  captionText: { color: COLOR.text, fontSize: 13 },

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
  visitBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  /* Modal / Bottom sheet */
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
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
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: COLOR.text },

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
  input: { flex: 1, height: 46, fontSize: 14, color: COLOR.text },
  sendBtn: { width: 44, height: 46, alignItems: "center", justifyContent: "center" },

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
});
