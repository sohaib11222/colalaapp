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
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ThemedText from "../../components/ThemedText";
import { useNavigation } from "@react-navigation/native";
import {
  usePosts,
  useTogglePostLike,
  useAddPostComment,
  useGetPostComments
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
      <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AuthNavigator', { screen: 'Search' })}
              style={styles.searchContainer}>
              <TextInput
                placeholder="Search any product, shop or category"
                placeholderTextColor="#888"
                style={styles.searchInput}
                editable={false}                // stop editing
                showSoftInputOnFocus={false}    // stop keyboard
                pointerEvents="none"            // let TouchableOpacity catch taps
              />
              <Image source={require('../../assets/camera-icon.png')} style={styles.iconImg} />
            </TouchableOpacity>
  </View>
);

/* -------------------- POST CARD (UI unchanged) -------------------- */
const PostCard = ({ item, onOpenComments, onOpenOptions, onToggleLike, isLastItem, navigation }) => {
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
  const nextLiked = !liked;

  // Optimistic update
  setLiked(nextLiked);
  setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

  try {
    const res = await onToggleLike?.(item.id);
    if (res && typeof res.liked === "boolean") {
      setLiked(res.liked);
    }
    if (res && typeof res.likes_count === "number") {
      setLikeCount(res.likes_count);
    }
  } catch {
    // Rollback if failed
    setLiked(!nextLiked);
    setLikeCount((c) => (!nextLiked ? c + 1 : Math.max(0, c - 1)));
  }
};


  return (
    <View style={[styles.postCard, isLastItem && styles.postCardLast]}>
      {/* Top bar */}
      <View style={styles.postTop}>
        <Image
          source={{ uri: item.avatar }}
          style={styles.avatar}
          defaultSource={require("../../assets/Ellipse 18.png")}
        />
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
          <TouchableOpacity
            style={styles.visitBtn}
            onPress={() => {
              if (item.storeId && navigation) {
                navigation.navigate("ServiceNavigator", {
                  screen: "StoreDetails",
                  params: { storeId: item.storeId }
                });
              }
            }}
          >
            <ThemedText style={styles.visitBtnText}>Visit Store</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={async () => {
              try {
                const uri = images?.[activeIdx] || images?.[0];
                if (!uri) return;
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo library access to save images.'); return; }
                const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
                const download = await FileSystem.downloadAsync(uri, fileUri);
                if (download.status === 200) {
                  await MediaLibrary.saveToLibraryAsync(download.uri);
                  Alert.alert('Saved', 'Image saved to your gallery.');
                }
              } catch (e) { Alert.alert('Error', 'Failed to save image.'); }
            }}
          >
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

  // Fetch comments from API
  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useGetPostComments(post?.id, {
    enabled: visible && !!post?.id,
  });

  // Process API comments data
  const apiComments = useMemo(() => {
    if (!commentsData?.data?.data) return [];

    return commentsData.data.data.map((comment) => ({
      id: String(comment.id),
      user: comment.user?.full_name || "Unknown",
      time: timeAgo(comment.created_at),
      avatar: comment.user?.profile_picture
        ? absUrl(
          comment.user.profile_picture.startsWith("/storage")
            ? comment.user.profile_picture
            : `/storage/${comment.user.profile_picture}`
        )
        : currentUser.avatar,
      body: comment.body || "",
      likes: 0,
      replies: comment.replies || [],
    }));
  }, [commentsData]);

  const [localComments, setLocalComments] = useState([]);

  // Combine API comments with local comments
  const comments = [...apiComments, ...localComments];

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
        avatar: created?.user?.profile_picture
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
      setLocalComments((prev) => [...prev, newComment]);
      setText("");
      setReplyTo(null);
    } catch { }
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
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
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

          {commentsLoading ? (
            <View style={styles.commentsLoadingContainer}>
              <ActivityIndicator size="large" color={COLOR.primary} />
              <ThemedText style={styles.commentsLoadingText}>Loading comments...</ThemedText>
            </View>
          ) : commentsError ? (
            <View style={styles.commentsErrorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLOR.primary} />
              <ThemedText style={styles.commentsErrorText}>
                Failed to load comments. Please try again.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(i) => i.id}
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ paddingBottom: 4 }}>
                  {/* main comment */}
                  <View style={styles.commentRow}>
                    <Image
                      source={{ uri: item.avatar }}
                      style={styles.commentAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <ThemedText style={styles.commentName}>
                          {item.user}
                        </ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {" "}
                          {item.time}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.commentBody}>
                        {item.body}
                      </ThemedText>

                      <View style={styles.commentMetaRow}>
                        <TouchableOpacity onPress={() => startReply(item)}>
                          <ThemedText style={styles.replyText}>Reply</ThemedText>
                        </TouchableOpacity>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={14}
                            color={COLOR.text}
                          />
                          <ThemedText style={styles.commentLikeCount}>
                            {" "}
                            {item.likes}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* replies kept for parity (not used) */}
                  {item.replies?.length ? (
                    <View style={styles.repliesWrap}>
                      {item.replies.map((r) => (
                        <View key={r.id} style={styles.replyContainer}>
                          <Image
                            source={{ uri: r.avatar }}
                            style={styles.commentAvatar}
                          />
                          <View style={{ flex: 1 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <ThemedText style={styles.commentName}>
                                {r.user}
                              </ThemedText>
                              <ThemedText style={styles.commentTime}>
                                {" "}
                                {r.time}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.commentBody}>
                              {r.body}
                            </ThemedText>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              )}
            />
          )}

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
              placeholder={
                replyTo ? `Reply to ${replyTo.username}` : "Type a message"
              }
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
const OptionsSheet = ({ visible, onClose, onHidePost }) => {
  const Row = ({ icon, label, danger, onPress }) => (
    <TouchableOpacity
      style={[styles.optionRow, danger && styles.optionRowDanger]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        {icon}
        <ThemedText
          style={[styles.optionLabel, danger && { color: COLOR.danger }]}
        >
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
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
            icon={
              <Image
                source={require("../../assets/Vector (16).png")}
                style={styles.profileImage}
              />
            }
            label="Share this post"
            onPress={onClose}
          />
          <Row
            icon={
              <Image
                source={require("../../assets/Vector (17).png")}
                style={styles.profileImage}
              />
            }
            label="Follow User"
            onPress={onClose}
          />
          <Row
            icon={
              <Image
                source={require("../../assets/Vector (18).png")}
                style={styles.profileImage}
              />
            }
            label="Hide Post"
            onPress={onHidePost}
          />
          <Row
            icon={
              <Image
                source={require("../../assets/Vector (19).png")}
                style={styles.profileImage}
              />
            }
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
  const { data, isLoading, isFetching, refetch } = usePosts(page);

  const postsPage = data?.data?.posts;
  const apiItems = Array.isArray(postsPage?.data) ? postsPage.data : [];

  // local per-post overrides (liked state, like count, comments count)
  const [postOverrides, setPostOverrides] = useState({}); // id -> { liked, likes, comments }

  // hidden posts state
  const [hiddenPosts, setHiddenPosts] = useState(new Set());

  // mutations (from api.config hooks)
  const likeMutation = useTogglePostLike();
  const addCommentMutation = useAddPostComment();

  // Refresh functionality
  const handleRefresh = async () => {
    try {
      console.log("Refreshing feed...");
      setPage(1); // Reset to first page
      await refetch();
      console.log("Feed refreshed successfully");
    } catch (error) {
      console.error("Error refreshing feed:", error);
    }
  };

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
    console.log('Filtering posts, hidden posts:', Array.from(hiddenPosts));
    const filtered = apiItems.filter((p) => !hiddenPosts.has(String(p.id)));
    console.log('Original posts count:', apiItems.length, 'Filtered posts count:', filtered.length);
    return filtered.map((p) => {
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
        typeof overrides.likes === "number"
          ? overrides.likes
          : Number(p.likes_count ?? 0);
      const commentsCount =
        typeof overrides.comments === "number"
          ? overrides.comments
          : Number(p.comments_count ?? 0);

      return {
        id: String(p.id),
        store: p.user?.full_name ?? "Unknown",
        storeId: p.user?.store?.id ?? p.user_id,
        avatar,
        location: "Lagos, Nigeria",
        timeAgo: timeAgo(p.created_at),
        images,
        image: images[0],
        caption: p.body ?? "",
        likes,
        comments: commentsCount,
        shares: Number(p.shares_count ?? 0),
        _liked: typeof overrides.liked === "boolean" ? overrides.liked : !!p.is_liked,  // ✅ use API is_liked
      };
    });
  }, [apiItems, postOverrides, hiddenPosts]);

  const nextPageUrl = postsPage?.next_page_url;

  const openComments = (post) => {
    setActivePost(post);
    setCommentsVisible(true);
  };
  const openOptions = (post) => {
    setActivePost(post);
    setOptionsVisible(true);
  };

  const handleHidePost = (postId) => {
    console.log('Hiding post with ID:', postId);
    setHiddenPosts(prev => {
      const newSet = new Set([...prev, postId]);
      console.log('Updated hidden posts:', Array.from(newSet));
      return newSet;
    });
    setOptionsVisible(false);
  };

  const loadMore = () => {
    if (isFetching) return;
    if (nextPageUrl) setPage((p) => p + 1);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {isLoading && !POSTS.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLOR.primary} />
          <ThemedText style={styles.loadingText}>Loading posts...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={POSTS}
          keyExtractor={(it) => it.id}
          ListHeaderComponent={() => <FeedHeader navigation={navigation} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={COLOR.primary}
              colors={[COLOR.primary]}
            />
          }
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              onOpenComments={openComments}
              onOpenOptions={openOptions}
              onToggleLike={handleToggleLike}
              isLastItem={index === POSTS.length - 1}
              navigation={navigation}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={loadMore}
          ListFooterComponent={() => 
            isFetching && POSTS.length > 0 ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={COLOR.primary} />
                <ThemedText style={styles.footerLoadingText}>Loading more posts...</ThemedText>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color={COLOR.sub} />
              <ThemedText style={styles.emptyTitle}>No Posts Available</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                There are no posts to show at the moment. Check back later for updates!
              </ThemedText>
            </View>
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
        onHidePost={() => handleHidePost(activePost?.id)}
      />
    </View>
  );
}

/* -------------------- STYLES (unchanged) -------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  /* Loading */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  footerLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  footerLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLOR.sub,
  },

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
  icon: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 30,
    marginLeft: 8,
  },
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
    marginBottom: 0,
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
  postCardLast: {
    marginBottom: 30,
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

  // Comments loading and error states
  commentsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  commentsLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
  },
  commentsErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  commentsErrorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR.primary,
    textAlign: "center",
    lineHeight: 24,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    minHeight: 300,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    color: COLOR.text,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 12,
    fontSize: 16,
    color: COLOR.sub,
    textAlign: "center",
    lineHeight: 22,
  },
});
