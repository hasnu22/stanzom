import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS } from '../../constants/sports';
import { getPunditPosts, createPost, CreatePunditPostData } from '../../services/punditService';
import { getEvents } from '../../services/eventService';
import BebasText from '../../components/ui/BebasText';
import PunditPost from '../../components/pundit/PunditPost';
import PunditFilters from '../../components/pundit/PunditFilters';

const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\uD83C\uDFC6', color: Colors.gold }, ...SPORTS];

export default function PunditScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedSport, setSelectedSport] = useState('all');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [takeText, setTakeText] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;

  const postsQuery = useInfiniteQuery({
    queryKey: ['pundit', sportSlugParam, activeFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await getPunditPosts({
        sportSlug: sportSlugParam,
        sort: activeFilter,
        page: pageParam,
      });
      return data as any;
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (!lastPage || (Array.isArray(lastPage) && lastPage.length < 20)) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  const eventsQuery = useQuery({
    queryKey: ['events', 'UPCOMING', sportSlugParam, 'pundit-modal'],
    queryFn: async () => {
      const { data } = await getEvents({ status: 'UPCOMING', sportSlug: sportSlugParam });
      return data as any[];
    },
    enabled: modalVisible,
  });

  const createMutation = useMutation({
    mutationFn: async (postData: CreatePunditPostData) => {
      const { data } = await createPost(postData);
      return data;
    },
    onSuccess: () => {
      setTakeText('');
      setSelectedEventId('');
      setModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['pundit'] });
    },
  });

  const allPosts = postsQuery.data?.pages?.flat() ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await postsQuery.refetch();
    setRefreshing(false);
  }, [postsQuery]);

  const handleSubmitPost = () => {
    if (takeText.trim().length === 0 || !selectedEventId) return;
    createMutation.mutate({
      eventId: selectedEventId,
      content: takeText.trim(),
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => <PunditPost post={item} />,
    [],
  );

  const renderHeader = () => (
    <>
      {/* Sport Selector Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {ALL_SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.slug}
            style={[
              styles.pill,
              selectedSport === sport.slug && styles.pillActive,
            ]}
            onPress={() => setSelectedSport(sport.slug)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>{sport.icon}</Text>
            <Text
              style={[
                styles.pillText,
                selectedSport === sport.slug && styles.pillTextActive,
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters */}
      <PunditFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </>
  );

  const renderEmpty = () => {
    if (postsQuery.isLoading) return null;
    return (
      <View style={styles.emptySection}>
        <Text style={styles.emptyIcon}>{'\uD83E\uDD14'}</Text>
        <Text style={styles.emptyText}>No pundit posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share your take!</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (postsQuery.isFetchingNextPage) {
      return <ActivityIndicator color={Colors.gold} style={{ marginVertical: 20 }} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          THE PUNDIT
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      {postsQuery.isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : postsQuery.isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
          <BebasText size={22} color={Colors.red}>
            Failed to load posts
          </BebasText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allPosts}
          keyExtractor={(item: any, index: number) => item.id ?? `p-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
          onEndReached={() => {
            if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
              postsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <BebasText size={24} color={Colors.gold}>
                Your Take
              </BebasText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>

            {/* Event Selector */}
            <Text style={styles.fieldLabel}>Select Event</Text>
            {eventsQuery.isLoading ? (
              <ActivityIndicator color={Colors.gold} style={{ marginVertical: 12 }} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventPills}
              >
                {(eventsQuery.data ?? []).map((event: any) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventPill,
                      selectedEventId === event.id && styles.eventPillActive,
                    ]}
                    onPress={() => setSelectedEventId(event.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.eventPillText,
                        selectedEventId === event.id && styles.eventPillTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {event.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Take Text */}
            <Text style={styles.fieldLabel}>Your Take</Text>
            <TextInput
              style={styles.textArea}
              value={takeText}
              onChangeText={setTakeText}
              placeholder="Share your prediction or hot take..."
              placeholderTextColor={Colors.muted}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (takeText.trim().length === 0 || !selectedEventId) &&
                  styles.submitBtnDisabled,
              ]}
              onPress={handleSubmitPost}
              disabled={
                takeText.trim().length === 0 ||
                !selectedEventId ||
                createMutation.isPending
              }
              activeOpacity={0.7}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.bg} size="small" />
              ) : (
                <BebasText
                  size={18}
                  color={
                    takeText.trim().length === 0 || !selectedEventId
                      ? Colors.muted
                      : Colors.bg
                  }
                >
                  Post Take
                </BebasText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
  loadingContainer: {
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  pillsContainer: {
    gap: 8,
    paddingVertical: 8,
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
  emptySection: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
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
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    color: Colors.muted,
    fontSize: 20,
  },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  eventPills: {
    gap: 8,
    paddingVertical: 4,
  },
  eventPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    maxWidth: 180,
  },
  eventPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  eventPillText: {
    color: Colors.muted,
    fontSize: 13,
  },
  eventPillTextActive: {
    color: Colors.bg,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
});
