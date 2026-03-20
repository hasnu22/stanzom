import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getEvents, getBuzzPosts, addBuzzPost, getReactionsSummary } from '../../services/eventService';
import { useWebSocket } from '../../hooks/useWebSocket';
import BebasText from '../../components/ui/BebasText';
import LiveScoreCard from '../../components/event/LiveScoreCard';
import EmojiReactionBar from '../../components/event/EmojiReactionBar';
import BuzzPost from '../../components/event/BuzzPost';

type LiveTab = 'score' | 'buzz';
type BuzzFilter = 'ALL' | 'SIX' | 'WICKET' | 'HOT_TAKE';

const BUZZ_FILTERS: { key: BuzzFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'SIX', label: '\uD83C\uDFCF SIX' },
  { key: 'WICKET', label: '\uD83C\uDFAF WICKET' },
  { key: 'HOT_TAKE', label: '\uD83D\uDD25 HOT TAKE' },
];

const POST_TYPES = ['GENERAL', 'SIX', 'WICKET', 'GOAL', 'HOT_TAKE'];

export default function LiveScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<LiveTab>('score');
  const [buzzFilter, setBuzzFilter] = useState<BuzzFilter>('ALL');
  const [showComposer, setShowComposer] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('GENERAL');
  const [sentimentVote, setSentimentVote] = useState<string | null>(null);

  // Fetch live events
  const liveQuery = useQuery({
    queryKey: ['events', 'LIVE'],
    queryFn: async () => {
      const data = await getEvents({ status: 'LIVE' });
      return data as any[];
    },
  });

  // Fetch upcoming for countdown fallback
  const upcomingQuery = useQuery({
    queryKey: ['events', 'UPCOMING', 'live-fallback'],
    queryFn: async () => {
      const data = await getEvents({ status: 'UPCOMING' });
      return data as any[];
    },
    enabled: (liveQuery.data ?? []).length === 0 && !liveQuery.isLoading,
  });

  const liveEvents = liveQuery.data ?? [];
  const currentEvent = liveEvents[0] ?? null;
  const nextUpcoming = (upcomingQuery.data ?? [])[0] ?? null;

  // WebSocket for live updates
  const { isConnected, scoreData, buzzPosts: wsBuzzPosts, reactions: wsReactions } =
    useWebSocket(currentEvent?.id ?? '');

  // Reactions summary
  const reactionsQuery = useQuery({
    queryKey: ['reactions', currentEvent?.id],
    queryFn: async () => {
      const data = await getReactionsSummary(currentEvent!.id);
      return data as any[];
    },
    enabled: !!currentEvent?.id,
  });

  const currentReactions = useMemo(() => {
    if (wsReactions) return wsReactions as any[];
    return reactionsQuery.data ?? [];
  }, [wsReactions, reactionsQuery.data]);

  // Buzz posts with infinite scroll
  const filterParam = buzzFilter === 'ALL' ? undefined : buzzFilter;
  const buzzQuery = useInfiniteQuery({
    queryKey: ['buzz', currentEvent?.id, filterParam],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await getBuzzPosts(currentEvent!.id, filterParam, pageParam);
      return data;
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (!lastPage || (Array.isArray(lastPage) && lastPage.length === 0)) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!currentEvent?.id && activeTab === 'buzz',
  });

  const allBuzzPosts = useMemo(() => {
    const fetched = (buzzQuery.data?.pages ?? []).flat();
    // Merge WS posts at the top, avoiding duplicates
    const fetchedIds = new Set(fetched.map((p: any) => p.id));
    const newWs = wsBuzzPosts.filter((p) => !fetchedIds.has(p.id));
    return [...newWs, ...fetched];
  }, [buzzQuery.data, wsBuzzPosts]);

  // Create buzz post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      await addBuzzPost(currentEvent!.id, {
        content: newPostContent,
        postType: newPostType,
      });
    },
    onSuccess: () => {
      setNewPostContent('');
      setNewPostType('GENERAL');
      setShowComposer(false);
      queryClient.invalidateQueries({ queryKey: ['buzz', currentEvent?.id] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      liveQuery.refetch(),
      upcomingQuery.refetch(),
      reactionsQuery.refetch(),
      buzzQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [liveQuery, upcomingQuery, reactionsQuery, buzzQuery]);

  // Loading state
  if (liveQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Checking for live events...</Text>
      </View>
    );
  }

  // Error state
  if (liveQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load
        </BebasText>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No live events - show countdown
  if (!currentEvent) {
    const getCountdownText = () => {
      if (!nextUpcoming) return null;
      const diff = new Date(nextUpcoming.eventDate).getTime() - Date.now();
      if (diff <= 0) return 'Starting soon!';
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h ${mins}m`;
      }
      return `${hours}h ${mins}m`;
    };

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centeredContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        <Text style={styles.noLiveEmoji}>{'\uD83D\uDCFA'}</Text>
        <BebasText size={26} color={Colors.text}>
          No live events right now
        </BebasText>
        {nextUpcoming && (
          <View style={styles.countdownSection}>
            <Text style={styles.countdownLabel}>Next match in</Text>
            <BebasText size={36} color={Colors.gold}>
              {getCountdownText()}
            </BebasText>
            <Text style={styles.countdownTitle} numberOfLines={2}>
              {nextUpcoming.title}
            </Text>
          </View>
        )}
        {!nextUpcoming && (
          <Text style={styles.noUpcomingText}>
            No upcoming events scheduled. Check back later!
          </Text>
        )}
      </ScrollView>
    );
  }

  // Merge WS score data into current event
  const displayEvent = scoreData
    ? { ...currentEvent, ...scoreData }
    : currentEvent;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BebasText size={24} color={Colors.text}>
          Live
        </BebasText>
        {isConnected && (
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'score' && styles.tabButtonActive]}
          onPress={() => setActiveTab('score')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'score' && styles.tabButtonTextActive]}>
            Score
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'buzz' && styles.tabButtonActive]}
          onPress={() => setActiveTab('buzz')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabButtonText, activeTab === 'buzz' && styles.tabButtonTextActive]}>
            Buzz
          </Text>
        </TouchableOpacity>
      </View>

      {/* SCORE TAB */}
      {activeTab === 'score' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
          }
          contentContainerStyle={styles.scoreContent}
        >
          <LiveScoreCard event={displayEvent} />

          <View style={styles.reactionSection}>
            <EmojiReactionBar eventId={currentEvent.id} reactions={currentReactions} />
          </View>

          {displayEvent.currentPeriod && (
            <View style={styles.periodCard}>
              <Text style={styles.periodLabel}>Current Period</Text>
              <BebasText size={20} color={Colors.text}>
                {displayEvent.currentPeriod}
              </BebasText>
            </View>
          )}

          <View style={styles.sentimentCard}>
            <BebasText size={18} color={Colors.text}>
              Who do you think will win?
            </BebasText>
            <View style={styles.sentimentButtons}>
              <TouchableOpacity
                style={[
                  styles.sentimentButton,
                  sentimentVote === 'home' && styles.sentimentButtonActive,
                ]}
                onPress={() => setSentimentVote('home')}
                activeOpacity={0.7}
              >
                <BebasText size={16} color={sentimentVote === 'home' ? Colors.bg : Colors.text}>
                  {displayEvent.teamHomeId}
                </BebasText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sentimentButton,
                  sentimentVote === 'away' && styles.sentimentButtonActive,
                ]}
                onPress={() => setSentimentVote('away')}
                activeOpacity={0.7}
              >
                <BebasText size={16} color={sentimentVote === 'away' ? Colors.bg : Colors.text}>
                  {displayEvent.teamAwayId}
                </BebasText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* BUZZ TAB */}
      {activeTab === 'buzz' && (
        <View style={styles.buzzContainer}>
          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.buzzFilters}
          >
            {BUZZ_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.buzzPill, buzzFilter === f.key && styles.buzzPillActive]}
                onPress={() => setBuzzFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buzzPillText, buzzFilter === f.key && styles.buzzPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {buzzQuery.isLoading ? (
            <View style={styles.centeredInner}>
              <ActivityIndicator color={Colors.gold} />
            </View>
          ) : allBuzzPosts.length === 0 ? (
            <View style={styles.centeredInner}>
              <Text style={styles.emptyBuzzEmoji}>{'\uD83D\uDCAC'}</Text>
              <Text style={styles.emptyBuzzText}>No buzz posts yet. Be the first!</Text>
            </View>
          ) : (
            <FlatList
              data={allBuzzPosts}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => <BuzzPost post={item} />}
              contentContainerStyle={styles.buzzList}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (buzzQuery.hasNextPage && !buzzQuery.isFetchingNextPage) {
                  buzzQuery.fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                buzzQuery.isFetchingNextPage ? (
                  <ActivityIndicator color={Colors.gold} style={{ marginVertical: 16 }} />
                ) : null
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
              }
            />
          )}

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowComposer(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Compose Modal */}
      <Modal visible={showComposer} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowComposer(false)}
          />
          <View style={styles.composerSheet}>
            <View style={styles.composerHandle} />
            <BebasText size={20} color={Colors.text}>
              New Buzz Post
            </BebasText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postTypePills}
            >
              {POST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.postTypePill, newPostType === type && styles.postTypePillActive]}
                  onPress={() => setNewPostType(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.postTypePillText,
                      newPostType === type && styles.postTypePillTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.composerInput}
              placeholder="What's happening?"
              placeholderTextColor={Colors.muted}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={280}
              autoFocus
            />

            <View style={styles.composerActions}>
              <Text style={styles.charCount}>{newPostContent.length}/280</Text>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!newPostContent.trim() || createPostMutation.isPending) && styles.postButtonDisabled,
                ]}
                onPress={() => createPostMutation.mutate()}
                disabled={!newPostContent.trim() || createPostMutation.isPending}
                activeOpacity={0.7}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.bg} />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centeredContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centeredInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorSubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  noLiveEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  countdownSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  countdownLabel: {
    color: Colors.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  countdownTitle: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  noUpcomingText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,230,118,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  connectedText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: '600',
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: Colors.gold,
  },
  tabButtonText: {
    color: Colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Colors.bg,
  },
  scoreContent: {
    padding: 16,
  },
  reactionSection: {
    marginTop: 14,
  },
  periodCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  periodLabel: {
    color: Colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  sentimentCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sentimentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  sentimentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  sentimentButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  buzzContainer: {
    flex: 1,
  },
  buzzFilters: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  buzzPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  buzzPillActive: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: Colors.gold,
  },
  buzzPillText: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  buzzPillTextActive: {
    color: Colors.gold,
  },
  buzzList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyBuzzEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyBuzzText: {
    color: Colors.muted,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: Colors.bg,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  composerSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  composerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.muted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  postTypePills: {
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },
  postTypePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  postTypePillActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.15)',
  },
  postTypePillText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  postTypePillTextActive: {
    color: Colors.gold,
  },
  composerInput: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  charCount: {
    color: Colors.muted,
    fontSize: 13,
  },
  postButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
});
