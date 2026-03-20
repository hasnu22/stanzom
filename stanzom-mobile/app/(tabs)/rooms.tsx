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
  Alert,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS } from '../../constants/sports';
import { getMyRooms, createRoom, joinByCode, CreateRoomData } from '../../services/fanroomService';
import BebasText from '../../components/ui/BebasText';
import RoomCard from '../../components/fanroom/RoomCard';

export default function RoomsScreen() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSport, setNewRoomSport] = useState<string | undefined>(undefined);
  const [inviteCode, setInviteCode] = useState('');

  const roomsQuery = useQuery({
    queryKey: ['myRooms'],
    queryFn: async () => {
      const data = await getMyRooms();
      return data as any[];
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateRoomData = { name: newRoomName };
      if (newRoomSport) payload.sportSlug = newRoomSport;
      await createRoom(payload);
    },
    onSuccess: () => {
      setNewRoomName('');
      setNewRoomSport(undefined);
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['myRooms'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create room. Please try again.');
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      await joinByCode(inviteCode.trim());
    },
    onSuccess: () => {
      setInviteCode('');
      setShowJoinModal(false);
      queryClient.invalidateQueries({ queryKey: ['myRooms'] });
      Alert.alert('Joined!', 'You have successfully joined the room.');
    },
    onError: () => {
      Alert.alert('Error', 'Invalid invite code or unable to join room.');
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await roomsQuery.refetch();
    setRefreshing(false);
  }, [roomsQuery]);

  const rooms = roomsQuery.data ?? [];

  // Loading state
  if (roomsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  // Error state
  if (roomsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load rooms
        </BebasText>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BebasText size={28} color={Colors.text}>
          Fan Rooms
        </BebasText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>{'\uD83C\uDFE0'}</Text>
          <BebasText size={22} color={Colors.text}>
            No rooms yet
          </BebasText>
          <Text style={styles.emptySubtext}>
            Create one or join with an invite code!
          </Text>
          <TouchableOpacity
            style={styles.joinCodeButton}
            onPress={() => setShowJoinModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.joinCodeButtonText}>Join with Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <RoomCard room={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.joinCodeButtonBottom}
              onPress={() => setShowJoinModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.joinCodeButtonBottomText}>
                {'\uD83D\uDD11'} Join with Code
              </Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Create Room Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCreateModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <BebasText size={22} color={Colors.text}>
              Create a Fan Room
            </BebasText>

            <Text style={styles.inputLabel}>Room Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. CSK Super Fans"
              placeholderTextColor={Colors.muted}
              value={newRoomName}
              onChangeText={setNewRoomName}
              maxLength={50}
              autoFocus
            />

            <Text style={styles.inputLabel}>Sport (optional)</Text>
            <View style={styles.sportPills}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.slug}
                  style={[
                    styles.sportPill,
                    newRoomSport === sport.slug && styles.sportPillActive,
                  ]}
                  onPress={() =>
                    setNewRoomSport(newRoomSport === sport.slug ? undefined : sport.slug)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sportPillIcon}>{sport.icon}</Text>
                  <Text
                    style={[
                      styles.sportPillText,
                      newRoomSport === sport.slug && styles.sportPillTextActive,
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                (!newRoomName.trim() || createRoomMutation.isPending) && styles.actionButtonDisabled,
              ]}
              onPress={() => createRoomMutation.mutate()}
              disabled={!newRoomName.trim() || createRoomMutation.isPending}
              activeOpacity={0.7}
            >
              {createRoomMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.bg} />
              ) : (
                <Text style={styles.actionButtonText}>Create Room</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join with Code Modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowJoinModal(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <BebasText size={22} color={Colors.text}>
              Join with Invite Code
            </BebasText>

            <TextInput
              style={[styles.textInput, { marginTop: 16 }]}
              placeholder="Enter invite code"
              placeholderTextColor={Colors.muted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.actionButton,
                (!inviteCode.trim() || joinMutation.isPending) && styles.actionButtonDisabled,
              ]}
              onPress={() => joinMutation.mutate()}
              disabled={!inviteCode.trim() || joinMutation.isPending}
              activeOpacity={0.7}
            >
              {joinMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.bg} />
              ) : (
                <Text style={styles.actionButtonText}>Join Room</Text>
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
  createButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  joinCodeButton: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinCodeButtonText: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  joinCodeButtonBottom: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  joinCodeButtonBottomText: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.muted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sportPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 4,
  },
  sportPillActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.15)',
  },
  sportPillIcon: {
    fontSize: 14,
  },
  sportPillText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  sportPillTextActive: {
    color: Colors.gold,
  },
  actionButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});
