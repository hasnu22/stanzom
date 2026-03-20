import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS, DEFAULT_SPORT } from '../../constants/sports';
import {
  getEvents,
  getBuzzPosts,
  addBuzzPost,
  getMoments,
  rateEvent,
} from '../../services/eventService';
import { getPredictionCard } from '../../services/predictionService';
import BebasText from '../../components/ui/BebasText';
import LiveScoreCard from '../../components/event/LiveScoreCard';
import BuzzPost from '../../components/event/BuzzPost';
import MomentCard from '../../components/event/MomentCard';
import PredictionResultCard from '../../components/prediction/PredictionResultCard';
import RatingBar from '../../components/ui/RatingBar';

type PostMatchTab = 'results' | 'discuss' | 'moments';

const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\u{1F3C6}', color: Colors.gold }, ...SPORTS];

export default function PostMatchScreen() {
  const queryClient = useQueryClient();
  const [selectedSport, setSelectedSport] = useState<string>(DEFAULT_SPORT);
  const [activeTab, setActiveTab] = useState<PostMatchTab>('results');
  const [reviewText, setReviewText] = useState('');
  const [matchRating, setMatchRating] = useState(0);

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;

  // Fetch completed events
  const completedQuery = useQuery({
    queryKey: ['events', 'COMPLETED', sportSlugParam],
    queryFn: async () => {
      const data = await getEvents({ status: 'COMPLETED', sportSlug: sportSlugParam });
      return data as any[];
    },
  });

  const completedEvent = (completedQuery.data ?? [])[0] ?? null;

  // Prediction result card
  const predictionCardQuery = useQuery({
    queryKey: ['predictions', 'card', completedEvent?.id, 'postmatch'],
    queryFn: async () => {
      const data = await getPredictionCard(completedEvent!.id);
      return data as any;
    },
    enabled: !!completedEvent?.id,
  });

  // Buzz posts for completed event
  const buzzQuery = useQuery({
    queryKey: ['buzz', completedEvent?.id, 'postmatch'],
    queryFn: async () => {
      const data = await getBuzzPosts(completedEvent!.id);
      return data as any[];
    },
    enabled: !!completedEvent?.id && activeTab === 'discuss',
  });

  // Moments
  const momentsQuery = useQuery({
    queryKey: ['moments', completedEvent?.id],
    queryFn: async () => {
      const data = await getMoments(completedEvent!.id);
      return data as any[];
    },
    enabled: !!completedEvent?.id && activeTab === 'moments',
  });

  // Rate event mutation
  const rateMutation = useMutation({
    mutationFn: async () => {
      await rateEvent(completedEvent!.id, { rating: matchRating, reviewText: reviewText || undefined });
    },
    onSuccess: () => {
      Alert.alert('Thanks!', 'Your rating has been submitted.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit rating.');
    },
  });

  // Post review mutation
  const postReviewMutation = useMutation({
    mutationFn: async () => {
      await addBuzzPost(completedEvent!.id, {
        content: reviewText,
        postType: 'HOT_TAKE',
      });
    },
    onSuccess: () => {
      setReviewText('');
      queryClient.invalidateQueries({ queryKey: ['buzz', completedEvent?.id, 'postmatch'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to post review.');
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      completedQuery.refetch(),
      predictionCardQuery.refetch(),
      buzzQuery.refetch(),
      momentsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [completedQuery, predictionCardQuery, buzzQuery, momentsQuery]);

  // Loading
  if (completedQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading post-match data...</Text>
      </View>
    );
  }

  // Error
  if (completedQuery.isError) {
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

  // Empty state
  if (!completedEvent) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centeredContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        <Text style={styles.emptyEmoji}>{'\uD83D\uDCCA'}</Text>
        <BebasText size={24} color={Colors.text}>
          No Completed Events
        </BebasText>
        <Text style={styles.emptySubtext}>
          Post-match analysis will appear here after events finish.
        </Text>
      </ScrollView>
    );
  }

  const TABS: { key: PostMatchTab; label: string }[] = [
    { key: 'results', label: 'Results' },
    { key: 'discuss', label: 'Discuss' },
    { key: 'moments', label: 'Moments' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BebasText size={28} color={Colors.text}>
          Post Match
        </BebasText>
      </View>

      {/* Sport Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {ALL_SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.slug}
            style={[styles.pill, selectedSport === sport.slug && styles.pillActive]}
            onPress={() => setSelectedSport(sport.slug)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>{sport.icon}</Text>
            <Text style={[styles.pillText, selectedSport === sport.slug && styles.pillTextActive]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
          }
          contentContainerStyle={styles.tabContent}
        >
          {/* Final Score */}
          <LiveScoreCard event={completedEvent} />

          {/* Prediction Result */}
          {predictionCardQuery.data && (
            <View style={styles.sectionSpacing}>
              <BebasText size={20} color={Colors.text}>
                Your Prediction Results
              </BebasText>
              <View style={{ marginTop: 10 }}>
                <PredictionResultCard card={predictionCardQuery.data} />
              </View>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingCard}>
            <BebasText size={20} color={Colors.text}>
              Rate this match
            </BebasText>
            <View style={styles.ratingStars}>
              <RatingBar
                rating={matchRating}
                readonly={false}
                onRate={setMatchRating}
                size={32}
              />
            </View>
            {matchRating > 0 && (
              <TouchableOpacity
                style={[styles.submitRatingButton, rateMutation.isPending && { opacity: 0.5 }]}
                onPress={() => rateMutation.mutate()}
                disabled={rateMutation.isPending}
                activeOpacity={0.7}
              >
                {rateMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.bg} />
                ) : (
                  <Text style={styles.submitRatingText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* MVP / Highlights Placeholder */}
          <View style={styles.highlightsCard}>
            <BebasText size={18} color={Colors.muted}>
              {'\u{1F31F}'} Match Highlights
            </BebasText>
            <Text style={styles.highlightsPlaceholder}>
              Highlights and MVP will be available soon.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* DISCUSS TAB */}
      {activeTab === 'discuss' && (
        <View style={styles.discussContainer}>
          {buzzQuery.isLoading ? (
            <View style={styles.centeredInner}>
              <ActivityIndicator color={Colors.gold} />
            </View>
          ) : (buzzQuery.data ?? []).length === 0 ? (
            <View style={styles.centeredInner}>
              <Text style={styles.emptyDiscussEmoji}>{'\uD83D\uDCAC'}</Text>
              <Text style={styles.emptyDiscussText}>No discussion posts yet. Share your thoughts!</Text>
            </View>
          ) : (
            <FlatList
              data={buzzQuery.data}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => <BuzzPost post={item} />}
              contentContainerStyle={styles.buzzList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
              }
            />
          )}

          {/* Review Input */}
          <View style={styles.reviewInputContainer}>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your review..."
              placeholderTextColor={Colors.muted}
              value={reviewText}
              onChangeText={setReviewText}
              maxLength={280}
            />
            <TouchableOpacity
              style={[
                styles.reviewSendButton,
                (!reviewText.trim() || postReviewMutation.isPending) && { opacity: 0.4 },
              ]}
              onPress={() => postReviewMutation.mutate()}
              disabled={!reviewText.trim() || postReviewMutation.isPending}
              activeOpacity={0.7}
            >
              {postReviewMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.bg} />
              ) : (
                <Text style={styles.reviewSendText}>{'\u2191'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MOMENTS TAB */}
      {activeTab === 'moments' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
          }
          contentContainerStyle={styles.tabContent}
        >
          {momentsQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 24 }} />
          ) : (momentsQuery.data ?? []).length === 0 ? (
            <View style={styles.emptyMoments}>
              <Text style={styles.emptyMomentsEmoji}>{'\u{1F31F}'}</Text>
              <BebasText size={20} color={Colors.text}>
                No Moments Yet
              </BebasText>
              <Text style={styles.emptyMomentsSubtext}>
                Top moments from the match will appear here.
              </Text>
            </View>
          ) : (
            <>
              <BebasText size={20} color={Colors.text}>
                Top Moments
              </BebasText>
              <View style={{ marginTop: 12 }}>
                {(momentsQuery.data ?? []).map((m: any, i: number) => (
                  <MomentCard key={m.id ?? i} moment={m} />
                ))}
              </View>
            </>
          )}

          {/* Most liked buzz posts */}
          {(buzzQuery.data ?? []).length > 0 && (
            <View style={styles.mostLikedSection}>
              <BebasText size={20} color={Colors.text}>
                Most Liked Posts
              </BebasText>
              <View style={{ marginTop: 12 }}>
                {(buzzQuery.data ?? [])
                  .sort((a: any, b: any) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
                  .slice(0, 5)
                  .map((post: any) => (
                    <BuzzPost key={post.id} post={post} />
                  ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: Colors.gold,
  },
  pillIcon: {
    fontSize: 16,
  },
  pillText: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.gold,
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
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Colors.bg,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  ratingCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ratingStars: {
    marginTop: 12,
  },
  submitRatingButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  submitRatingText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  highlightsCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  highlightsPlaceholder: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 8,
  },
  discussContainer: {
    flex: 1,
  },
  buzzList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyDiscussEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyDiscussText: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  reviewInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    gap: 10,
  },
  reviewInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  reviewSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewSendText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMoments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyMomentsEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyMomentsSubtext: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  mostLikedSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
