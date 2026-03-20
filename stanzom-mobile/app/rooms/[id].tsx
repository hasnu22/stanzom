import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../constants/colors';
import {
  getRoomById,
  getMessages,
  sendMessage,
  SendMessageData,
} from '../../services/fanroomService';
import { useAuth } from '../../hooks/useAuth';
import BebasText from '../../components/ui/BebasText';
import MessageBubble from '../../components/fanroom/MessageBubble';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  messageType?: string;
  createdAt: string;
}

export default function FanRoomChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [wsMessages, setWsMessages] = useState<ChatMessage[]>([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const clientRef = useRef<Client | null>(null);

  const roomQuery = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const { data } = await getRoomById(id!);
      return data as any;
    },
    enabled: !!id,
  });

  const messagesQuery = useQuery({
    queryKey: ['room', id, 'messages'],
    queryFn: async () => {
      const { data } = await getMessages(id!);
      return (data as ChatMessage[]).reverse(); // newest at bottom
    },
    enabled: !!id,
  });

  // WebSocket connection for live messages
  useEffect(() => {
    if (!id) return;

    let client: Client;

    const connectWs = async () => {
      const token = await SecureStore.getItemAsync('accessToken');

      client = new Client({
        webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          setIsWsConnected(true);
          client.subscribe(
            `/topic/fanroom/${id}/messages`,
            (message: IMessage) => {
              const msg = JSON.parse(message.body) as ChatMessage;
              setWsMessages((prev) => [...prev, msg]);
            },
          );
        },
        onDisconnect: () => setIsWsConnected(false),
        onStompError: () => setIsWsConnected(false),
      });

      client.activate();
      clientRef.current = client;
    };

    connectWs();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsWsConnected(false);
      }
    };
  }, [id]);

  const sendMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await sendMessage(id!, data);
      return response.data;
    },
    onSuccess: () => {
      setMessageText('');
    },
  });

  const allMessages = [
    ...(messagesQuery.data ?? []),
    ...wsMessages,
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    if (allMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  const handleSend = () => {
    if (messageText.trim().length === 0) return;
    sendMutation.mutate({ content: messageText.trim() });
  };

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        message={item}
        isOwn={item.userId === user?.id}
      />
    ),
    [user?.id],
  );

  if (roomQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  if (roomQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load room
        </BebasText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => roomQuery.refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const room = roomQuery.data;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room?.name ?? 'Fan Room'}
          </Text>
          <Text style={styles.memberCount}>
            {room?.memberCount ?? 0} members
            {isWsConnected && (
              <Text style={styles.onlineIndicator}> {'\u00B7'} Online</Text>
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() =>
            router.push(`/rooms/invite?roomId=${id}` as any)
          }
          activeOpacity={0.7}
        >
          <Text style={styles.inviteBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messagesQuery.isLoading ? (
        <View style={styles.messageLoading}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      ) : allMessages.length === 0 ? (
        <View style={styles.emptyMessages}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCAC'}</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Be the first to say something!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item, index) => item.id ?? `msg-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.muted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            messageText.trim().length === 0 && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={messageText.trim().length === 0 || sendMutation.isPending}
          activeOpacity={0.7}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color={Colors.bg} size="small" />
          ) : (
            <Text style={styles.sendBtnText}>{'\u27A4'}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  roomName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  memberCount: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  onlineIndicator: {
    color: Colors.green,
  },
  inviteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnText: {
    color: Colors.bg,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  messageLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessages: {
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.bg,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  sendBtnText: {
    color: Colors.bg,
    fontSize: 18,
  },
});
