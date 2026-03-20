import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS } from '../../constants/sports';
import api from '../../services/api';
import BebasText from '../../components/ui/BebasText';
import InfluencerCard from '../../components/influencer/InfluencerCard';
import BecomeInfluencer from '../../components/influencer/BecomeInfluencer';

const NICHES = ['ALL', 'ANALYSIS', 'FANTASY', 'COMEDY', 'REGIONAL'];
const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\uD83C\uDFC6', color: Colors.gold }, ...SPORTS];

export default function InfluencersScreen() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedNiche, setSelectedNiche] = useState('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBecomeForm, setShowBecomeForm] = useState(false);

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;
  const nicheParam = selectedNiche === 'ALL' ? undefined : selectedNiche;

  const influencersQuery = useQuery({
    queryKey: ['influencers', sportSlugParam, nicheParam, featuredOnly],
    queryFn: async () => {
      const { data } = await api.get('/api/influencers', {
        params: {
          sportSlug: sportSlugParam,
          niche: nicheParam,
          featured: featuredOnly || undefined,
        },
      });
      return data as any[];
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/api/influencers/apply', formData);
      return data;
    },
    onSuccess: () => {
      setShowBecomeForm(false);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await influencersQuery.refetch();
    setRefreshing(false);
  }, [influencersQuery]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        onPress={() => router.push(`/influencers/${item.id}`)}
        activeOpacity={0.7}
      >
        <InfluencerCard influencer={item} />
      </TouchableOpacity>
    ),
    [router],
  );

  const renderHeader = () => (
    <>
      {/* Sport Selector */}
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

      {/* Niche Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.nichePills}
      >
        {NICHES.map((niche) => (
          <TouchableOpacity
            key={niche}
            style={[
              styles.nichePill,
              selectedNiche === niche && styles.nichePillActive,
            ]}
            onPress={() => setSelectedNiche(niche)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.nicheText,
                selectedNiche === niche && styles.nicheTextActive,
              ]}
            >
              {niche}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Featured</Text>
        <Switch
          value={featuredOnly}
          onValueChange={setFeaturedOnly}
          trackColor={{ false: Colors.cardBorder, true: Colors.gold }}
          thumbColor={featuredOnly ? Colors.bg : Colors.muted}
        />
      </View>
    </>
  );

  const renderEmpty = () => {
    if (influencersQuery.isLoading) return null;
    return (
      <View style={styles.emptySection}>
        <Text style={styles.emptyIcon}>{'\uD83C\uDF1F'}</Text>
        <Text style={styles.emptyText}>No influencers found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerSection}>
      {!showBecomeForm ? (
        <TouchableOpacity
          style={styles.becomeBtn}
          onPress={() => setShowBecomeForm(true)}
          activeOpacity={0.7}
        >
          <BebasText size={18} color={Colors.bg}>
            Become an Influencer
          </BebasText>
        </TouchableOpacity>
      ) : (
        <BecomeInfluencer onSubmit={(data) => applyMutation.mutate(data)} />
      )}
      <View style={{ height: 40 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.text}>
          INFLUENCERS
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      {influencersQuery.isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading influencers...</Text>
        </View>
      ) : influencersQuery.isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
          <BebasText size={22} color={Colors.red}>
            Failed to load influencers
          </BebasText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={influencersQuery.data ?? []}
          keyExtractor={(item: any) => item.id}
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
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 20,
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
  nichePills: {
    gap: 8,
    paddingVertical: 8,
  },
  nichePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  nichePillActive: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  nicheText: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  nicheTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  toggleLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
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
  footerSection: {
    marginTop: 20,
  },
  becomeBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
