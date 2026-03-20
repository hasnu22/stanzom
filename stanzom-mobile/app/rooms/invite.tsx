import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { inviteContact } from '../../services/fanroomService';
import { useContacts } from '../../hooks/useContacts';
import BebasText from '../../components/ui/BebasText';
import ContactsList from '../../components/fanroom/ContactsList';

export default function InviteScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { getContactsForRoom, isLoading: contactsLoading, error: contactsError } =
    useContacts();

  const [onStanzom, setOnStanzom] = useState<any[]>([]);
  const [notYet, setNotYet] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadContacts = useCallback(async () => {
    if (!roomId) return;
    const result = await getContactsForRoom(roomId);
    setOnStanzom(result.onStanzom);
    setNotYet(result.notYet);
    setHasLoaded(true);
  }, [roomId, getContactsForRoom]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const addMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Add existing Stanzom user to the room
      const { data } = await inviteContact(roomId!, {
        phoneNumber: '',
        name: '',
      });
      return data;
    },
    onSuccess: () => {
      Alert.alert('Added', 'User has been invited to the room');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add user. Please try again.');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data } = await inviteContact(roomId!, { phoneNumber });
      return data;
    },
    onSuccess: () => {
      Alert.alert('Invited', 'Invitation sent via SMS');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to send invite. Please try again.');
    },
  });

  const handleAdd = (userId: string) => {
    addMutation.mutate(userId);
  };

  const handleInvite = (phoneNumber: string) => {
    inviteMutation.mutate(phoneNumber);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={24} color={Colors.text}>
          Invite Contacts
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      {/* Content */}
      {contactsLoading && !hasLoaded ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Reading contacts...</Text>
          <Text style={styles.loadingSubtext}>
            This may take a moment
          </Text>
        </View>
      ) : contactsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
          <BebasText size={20} color={Colors.red}>
            Permission Required
          </BebasText>
          <Text style={styles.errorText}>{contactsError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadContacts}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : hasLoaded && onStanzom.length === 0 && notYet.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCDE'}</Text>
          <BebasText size={20} color={Colors.text}>
            No Contacts Found
          </BebasText>
          <Text style={styles.emptyText}>
            No contacts available to invite
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <ContactsList
            onStanzom={onStanzom}
            notYet={notYet}
            onAdd={handleAdd}
            onInvite={handleInvite}
          />
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
