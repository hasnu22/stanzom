import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import {
  getEventById,
  getBuzzPosts,
  addBuzzPost,
  getReactionsSummary,
  getEventRating,
  getMoments,
  BuzzPostData,
} from '../../services/eventService';
import { getQuestions } from '../../services/predictionService';
import { useWebSocket } from '../../hooks/useWebSocket';
import BebasText from '../../components/ui/BebasText';
import Badge from '../../components/ui/Badge';
import QuestionCard from '../../components/prediction/QuestionCard';
import BuzzPost from '../../components/event/BuzzPost';
import MomentCard from '../../components/event/MomentCard';
import EmojiReactionBar from '../../components/event/EmojiReactionBar';

type Tab = 'predictions' | 'buzz' | 'stats';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('predictions');
  const [refreshing, setRefreshing] = useState(false);
  const [buzzText, setBuzzText] = useState('');
  const [showComposeFAB, setShowComposeFAB] = useState(true);
  const [composerVisible, setComposerVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // WebSocket for live updates
  const { isConnected, scoreData, buzzPosts: wsBuzzPosts, reactions: wsReactions } =
    useWebSocket(id ?? '');

  const eventQuery = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await getEventById(id!);
      return data as any;
    },
    enabled: !!id,
  });

  const predictionsQuery = useQuery({
    queryKey: ['predictions', id],
    queryFn: async () => {
      const { data } = await getQuestions(id!);
      return data as any[];
    },
    enabled: !!id,
  });

  const buzzQuery = useInfiniteQuery({
    queryKey: ['buzz', id],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await getBuzzPosts(id!, undefined, pageParam);
      return data as any;
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (!lastPage || (Array.isArray(lastPage) && lastPage.length < 20)) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!id && activeTab === 'buzz',
  });

  const reactionsQuery = useQuery({
    queryKey: ['reactions', id],
    queryFn: async () => {
      const { data } = await getReactionsSummary(id!);
      return data as any[];
    },
    enabled: !!id,
  });

  const ratingQuery = useQuery({
    queryKey: ['eventRating', id],
    queryFn: async () => {
      const { data } = await getEventRating(id!);
      return data as any;
    },
    enabled: !!id && activeTab === 'stats',
  });

  const momentsQuery = useQuery({
    queryKey: ['moments', id],
    queryFn: async () => {
      const { data } = await getMoments(id!);
      return data as any[];
    },
    enabled: !!id && activeTab === 'stats',
  });

  const buzzMutation = useMutation({
    mutationFn: async (buzzData: BuzzPostData) => {
      const { data } = await addBuzzPost(id!, buzzData);
      return data;
    },
    onSuccess: () => {
      setBuzzText('');
      setComposerVisible(false);
      queryClient.invalidateQueries({ queryKey: ['buzz', id] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      eventQuery.refetch(),
      predictionsQuery.refetch(),
      reactionsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [eventQuery, predictionsQuery, reactionsQuery]);

  const handleAnswer = (_questionId: string, _optionId: string) => {
    // Handle prediction answer inline
  };

  const handleLock = (_questionId: string) => {
    // Handle prediction lock
  };

  const handleSendBuzz = () => {
    if (buzzText.trim().length === 0) return;
    buzzMutation.mutate({ content: buzzText.trim(), postType: 'HOT_TAKE' });
  };

  if (eventQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (eventQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load event
        </BebasText>
        <Text style={styles.errorSubtext}>Please try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const event = eventQuery.data;
  const liveScore = scoreData ?? event;
  const isLive = event?.status === 'LIVE';
  const reactions = wsReactions
    ? Object.entries(wsReactions).map(([emoji, count]) => ({ emoji, count: count as number }))
    : (reactionsQuery.data ?? []);

  const allBuzzPosts = [
    ...wsBuzzPosts,
    ...(buzzQuery.data?.pages?.flat() ?? []),
  ];

  const TABS: { key: Tab; label: string }[] = [
    { key: 'predictions', label: 'Predictions' },
    { key: 'buzz', label: 'Buzz' },
    { key: 'stats', label: 'Stats' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BebasText size={18} color={Colors.text}>
            {event?.title ?? 'Event'}
          </BebasText>
          {isConnected && isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        {isLive && (
          <View style={styles.liveRow}>
            <Badge label="LIVE" color={Colors.red} size="sm" />
            {liveScore?.currentPeriod && (
              <Text style={styles.period}>{liveScore.currentPeriod}</Text>
            )}
          </View>
        )}
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <BebasText size={20} color={Colors.text}>
              {event?.teamHomeId}
            </BebasText>
          </View>
          <View style={styles.scoreBlock}>
            <BebasText size={42} color={Colors.text}>
              {liveScore?.scoreHome ?? 0} - {liveScore?.scoreAway ?? 0}
            </BebasText>
          </View>
          <View style={styles.teamBlock}>
            <BebasText size={20} color={Colors.text}>
              {event?.teamAwayId}
            </BebasText>
          </View>
        </View>
        {event?.venue && <Text style={styles.venue}>{event.venue}</Text>}
        {event?.eventDate && (
          <Text style={styles.dateText}>
            {new Date(event.eventDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        contentContainerStyle={styles.tabScrollContent}
      >
        {activeTab === 'predictions' && (
          <>
            {predictionsQuery.isLoading ? (
              <ActivityIndicator color={Colors.gold} style={{ marginTop: 20 }} />
            ) : (predictionsQuery.data ?? []).length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyIcon}>{'\uD83D\uDD2E'}</Text>
                <Text style={styles.emptyText}>No predictions available yet</Text>
              </View>
            ) : (
              (predictionsQuery.data ?? []).map((q: any) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onAnswer={handleAnswer}
                  onLock={handleLock}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'buzz' && (
          <>
            {allBuzzPosts.length === 0 && !buzzQuery.isLoading ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyIcon}>{'\uD83D\uDCAC'}</Text>
                <Text style={styles.emptyText}>No buzz yet. Be the first!</Text>
              </View>
            ) : (
              allBuzzPosts.map((post: any, index: number) => (
                <BuzzPost key={post.id ?? `ws-${index}`} post={post} />
              ))
            )}
            {buzzQuery.hasNextPage && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => buzzQuery.fetchNextPage()}
                activeOpacity={0.7}
              >
                {buzzQuery.isFetchingNextPage ? (
                  <ActivityIndicator color={Colors.gold} size="small" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Compose Area */}
            {composerVisible && (
              <View style={styles.composerContainer}>
                <TextInput
                  style={styles.buzzInput}
                  value={buzzText}
                  onChangeText={setBuzzText}
                  placeholder="What's happening?..."
                  placeholderTextColor={Colors.muted}
                  multiline
                  maxLength={280}
                />
                <View style={styles.composerActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setComposerVisible(false);
                      setBuzzText('');
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      buzzText.trim().length === 0 && styles.sendBtnDisabled,
                    ]}
                    onPress={handleSendBuzz}
                    disabled={buzzText.trim().length === 0 || buzzMutation.isPending}
                  >
                    {buzzMutation.isPending ? (
                      <ActivityIndicator color={Colors.bg} size="small" />
                    ) : (
                      <Text style={styles.sendBtnText}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <>
            {/* Event Rating */}
            <View style={styles.statsSection}>
              <BebasText size={18} color={Colors.text}>
                Event Rating
              </BebasText>
              {ratingQuery.isLoading ? (
                <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
              ) : ratingQuery.data ? (
                <View style={styles.ratingCard}>
                  <BebasText size={48} color={Colors.gold}>
                    {(ratingQuery.data.averageRating ?? 0).toFixed(1)}
                  </BebasText>
                  <Text style={styles.ratingCount}>
                    {ratingQuery.data.totalRatings ?? 0} ratings
                  </Text>
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No ratings yet</Text>
                </View>
              )}
            </View>

            {/* Reaction Summary */}
            <View style={styles.statsSection}>
              <BebasText size={18} color={Colors.text}>
                Reactions
              </BebasText>
              {reactions.length > 0 ? (
                <View style={styles.reactionSummary}>
                  {reactions.map((r: any, idx: number) => (
                    <View key={r.emoji ?? idx} style={styles.reactionItem}>
                      <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                      <Text style={styles.reactionCount}>{r.count}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No reactions yet</Text>
                </View>
              )}
            </View>

            {/* Top Moments */}
            <View style={styles.statsSection}>
              <BebasText size={18} color={Colors.text}>
                Top Moments
              </BebasText>
              {momentsQuery.isLoading ? (
                <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
              ) : (momentsQuery.data ?? []).length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No moments captured yet</Text>
                </View>
              ) : (
                (momentsQuery.data ?? []).map((m: any, idx: number) => (
                  <MomentCard key={m.id ?? idx} moment={m} />
                ))
              )}
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Emoji Reaction Bar fixed at bottom */}
      <View style={styles.bottomBar}>
        <EmojiReactionBar eventId={id!} reactions={reactions} />
      </View>

      {/* FAB for Buzz compose */}
      {activeTab === 'buzz' && !composerVisible && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setComposerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  liveText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: '700',
  },
  scoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  period: {
    color: Colors.muted,
    fontSize: 13,
    marginLeft: 'auto',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  venue: {
    color: Colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  dateText: {
    color: Colors.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.gold,
  },
  tabText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.bg,
  },
  tabContent: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptySection: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  loadMoreText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  composerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginTop: 12,
  },
  buzzInput: {
    color: Colors.text,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: Colors.muted,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  sendBtnText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 20,
  },
  ratingCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  ratingCount: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  reactionSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  reactionItem: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionCount: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
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
});
