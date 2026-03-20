import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';

interface ScoreData {
  [key: string]: any;
}

interface BuzzPost {
  id: string;
  content: string;
  postType: string;
  [key: string]: any;
}

interface ReactionData {
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  scoreData: ScoreData | null;
  buzzPosts: BuzzPost[];
  reactions: ReactionData | null;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

export const useWebSocket = (eventId: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [buzzPosts, setBuzzPosts] = useState<BuzzPost[]>([]);
  const [reactions, setReactions] = useState<ReactionData | null>(null);
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(async () => {
    if (!eventId) return;

    const token = await SecureStore.getItemAsync('accessToken');

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setIsConnected(true);

        client.subscribe(`/topic/event/${eventId}/score`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          setScoreData(data);
        });

        client.subscribe(`/topic/event/${eventId}/buzz`, (message: IMessage) => {
          const post = JSON.parse(message.body);
          setBuzzPosts((prev) => [post, ...prev]);
        });

        client.subscribe(`/topic/event/${eventId}/reactions`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          setReactions(data);
        });

        client.subscribe('/user/queue/notifications', (message: IMessage) => {
          const notification = JSON.parse(message.body);
          // Notification handling is delegated to the notification store
          // Consumers can listen via the notificationStore
          console.log('WS notification received:', notification);
        });
      },

      onDisconnect: () => {
        setIsConnected(false);
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.message);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [eventId]);

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnected(false);
      }
    };
  }, [connect]);

  return { isConnected, scoreData, buzzPosts, reactions };
};
