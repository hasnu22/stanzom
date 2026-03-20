import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getMyRooms } from '../../services/fanroomService';

interface RoomPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
}

interface Room {
  id: string;
  name: string;
  memberCount: number;
}

const RoomPickerModal: React.FC<RoomPickerModalProps> = ({
  visible,
  onClose,
  onSelectRoom,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['myRooms'],
    queryFn: () => getMyRooms(),
    enabled: visible,
  });

  const rooms: Room[] = data ?? [];

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => onSelectRoom(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.memberCount}>
          {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Share to Room</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.gold}
              style={styles.loader}
            />
          ) : rooms.length === 0 ? (
            <Text style={styles.emptyText}>
              No rooms yet. Create a room first!
            </Text>
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item) => item.id}
              renderItem={renderRoom}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    color: Colors.text,
  },
  closeBtn: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  memberCount: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    color: Colors.muted,
    fontSize: 18,
  },
  loader: {
    padding: 40,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: 'center',
    padding: 40,
  },
});

export default RoomPickerModal;
